const defaultDimX=14;
const defaultDimY=18;
const defaultTreasure=40;

let infoMatrix;


//dimension por defecto es 18x18
function generateMap(dimensionX=defaultDimX, dimensionY=defaultDimY, treasures=defaultTreasure){
    
    //control de errores: no puede haber mas tesoros que el cuadrado de la dim (los tesoros seran un 25% del tablero)
    if(treasures>=dimensionX*dimensionY) treasures = Math.floor(0.25*dimensionX*dimensionY);

    //inicializamos matriz
    infoMatrix = createMatrix(dimensionX, dimensionY);

    //primero rellenamos la matriz que guarda la información (donde están los tesoros (-1) y los números)
    generateTreasures(infoMatrix, treasures);

    //ponemos los numeros segun el numero de tesoros que tengan alrededor
    generateMapNumbers(infoMatrix);

    printMatrix(infoMatrix);

}

function createMatrix(dimensionX=defaultDimX, dimensionY=defaultDimY){

    let gridString="";
    let infoMatrix = Array(dimensionX);

    for(let i=0; i<dimensionX; i++){

        infoMatrix[i] = Array(dimensionY).fill(0);
        gridString+="<div class='row'>";

        for(let j=0; j<dimensionY; j++){
            //dar un umero a cada celda? parametros en la funcion
            gridString+="<div onclick='boardLeftClick(${i}, ${j})'></div>";
        }

        gridString+="</div>";
    }

    document.getElementById('board').innerHTML = gridString;

    return infoMatrix;
    
}

function generateTreasures(infoMatrix = createMatrix(defaultDimX, defaultDimY), treasures=defaultTreasure){
    
    let cont=0;
    let max=infoMatrix.length*infoMatrix[0].length; //para evitar hacer esta operacion todo el rato
    //hasta que todas los tesoros hayan sido colocadas

    while(cont<treasures){

        let pos=Math.floor(Math.random()*max); //numero de la casilla de la mina
        
        //posicion en la matriz
        let i = Math.floor(pos/infoMatrix[0].length);
        let j = pos - i * infoMatrix[0].length;

        if(infoMatrix[i][j] !== -1){
            infoMatrix[i][j] = -1;
            cont++;
        }
    }
    
}

function generateMapNumbers(infoMatrix = createMatrix(defaultDim)){

    // [] [] [] [] []
    // [] [x] [] [9] []
    // [] [] [] [] []

    const rodeoX = [-1, 0, 1, 1, 1, 0, -1, -1];
    const rodeoY = [-1, -1, -1, 0, 1, 1, 1, 0];

    //recorremos toda la matriz, mirando alrededor de la casilla actual para contar los tesoros
    for(let i = 0; i<infoMatrix.length; i++){
        for(let j = 0; j<infoMatrix[i].length; j++){

            //si ya es un tesoro, no hace falta hacer nada
            if(infoMatrix[i][j]!==-1){
                
                let cont = 0;
                for(let k=0; k<8; k++){
                    let nuevaI = i+rodeoX[k];
                    let nuevaJ = j+rodeoY[k];

                    //miramos que lo que estamos comprobanod esta dentro del tablero
                    if(nuevaI>=0 && nuevaJ >=0 && nuevaI<infoMatrix.length && nuevaJ<infoMatrix[0].length){
                        //si hay tesoro, aumenta el contador
                        if(infoMatrix[nuevaI][nuevaJ]===-1)cont++;
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

function boardLeftClick(i=-1, j=-1){
    if(i<0 || j<0){
        console.error("Error");
        return;
    } 

    
    
}