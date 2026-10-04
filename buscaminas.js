const defaultDimX=14;
const defaultDimY=18;
const defaultMines=40;

const board = document.querySelector("#board");
const difficulty = document.querySelector("#difficulty");
const counter = document.querySelector("#mineCounter");
const chrono = document.querySelector("#chrono");

const rodeoX = [-1, 0, 1, 1, 1, 0, -1, -1];
const rodeoY = [-1, -1, -1, 0, 1, 1, 1, 0];
let infoMatrix;
let intervalId;
let mineCounter;
let gameEnded = false;
let chronoStarted = false;

startGame();

function startGame(){

    generateMap()
    addEvents();

}

//dimension por defecto es 14x18
function generateMap(dimensionX=defaultDimX, dimensionY=defaultDimY, mines=defaultMines){
    
    //control de errores: no puede haber mas minas que el cuadrado de la dim (las minas seran un 25% del tablero)
    if(mines>=dimensionX*dimensionY) mines = Math.floor(0.25*dimensionX*dimensionY);

    mineCounter = mines; //la guardamos en la variable global para poder consultarla mas adelante

    //inicializamos matriz logica
    infoMatrix = createInfoMatrix(dimensionX, dimensionY);

    //creamos el tablero en la web
    createWebMatrix(dimensionX, dimensionY);

    //primero rellenamos la matriz que guarda la información (donde están las minas (-1) y los números)
    generateMines(mines);

    //ponemos los numeros segun el numero de minas que tengan alrededor
    generateMapNumbers();

}

function createInfoMatrix(dimensionX=defaultDimX, dimensionY=defaultDimY){

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

function createWebMatrix(dimensionX=defaultDimX, dimensionY=defaultDimY){

    for(let i=0; i<dimensionX; i++){
        const row = document.createElement("div");
        row.classList.add("row");
        board.appendChild(row);

        for(let j=0; j<dimensionY; j++){
            const cell = document.createElement("div");
            cell.classList.add("cell");
            if((i+j)%2) cell.classList.add("oddUndiscovered");
            else cell.classList.add("evenUndiscovered");
            cell.dataset.i=i;
            cell.dataset.j=j;
            //pongo solo row porque se que quiero que el hijo se añada a la fila que acabo de crear
            row.appendChild(cell);
        }

    }

    counter.textContent = mineCounter;
    
}

function generateMines(mines=defaultMines){
    
    let cont=0;
    const max=infoMatrix.length*infoMatrix[0].length; //para evitar hacer esta operacion todo el rato

    //hasta que todas las minas hayan sido colocadas
    while(cont<mines){

        //numero de casilla
        const num=Math.floor(Math.random()*max); //numero de la casilla de la mina
        
        //calculamos las posiciones en la matriz (i, j)
        const positions = getPositionFromNumber(num, infoMatrix[0].length);

        if(infoMatrix[positions.i][positions.j].mineNumber !== -1){
            infoMatrix[positions.i][positions.j].mineNumber = -1;
            cont++;
        }
    }
    
}

function generateMapNumbers(){

    //recorremos toda la matriz, mirando alrededor de la casilla actual para contar las minas
    for(let i = 0; i<infoMatrix.length; i++){
        for(let j = 0; j<infoMatrix[i].length; j++){

            //si ya es una mina, no hace falta hacer nada
            if(infoMatrix[i][j].mineNumber!==-1){
                
                let cont = 0;
                for(let k=0; k<8; k++){
                    let nuevaI = i+rodeoX[k];
                    let nuevaJ = j+rodeoY[k];

                    //miramos que lo que estamos comprobando esta dentro del tablero
                    if(nuevaI>=0 && nuevaJ >=0 && nuevaI<infoMatrix.length && nuevaJ<infoMatrix[0].length){
                        //si hay mina, aumenta el contador
                        if(infoMatrix[nuevaI][nuevaJ].mineNumber===-1)cont++;
                    }

                }

                infoMatrix[i][j].mineNumber = cont;

            }

        
        }
    }


}

//esta funcion solo la añadimos para aumentar legibilidad
function addEvents(){
    
    addStartChronoEvent();

    //click izquierdo
    board.addEventListener("click", (e) =>{
        if(gameEnded) return;

        const cell = e.target.closest(".cell");
        if(!cell) return;

        boardLeftClick(Number(cell.dataset.i), Number(cell.dataset.j));
    })

    //click derecho
    board.addEventListener("contextmenu", (e) =>{
        e.preventDefault();

        const cell = e.target.closest(".cell");
        if(!cell) return;
 
        if(gameEnded) return;

        boardRightClick(Number(cell.dataset.i), Number(cell.dataset.j));
    })

    //modo oscuro
    document.addEventListener("keydown", (e) => {
        if(e.key=== 'd' || e.key === 'D'){
            document.querySelector('body').classList.toggle("dark");
        }
    })

    document.querySelector("#reloadButton").addEventListener("click", ()=>{
        setDifficulty(); //ponemos esta funcion porque además de resetear el juego, nos pone la dificultad en la que estabamos
    })

    difficulty.addEventListener("change", ()=>{
        setDifficulty();
    })

}

function resetGame(){
    gameEnded = false;
    board.replaceChildren();  
    document.querySelector("#confetti").style.display = "none";  
    
    if(chronoStarted){
        chrono.textContent='000';
        clearInterval(intervalId);
        addStartChronoEvent();
        chronoStarted=false;
    }
    
}

function addStartChronoEvent(){
    board.addEventListener("click", function(e){
        if(gameEnded) return;
        let secCounter = 0;
        intervalId = setInterval(()=>{
            
            secCounter++;
            
            chrono.textContent = `${String(secCounter).padStart(3,'0')}`;

            if(secCounter>=999) clearInterval(intervalId);
        }, 1000)

        chronoStarted = true;

    }, {once:true});//solo funciona una vez (sino resetaríamos el chrono con cada click)

}

function boardLeftClick(i=-1, j=-1){
    if(i<0 || j<0){
        console.error("Error");
        return;
    } 

    if(infoMatrix[i][j].flagged) return; //no se puede liberar si tienes una bandera

    if(infoMatrix[i][j].mineNumber===-1) loseGame(); 
    else if(infoMatrix[i][j].mineNumber===0) clearZeroes(i, j);
    else revealNumber(i, j);

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
        exchangeClasses(cell, 'oddUndiscovered','oddDiscovered');
    }else{
        exchangeClasses(cell, 'evenUndiscovered', 'evenDiscovered'); 
    }

    //para que si se revela una casilla con los ceros, no se quede la bandera inutilizada
    if(infoMatrix[i][j].flagged){

        counter.textContent = ++mineCounter;
        cell.classList.remove("flagged");

        infoMatrix[i][j].flagged = false;
    }

}

