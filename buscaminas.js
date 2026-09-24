const defaultDimX=14;
const defaultDimY=18;
const defaultMines=40;

/*COLORES TABLERO*/
const lightDefaultPalette = {
    evenUndiscoveredClass: "evenUndiscoveredDefault",
    oddUndiscoveredClass: "oddUndiscoveredDefault",
    evenDiscoveredClass: "evenDiscoveredDefault",
    oddDiscoveredClass: "oddDiscoveredDefault",
    bodyBackgroundClass: "bodyBackgroundDefault"
}

//aqui guardaremos la informacion de los colores/modo que se este utilizando ahora
let currentPalette = lightDefaultPalette; //esta sera la por defecto 

const board = document.querySelector("#board");
let infoMatrix;


generateMap();

//dimension por defecto es 14x18
function generateMap(dimensionX=defaultDimX, dimensionY=defaultDimY, mines=defaultMines){
    
    //control de errores: no puede haber mas minas que el cuadrado de la dim (las minas seran un 25% del tablero)
    if(mines>=dimensionX*dimensionY) mines = Math.floor(0.25*dimensionX*dimensionY);

    //inicializamos matriz logica
    infoMatrix = createInfoMatrix(dimensionX, dimensionY);

    //creamos el tablero en la web
    createWebMatrix(dimensionX, dimensionY, mines);

    //primero rellenamos la matriz que guarda la información (donde están las minas (-1) y los números)
    generateMines(mines);

    //ponemos los numeros segun el numero de minas que tengan alrededor
    generateMapNumbers();

    printMatrix(infoMatrix);

}

function createInfoMatrix(dimensionX=defaultDimX, dimensionY=defaultDimY){

    let gridString="";
    let infoMatrix = Array(dimensionX);

    for(let i=0; i<dimensionX; i++){

        infoMatrix[i] = [];

        for(let j=0; j<dimensionY; j++){
            infoMatrix[i][j] = {mineNumber:0, discovered: false, flagged:false};

        }
    }

    //esto crea una variable en board que pueden usar todos sus hijos
    board.style.setProperty("--columns", dimensionY);
    board.style.setProperty("--rows", dimensionX);

    return infoMatrix;
    
}

function createWebMatrix(dimensionX=defaultDimX, dimensionY=defaultDimY, mines=defaultMines){

    for(let i=0; i<dimensionX; i++){
        const row = document.createElement("div");
        row.classList.add("row");
        board.appendChild(row);

        for(let j=0; j<dimensionY; j++){
            const cell = document.createElement("div");
            cell.classList.add("cell");
            (i+j)%2 ? cell.classList.add(currentPalette.oddUndiscoveredClass) : cell.classList.add(currentPalette.evenUndiscoveredClass);
            //pongo solo row porque se que quiero que el hijo se añada a la fila que acabo de crear
            row.appendChild(cell);
        }

    }

    document.querySelector("#mineCounter").textContent = mines;

    //click izquierdo
    board.addEventListener("click", (e) =>{
        const cell = e.target.closest("div");
        const positions = findBoardPosition(cell);
        boardLeftClick(positions[0], positions[1]);
    })

    //click derecho
    board.addEventListener("contextmenu", (e) =>{
        const cell = e.target.closest("div");
        e.preventDefault(); 
        const positions = findBoardPosition(cell);
        boardRightClick(positions[0], positions[1]);
    })

}

function generateMines(mines=defaultMines){
    
    let cont=0;
    let max=infoMatrix.length*infoMatrix[0].length; //para evitar hacer esta operacion todo el rato

    //hasta que todas las minas hayan sido colocadas
    while(cont<mines){

        //numero de casilla
        let num=Math.floor(Math.random()*max); //numero de la casilla de la mina
        
        //calculamos las posiciones en la matriz (i, j)
        const positions = getPostionFromNumber(num);

        if(infoMatrix[positions[0]][positions[1]].mineNumber !== -1){
            infoMatrix[positions[0]][positions[1]].mineNumber = -1;
            cont++;
        }
    }
    
}

function generateMapNumbers(){

    // [] [] [] [] []
    // [] [x] [] [] []
    // [] [] [] [] []

    const rodeoX = [-1, 0, 1, 1, 1, 0, -1, -1];
    const rodeoY = [-1, -1, -1, 0, 1, 1, 1, 0];

    //recorremos toda la matriz, mirando alrededor de la casilla actual para contar las minas
    for(let i = 0; i<infoMatrix.length; i++){
        for(let j = 0; j<infoMatrix[i].length; j++){

            //si ya es un tesoro, no hace falta hacer nada
            if(infoMatrix[i][j].mineNumber!==-1){
                
                let cont = 0;
                for(let k=0; k<8; k++){
                    let nuevaI = i+rodeoX[k];
                    let nuevaJ = j+rodeoY[k];

                    //miramos que lo que estamos comprobanod esta dentro del tablero
                    if(nuevaI>=0 && nuevaJ >=0 && nuevaI<infoMatrix.length && nuevaJ<infoMatrix[0].length){
                        //si hay tesoro, aumenta el contador
                        if(infoMatrix[nuevaI][nuevaJ].mineNumber===-1)cont++;
                    }

                }

                infoMatrix[i][j].mineNumber = cont;

            }

        
        }
    }


}

