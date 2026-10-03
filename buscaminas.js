const defaultDimX=14;
const defaultDimY=18;
const defaultMines=40;

/*COLORES TABLERO*/
const lightDefaultPalette = {
    bodyBackgroundClass: "bodyBackgroundDefault",
    headerColor: "headerColorDefault",
    gameHeaderBackgroundClass: "gameHeaderColorDefault",
    evenUndiscoveredClass: "evenUndiscoveredDefault",
    oddUndiscoveredClass: "oddUndiscoveredDefault",
    evenDiscoveredClass: "evenDiscoveredDefault",
    oddDiscoveredClass: "oddDiscoveredDefault"
}

const darkPalette = {
    bodyBackgroundClass: "bodyBackgroundDark",
    headerColor: "headerColorDark",
    gameHeaderBackgroundClass: "gameHeaderColorDark",
    evenUndiscoveredClass: "evenUndiscoveredDark",
    oddUndiscoveredClass: "oddUndiscoveredDark",
    evenDiscoveredClass: "evenDiscoveredDark",
    oddDiscoveredClass: "oddDiscoveredDark",
    
}

//aqui guardaremos la informacion de los colores/modo que se este utilizando ahora
let currentPalette = lightDefaultPalette; //esta sera la por defecto 

const board = document.querySelector("#board");
const counter = document.querySelector("#mineCounter");
const rodeoX = [-1, 0, 1, 1, 1, 0, -1, -1];
const rodeoY = [-1, -1, -1, 0, 1, 1, 1, 0];
let infoMatrix;
let intervalId;
let mineCounter;
let darkMode = false;


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
    toggleMode(currentPalette);

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
        const cell = e.target.closest(".cell");
        boardLeftClick(Number(cell.dataset.i), Number(cell.dataset.j));
    })

    //click derecho
    board.addEventListener("contextmenu", (e) =>{
        const cell = e.target.closest(".cell");
        e.preventDefault(); 
        boardRightClick(Number(cell.dataset.i), Number(cell.dataset.j));
    })

    //modo oscuro
    document.addEventListener("keydown", (e) => {
        if(e.key=== 'd' || e.key === 'D'){
            if(darkMode){
                toggleMode(currentPalette);
                toggleMode(lightDefaultPalette);
                currentPalette = lightDefaultPalette;
            }else{
                toggleMode(currentPalette);
                toggleMode(darkPalette);
                currentPalette = darkPalette;
            }
            
            darkMode = !darkMode;
        }
    })

    document.querySelector("#reloadButton").addEventListener("click", (e)=>{
        resetGame();
        generateMap();
    })

}

function resetGame(){
    board.innerHTML="";
    clearInterval(intervalId);
    document.querySelector("#chrono").textContent='000';
    addStartChronoEvent();
    
}

function addStartChronoEvent(){
    board.addEventListener("click", function(e){
        let secCounter = 0;
        intervalId = setInterval(()=>{
            const chrono = document.querySelector("#chrono")
            secCounter++;

            if(secCounter<10) chrono.textContent=`00${secCounter}`
            else if(secCounter<100) chrono.textContent=`0${secCounter}`
            else chrono.textContent=`${secCounter}`

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

    if(infoMatrix[i][j].mineNumber===-1) alert("BOOM") 
    else if(infoMatrix[i][j].mineNumber===0) clearZeroes(i, j)
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
        exchangeClasses(cell, currentPalette.oddUndiscoveredClass, currentPalette.oddDiscoveredClass);
    }else{
        exchangeClasses(cell, currentPalette.evenUndiscoveredClass, currentPalette.evenDiscoveredClass); 
    }

    //para que si se revela una casilla con los ceros, no se quede la bandera inutilizada
    if(infoMatrix[i][j].flagged){
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

    revealNumber(i, j);

    queue.push({i:i, j:j});
    while(queue.length>0){

        visited.push(queue[0]);
        const positions = {i:queue[0].i, j:queue[0].j};

        for(let k=0; k<8; k++){
            let nuevaI = positions.i+rodeoX[k];
            let nuevaJ = positions.j+rodeoY[k];

            if(nuevaI>=0 && nuevaJ >=0 && nuevaI<infoMatrix.length && nuevaJ<infoMatrix[0].length){

                const boolVisited = !(includesPosition(visited, {i:nuevaI, j:nuevaJ}));
                const boolQ = !(includesPosition(queue, {i:nuevaI, j:nuevaJ}));

                if(infoMatrix[nuevaI][nuevaJ].mineNumber===0 &&  boolVisited && boolQ) queue.push({i:nuevaI, j:nuevaJ});

                revealNumber(nuevaI, nuevaJ);

            }

        }

        queue.shift(); //como un pop pero quita el primer elemento

    }


}

//esta es una funcion para comprobar si el array que guarda objetos con dos propiedades i y j, ya tiene uno igual que el que se le pasa
//por parametros. esta funcion solo funciona para objetos que guaden una position con i y j
function includesPosition(array, obj){
    for(const iteration of array){
        if(iteration.i===obj.i && iteration.j === obj.j) return true;
    }

    return false;
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