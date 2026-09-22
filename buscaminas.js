const defaultDimX=14;
const defaultDimY=18;
const defaultTreasure=40;

/*COLORES TABLERO*/
const unrevealedColor = 0;
const revealedColor = 0;
const lightDefaultPalette = [
    []
]

const board = document.getElementById("board");
let infoMatrix;


//dimension por defecto es 14x18
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
    /*const cellInfo = {mineNumber:0, discovered: false, flagged:false};*/

    for(let i=0; i<dimensionX; i++){

        infoMatrix[i] = Array(dimensionY).fill(0);
        gridString+="<div class='row'>";

        for(let j=0; j<dimensionY; j++){
            //casiilas pares impares
            gridString+=`<div class='cell `;
            (i+j)%2 ? gridString+=`odd' `: gridString+=`even' `;
            gridString+=`onclick='boardLeftClick(${i}, ${j})' oncontextmenu='boardRightClick(event, ${i}, ${j})'></div>`;

        }

        gridString+="</div>";
    }

    
    board.innerHTML = gridString;

    //esto crea una variable en board que pueden usar todos sus hijos
    board.style.setProperty("--columns", dimensionY);
    board.style.setProperty("--rows", dimensionX);

    return infoMatrix;
    
}

function generateTreasures(infoMatrix = createMatrix(defaultDimX, defaultDimY), treasures=defaultTreasure){
    
    let cont=0;
    let max=infoMatrix.length*infoMatrix[0].length; //para evitar hacer esta operacion todo el rato
    //hasta que todas los tesoros hayan sido colocadas

    while(cont<treasures){

        //numero de casilla
        let num=Math.floor(Math.random()*max); //numero de la casilla de la mina
        
        //calculamos las posiciones en la matriz (i, j)
        const positions = getPostionFromNumber(num);

        /*let i = Math.floor(pos/infoMatrix[0].length);
        let j = pos - i * infoMatrix[0].length;*/

        if(infoMatrix[positions[0]][positions[1]] !== -1){
            infoMatrix[positions[0]][positions[1]] = -1;
            cont++;
        }
    }
    
}

function generateMapNumbers(infoMatrix = createMatrix(defaultDim)){

    // [] [] [] [] []
    // [] [x] [] [] []
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

    infoMatrix[i][j]===-1 ? alert("BOOM") : infoMatrix[i][j]===0 ? clearZeroes(i, j) : revealNumber(i, j);

}

function revealNumber(i=-1, j=-1){
    if(i<0 || j<0){
        console.error("Error");
        return;
    } 

    const cell = board.children[i].children[j];

    if(infoMatrix[i][j]!==0) cell.innerHTML=infoMatrix[i][j];

    //TEMP
    (i+j)%2 ? cell.style.backgroundColor = '#d8a48f' : cell.style.backgroundColor = '#bb8588';

}

function clearZeroes(i=-1, j=-1){

    if(i<0 || j<0){
        console.error("Error");
        return;
    } 

    //la cola de casillas 0 que tenemos que limpiar
    const queue = [];
    const visited = []; //guardamos las casillas con ceros que ya hemos visitado
    const rodeoX = [-1, 0, 1, 1, 1, 0, -1, -1];
    const rodeoY = [-1, -1, -1, 0, 1, 1, 1, 0];

    revealNumber(i, j);

    queue.push(getNumberFromPositions(i, j));
    while(queue.length>0){

        visited.push(queue[0]);
        positions = getPostionFromNumber(queue[0]);

        for(let k=0; k<8; k++){
            let nuevaI = positions[0]+rodeoX[k];
            let nuevaJ = positions[1]+rodeoY[k];

            if(nuevaI>=0 && nuevaJ >=0 && nuevaI<infoMatrix.length && nuevaJ<infoMatrix[0].length){

                const num = getNumberFromPositions(nuevaI, nuevaJ);

                const boolVisited = !(visited.includes(num));
                const boolQ = !(queue.includes(num));

                if(infoMatrix[nuevaI][nuevaJ]===0 &&  boolVisited && boolQ) queue.push(num);

                revealNumber(nuevaI, nuevaJ);

            }

        }

        queue.shift();

    }


}

function boardRightClick(event, i=-1, j=-1){

    if(i<0 || j<0){
        console.error("Error");
        return;
    } 

    event.preventDefault();

    
    board.children[i].children[j].style.backgroundImage = "url('media/img/flag.png')";
    

}

function getPostionFromNumber(num){

    const positions=[];

    positions.push(Math.floor(num/infoMatrix[0].length));
    positions.push(num - positions[0]*infoMatrix[0].length);

    return positions;

}

function getNumberFromPositions(i, j){

    return i*infoMatrix[0].length + j;

}