//funcion para debug
function printMatrix(matrix){

    for(let i = 0; i<matrix.length; i++){
        let string = i+": ";
        for(let j = 0; j<matrix[i].length; j++){
            string += matrix[i][j].mineNumber+" ";
        }
        console.log(string);
    }

}


function findBoardPosition(cell){

    //para buscar la posicion i hay que mirar los hermanos de las filas, padres de las casillas
    let rowSibling = cell.parentElement;
    let cellSibling = cell;
    let i=0;
    let j = 0;

    while(rowSibling.previousElementSibling !== null){
        rowSibling = rowSibling.previousElementSibling;
        i++
    }

    while(cellSibling.previousElementSibling!==null){
        cellSibling = cellSibling.previousElementSibling;
        j++;
    }

    return [i, j];

}

function boardLeftClick(i=-1, j=-1){
    if(i<0 || j<0){
        console.error("Error");
        return;
    } 

    if(infoMatrix[i][j].flagged) return; //no se puede liberar si tienes una bandera

    infoMatrix[i][j].mineNumber===-1 ? alert("BOOM") : infoMatrix[i][j].mineNumber===0 ? clearZeroes(i, j) : revealNumber(i, j);

    checkWin();

}

function revealNumber(i=-1, j=-1){
    if(i<0 || j<0){
        console.error("Error");
        return;
    } 

    const cell = board.children[i].children[j];

    if(infoMatrix[i][j].mineNumber!==0) cell.textContent = infoMatrix[i][j].mineNumber;
    infoMatrix[i][j].discovered = true;

    if((i+j)%2){
        cell.classList.remove(currentPalette.oddUndiscoveredClass);
        //para evitar que una clase se añada muchas veces, comprobamos antes si la tiene
        if(!cell.classList.contains(currentPalette.oddDiscoveredClass)) cell.classList.add(currentPalette.oddDiscoveredClass);
    }else{
        cell.classList.remove(currentPalette.evenUndiscoveredClass);
        if(!cell.classList.contains(currentPalette.evenDiscoveredClass)) cell.classList.add(currentPalette.evenDiscoveredClass); 
    }

    //para que si se revela una casilla con los ceros, no se quede la bandera inutilizada
    if(infoMatrix[i][j].flagged){
        const counter = document.querySelector("#mineCounter");
        const mines = Number(counter.textContent);

        counter.textContent = mines + 1;
        cell.classList.remove("flagged");

        infoMatrix[i][j].flagged = false;
    }

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
        const positions = getPostionFromNumber(queue[0]);

        for(let k=0; k<8; k++){
            let nuevaI = positions[0]+rodeoX[k];
            let nuevaJ = positions[1]+rodeoY[k];

            if(nuevaI>=0 && nuevaJ >=0 && nuevaI<infoMatrix.length && nuevaJ<infoMatrix[0].length){

                const num = getNumberFromPositions(nuevaI, nuevaJ);

                const boolVisited = !(visited.includes(num));
                const boolQ = !(queue.includes(num));

                if(infoMatrix[nuevaI][nuevaJ].mineNumber===0 &&  boolVisited && boolQ) queue.push(num);

                revealNumber(nuevaI, nuevaJ);

            }

        }

        queue.shift(); //como un pop pero quita el primer elemento

    }


}

function boardRightClick(i=-1, j=-1){

    if(i<0 || j<0){
        console.error("Error");
        return;
    }

    if(infoMatrix[i][j].discovered == true) return;

    const counter = document.querySelector("#mineCounter");
    const mines = Number(counter.textContent);

    if(mines<=0) return; //si ya no quedan banderas no se pueden poner mas

    const cell = board.children[i].children[j];
    
    cell.classList.toggle("flagged");

    //si ya tenia bandera, se la quita -> sumamos una al contador
    infoMatrix[i][j].flagged ? counter.textContent = mines+1 : counter.textContent = mines-1;

    infoMatrix[i][j].flagged = !infoMatrix[i][j].flagged;

}

function checkWin(){

    //ganamos cuando todas las casillas que no son minas han sido descubiertas.
    //este bool sirve para parar de leer la matriz cuando encontramos una casilla que no cumple esta condicion
    possibleWin = true;

    for(let i=0; i<infoMatrix.length && possibleWin; i++){
        for(let j=0; j<infoMatrix[0].length && possibleWin; j++){
            if(infoMatrix[i][j].mineNumber !== -1) possibleWin = infoMatrix[i][j].discovered;
        }
    }

    if(possibleWin) alert("HAS GANADO!!!!!!!");
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

function changeMode(){

}