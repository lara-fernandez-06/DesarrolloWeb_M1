var infoMatrix = [];
const defaultDim=18;
const defaultTreasure=40;


//dimension por defecto es 18x18
function generateMap(dimension=defaultDim, treasures=defaultTreasure){
    
    //control de errores: no puede haber mas tesoros que el cuadrado de la dim (los tesoros seran un 25% del tablero)
    if(treasures>=dimension*dimension) treasures = Math.floor(0.25*dimension*dimension);

    //inicializamos matriz
    createMatrix(dimension);

    //primero rellenamos la matriz que guarda la información (donde están los tesoros (-1) y los números)
    generateTreasures(dimension, treasures);

    //ponemos los numeros segun el numero de tesoros que tengan alrededor
    generateMapNumbers(dimension);

    printMatrix(infoMatrix);

}

function createMatrix(dimension=defaultDim){

    let gridString="";

    infoMatrix = Array(dimension);
    for(let i=0; i<dimension; i++){

        infoMatrix[i] = Array(dimension).fill(0);
        gridString+="<tr>";

        for(let j=0; j<dimension; j++){
            let pos = i*dimension + j;
            //dar un umero a cada celda?
            gridString+="<td onclick='manageLeftClick()'></td>";
        }

        gridString+="</tr>";
    }

    document.getElementById('board').innerHTML = gridString;
    
}

function generateTreasures(dimension=defaultDim, treasures=defaultTreasure){
    
    let cont=0;
    let max=dimension*dimension; //para evitar hacer esta operacion todo el rato
    //hasta que todas los tesoros hayan sido colocadas

    while(cont<treasures){

        let pos=Math.floor(Math.random()*max); //numero de la casilla de la mina
        
        //posicion en la matriz
        let i = Math.floor(pos/dimension);
        let j = pos - i * dimension;

        if(infoMatrix[i][j] != -1){
            infoMatrix[i][j] = -1;
            cont++;
        }
    }
    
}

function generateMapNumbers(dimension=defaultDim){

    // [] [] [] [] []
    // [] [x] [] [9] []
    // [] [] [] [] []

    const rodeoX = [-1, 0, 1, 1, 1, 0, -1, -1];
    const rodeoY = [-1, -1, -1, 0, 1, 1, 1, 0];

    //recorremos toda la matriz, mirando alrededor de la casilla actual para contar los tesoros
    for(let i = 0; i<infoMatrix.length; i++){
        for(let j = 0; j<infoMatrix[i].length; j++){

            //si ya es un tesoro, no hace falta hacer nada
            if(infoMatrix[i][j]!=-1){
                
                let cont = 0;
                for(let k=0; k<8; k++){
                    let nuevaI = i+rodeoX[k];
                    let nuevaJ = j+rodeoY[k];

                    //miramos que lo que estamos comprobanod esta dentro del tablero
                    if(nuevaI>=0 && nuevaJ >=0 && nuevaI<dimension && nuevaJ<dimension){
                        //si hay tesoro, aumenta el contador
                        if(infoMatrix[nuevaI][nuevaJ]==-1)cont++;
                    }

                }

                infoMatrix[i][j] = cont;

            }

        
        }
    }


}

//funcion para debug
function printMatrix(matrix){

    for(let i = 0; i<matrix.length; i++){
        let string = i+": ";
        for(let j = 0; j<matrix[i].length; j++){
            string += matrix[i][j]+" ";
        }
        console.log(string);
    }

}

function manageLeftClick(){
    alert("click izquierdo");
    
}