const defaultDimX=14;
const defaultDimY=18;
const defaultMines=40;

const board = document.querySelector("#board");
const counter = document.querySelector("#mineCounter");
const rodeoX = [-1, 0, 1, 1, 1, 0, -1, -1];
const rodeoY = [-1, -1, -1, 0, 1, 1, 1, 0];
let infoMatrix;
let intervalId;
let mineCounter;
let gameEnded = false;

startGame();

function startGame(){

    generateMap()
    addEvents();

}

//dimension por defecto es 14x18
function generateMap(dimensionX=defaultDimX, dimensionY=defaultDimY, mines=defaultMines){

    mineCounter = mines; //la guardamos en la variable global para poder consultarla mas adelante
    
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

function createWebMatrix(dimensionX=defaultDimX, dimensionY=defaultDimY, mines=defaultMines){

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

    counter.textContent = mines;
    
}

function generateMines(mines=defaultMines){
    
    let cont=0;
    const max=infoMatrix.length*infoMatrix[0].length; //para evitar hacer esta operacion todo el rato

    //hasta que todas las minas hayan sido colocadas
    while(cont<mines){

        //numero de casilla
        const num=Math.floor(Math.random()*max); //numero de la casilla de la mina
        
        //calculamos las posiciones en la matriz (i, j)
        const positions = getPostionFromNumber(num, infoMatrix[0].length);

        if(infoMatrix[positions[0]][positions[1]].mineNumber !== -1){
            infoMatrix[positions[0]][positions[1]].mineNumber = -1;
            cont++;
        }
    }
    
}

function generateMapNumbers(){

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

//esta funcion solo la añadimos para aumentar legibilidad
function addEvents(){
    
    addStartChronoEvent();

    //click izquierdo
    board.addEventListener("click", (e) =>{
        if(gameEnded) return;
        const cell = e.target.closest(".cell");
        boardLeftClick(Number(cell.dataset.i), Number(cell.dataset.j));
    })

    //click derecho
    board.addEventListener("contextmenu", (e) =>{
        const cell = e.target.closest(".cell");
        e.preventDefault(); 
        if(gameEnded) return;
        boardRightClick(Number(cell.dataset.i), Number(cell.dataset.j));
    })

    //modo oscuro
    document.addEventListener("keydown", (e) => {
        if(e.key=== 'd' || e.key === 'D'){
            document.querySelector('body').classList.toggle("dark");
        }
    })

    document.querySelector("#reloadButton").addEventListener("click", (e)=>{
        resetGame();
        generateMap();
    })

}

function resetGame(){
    gameEnded = false;
    board.replaceChildren();
    clearInterval(intervalId);
    document.querySelector("#chrono").textContent='000';
    addStartChronoEvent();
    
}

function addStartChronoEvent(){
    board.addEventListener("click", function(e){
        if(gameEnded) return;
        let secCounter = 0;
        intervalId = setInterval(()=>{
            const chrono = document.querySelector("#chrono");
            secCounter++;
            
            chrono.textContent = String(secCounter).padStart(3,'0');

            if(secCounter>=999) clearInterval(intervalId);
        }, 1000)

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

function clearZeroes(i=-1, j=-1){

    if(i<0 || j<0){
        console.error("Error");
        return;
    } 

    //los sets son estructuras que no permiten duplicadosw
    const queue = []; //la cola de casillas 0 que tenemos que limpiar
    const visited = []; //guardamos las casillas con ceros que ya hemos visitado o ya estan en cola

    //haremos una matriz de bools que es mas eficiente a la hora de consultarla que una cola
    for (let i = 0; i < infoMatrix.length; i++) {
        visited[i] = [];

        for (let j = 0; j < infoMatrix[0].length; j++) {
            visited[i][j] = false;
        }
    }

    revealNumber(i, j);

    queue.push({i:i, j:j});
    while(queue.length>0){

        const positions = {i:queue[0].i, j:queue[0].j};

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

        queue.shift(); //como un pop pero quita el primer elemento

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

    if(possibleWin) alert("HAS GANADO!!!!!!!");
}

function getPostionFromNumber(num, dimensionY){

    const positions=[];

    positions.push(Math.floor(num/dimensionY));
    positions.push(num - positions[0]*dimensionY);

    return positions;

}

function exchangeClasses(obj, classToRemove, classToAdd){
    obj.classList.remove(classToRemove);
    obj.classList.add(classToAdd);
}

function toggleMode(palette){
    document.querySelector("body").classList.toggle(palette.bodyBackgroundClass);
    for(let i=0; i<infoMatrix.length; i++){
        for(let j=0; j<infoMatrix[0].length; j++){
            const cell = board.children[i].children[j];
            if((i+j)%2){
                if(infoMatrix[i][j].discovered) cell.classList.toggle(palette.oddDiscoveredClass);
                else cell.classList.toggle(palette.oddUndiscoveredClass);
            }else{
                 if(infoMatrix[i][j].discovered) cell.classList.toggle(palette.evenDiscoveredClass);
                else cell.classList.toggle(palette.evenUndiscoveredClass);

            }
        }
    }
    document.querySelector("#gameHeader").classList.toggle(palette.gameHeaderBackgroundClass); 
    document.querySelector("#header").classList.toggle(palette.headerColor); 
}