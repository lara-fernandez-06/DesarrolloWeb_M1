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
let infoMatrix;
let intervalId;


generateMap();
document.addEventListener("keydown", (e) => {
    if(e.key== 'd' || e.key === 'D'){
        changeMode(darkPalette);
    }
})

//dimension por defecto es 14x18
function generateMap(dimensionX=defaultDimX, dimensionY=defaultDimY, mines=defaultMines){
    
    //control de errores: no puede haber mas minas que el cuadrado de la dim (las minas seran un 25% del tablero)
    if(mines>=dimensionX*dimensionY) mines = Math.floor(0.25*dimensionX*dimensionY);

    //inicializamos matriz logica
    infoMatrix = createInfoMatrix(dimensionX, dimensionY);

    //creamos el tablero en la web
    createWebMatrix(dimensionX, dimensionY, mines);
    addColorClasses(currentPalette);

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
            if((i+j)%2){
                //esta clase la incluimos para poder seleccionar solo estas con una query
                addSingularClass(cell, "odd");
                //mientras que esta solo le aporta el color
            }else{
                addSingularClass(cell, "even");
            } 
            cell.dataset.i=i;
            cell.dataset.j=j;
            //pongo solo row porque se que quiero que el hijo se añada a la fila que acabo de crear
            row.appendChild(cell);
        }

    }

    document.querySelector("#mineCounter").textContent = mines;
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

}

function generateMines(mines=defaultMines){
    
    let cont=0;
    let max=infoMatrix.length*infoMatrix[0].length; //para evitar hacer esta operacion todo el rato

    //hasta que todas las minas hayan sido colocadas
    while(cont<mines){

        //numero de casilla
        let num=Math.floor(Math.random()*max); //numero de la casilla de la mina
        
        //calculamos las posiciones en la matriz (i, j)
        const positions = getPostionFromNumber(num, infoMatrix[0].length);

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

    queue.push(getNumberFromPositions(i, j, infoMatrix[0].length));
    while(queue.length>0){

        visited.push(queue[0]);
        const positions = getPostionFromNumber(queue[0], infoMatrix[0].length);

        for(let k=0; k<8; k++){
            let nuevaI = positions[0]+rodeoX[k];
            let nuevaJ = positions[1]+rodeoY[k];

            if(nuevaI>=0 && nuevaJ >=0 && nuevaI<infoMatrix.length && nuevaJ<infoMatrix[0].length){

                const num = getNumberFromPositions(nuevaI, nuevaJ, infoMatrix[0].length);

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

function getNumberFromPositions(i, j, dimensionY){

    return i*dimensionY + j;

}

function changeMode(newPalette){
    removeColorClasses(currentPalette);
    addColorClasses(newPalette);
}

function exchangeClasses(obj, classToRemove, classToAdd){
    obj.classList.remove(classToRemove);
    addSingularClass(obj, classToAdd); 
}

//estas funciones nos sirven para cambiar la paleta de colores
//he decidido hacelo asi en vez de con la funcion de intercambiar clases que ya tengo para poder utilizar
//addColorClasses al cargar la pagina, y no tener algunas de las clases (como las del fondo del body) escritas en el html
function addColorClasses(palette){
    addSingularClass(document.querySelector("body"), palette.bodyBackgroundClass);
    addColorToCell('.odd', palette.oddDiscoveredClass, palette.oddUndiscoveredClass);
    addColorToCell('.even', palette.evenDiscoveredClass, palette.evenUndiscoveredClass);
    addSingularClass(document.querySelector("#gameHeader"), palette.gameHeaderBackgroundClass); 
    addSingularClass(document.querySelector("#header"), palette.headerColor);   
}

function addClassToMany(querySearch, className){
    for (const obj of document.querySelectorAll(querySearch)){
        addSingularClass(obj, className);
    }

}


//esta funcion sirve para poder hacer la distincion entre las casillas descubiertas y las que no
//la separo para no tener que repetir la logica con las casillas pares e impares
function addColorToCell(querySearch, discoveredClass, undiscoveredClass){
    for (const cell of document.querySelectorAll(querySearch)){
        const i=Number(cell.dataset.i);
        const j=Number(cell.dataset.j);
        if(infoMatrix[i][j].discovered) addSingularClass(cell, discoveredClass);
        else addSingularClass(cell, undiscoveredClass);
    }

}

function removeColorFromCell(querySearch, discoveredClass, undiscoveredClass){
    for (const cell of document.querySelectorAll(querySearch)){
        const i=Number(cell.dataset.i);
        const j=Number(cell.dataset.j);
        if(infoMatrix[i][j].discovered) cell.classList.remove(discoveredClass);
        else cell.classList.remove(undiscoveredClass);
    }

}

//hacemos la comprobacion de que no tiene ya la clase. como conviene hacerlo cada vez que añadimos una clase, hacemos una funcion
function addSingularClass(obj, className){
    if(!obj.classList.contains(className)) obj.classList.add(className);
}

function removeColorClasses(palette){
    document.querySelector("body").classList.remove(palette.bodyBackgroundClass);
    removeColorFromCell('.odd', palette.oddDiscoveredClass, palette.oddUndiscoveredClass);
    removeColorFromCell('.even', palette.evenDiscoveredClass, palette.evenUndiscoveredClass);
    document.querySelector("#gameHeader").classList.remove(palette.gameHeaderBackgroundClass); 
    document.querySelector("#header").classList.remove(palette.headerColor); 
}