function loseGame(){

    gameEnded=true;
    clearInterval(intervalId);

    for(let i = 0; i<infoMatrix.length; i++){
        for(let j = 0; j<infoMatrix[i].length; j++){
            if(infoMatrix[i][j].mineNumber===-1) board.children[i].children[j].classList.add("mine");
        }
    }        
}

function winGame(){
    gameEnded=true;
    clearInterval(intervalId);

    document.querySelector("#confetti").style.display = "block";

}

function clearZeroes(i=-1, j=-1){

    if(i<0 || j<0){
        console.error("Error");
        return;
    } 

    const queue = []; //la cola de casillas 0 que tenemos que limpiar
    const visited = []; //guardamos las casillas con ceros que ya hemos visitado o ya estan en cola
    let queueIndex = 0; //con esto en vez del shift el algoritmo es mas optimo
    
    for (let k = 0; k < infoMatrix.length; k++) {
        visited[k] = [];

        for (let l = 0; l < infoMatrix[0].length; l++) {
            visited[k][l] = false;
        }
    }

    revealNumber(i, j);
    visited[i][j]=true;

    queue.push({i:i, j:j});
    while(queueIndex<queue.length){

        const positions = {i:queue[queueIndex].i, j:queue[queueIndex].j};

        for(let k=0; k<8; k++){
            let nuevaI = positions.i+rodeoX[k];
            let nuevaJ = positions.j+rodeoY[k];

            if(nuevaI>=0 && nuevaJ >=0 && nuevaI<infoMatrix.length && nuevaJ<infoMatrix[0].length){

                if(infoMatrix[nuevaI][nuevaJ].mineNumber===0 && !visited[nuevaI][nuevaJ]){
                    queue.push({i:nuevaI, j:nuevaJ});
                    visited[nuevaI][nuevaJ]=true;
                } 

                revealNumber(nuevaI, nuevaJ);

            }

        }

        queueIndex++;

    }


}

function boardRightClick(i=-1, j=-1){

    if(i<0 || j<0){
        console.error("Error");
        return;
    }

    if(infoMatrix[i][j].discovered === true) return;

    if(mineCounter<=0 && !infoMatrix[i][j].flagged) return; //si ya no quedan banderas no se pueden poner mas

    const cell = board.children[i].children[j];
    
    cell.classList.toggle("flagged");

    //si ya tenia bandera, se la quita -> sumamos una al contador
    infoMatrix[i][j].flagged ? counter.textContent = ++mineCounter : counter.textContent = --mineCounter;

    infoMatrix[i][j].flagged = !infoMatrix[i][j].flagged;

}

function checkWin(){

    //ganamos cuando todas las casillas que no son minas han sido descubiertas.
    //este bool sirve para parar de leer la matriz cuando encontramos una casilla que no cumple esta condicion
    let possibleWin = true;

    for(let i=0; i<infoMatrix.length && possibleWin; i++){
        for(let j=0; j<infoMatrix[0].length && possibleWin; j++){
            if(infoMatrix[i][j].mineNumber !== -1) possibleWin = infoMatrix[i][j].discovered;
        }
    }

    if(possibleWin){
        winGame();
    }
}

function getPositionFromNumber(num, dimensionY){

    const positions={};

    positions.i=Math.floor(num/dimensionY);
    positions.j=num - positions.i*dimensionY;

    return positions;

}

function setDifficulty(){
    switch(difficulty.value){
        case "easy":
            resetGame();
            generateMap(8, 10, 10);
        break;

        case "medium":
            resetGame();
            generateMap();
        break;

        case "hard":
            resetGame();
            generateMap(20, 24, 99);
        break;
    }
}

function exchangeClasses(obj, classToRemove, classToAdd){
    obj.classList.remove(classToRemove);
    obj.classList.add(classToAdd);
}