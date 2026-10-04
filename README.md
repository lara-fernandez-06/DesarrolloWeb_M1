# Buscaminas

Misión M1 · El Despertar del DOM — Web Development I.

## Cómo probarlo
Abre la pagina y podrás ver el tablero, el numero de minas que tienes por descubrir y un cronómetro que comenzará cuando hagas tu primer click. Utiliza el click izquierdo para descubrir lo que hay en una casilla, y click derecho para marcar que hay una mina y poner una bandera. Para ganar, debes descubrir todas las casillas que no sean minas. Buena suerte!!

## Uso de IA
He utilizado ChatGPT. Lo principal para lo que he usado IA es para hacer el tablero en css con casillas que tuvieran un ratio 1/1 y que no cambiasen de tamaño si cambiaba la pantalla. Sobre el mismo tema, la he utilizado para buscar información sobre la propiedad display: grid en css, y en un par de cuestiones sobre métodos de javascript, como el .shift() para los arrays o .inlcudes() para ver si existe un elemento en una lista.

Ejemplos: 
"cómo hago en js un pop para el primer elemento"
"y si quiero hacer que las casillas sean cuadradas? imagínate, quiero que el ancho sea 80vw pero el alto puede variar, varía para acomodar las casillas cuadradas. pero no quiero dar un número a las casillas, quiero que sean de altas según calcule el grid que tienen que ser anchas."
"como reeescribo el evento contextmenu?"

## Autopsia
Al principio tenía una matriz (infoMatrix) que representaba el tablero, y guardaba un -1 si en la casilla había una mina y en las demás contaba cuantas minas habia alrededor y guardaba ese número, siendo este el que se revela cuando le das click izquierdo. Pero me faltaba guardar información de las casillas, como si estaba descubierta o no, o si tenía una bandera. Pensé en hacer otra matriz que guardase eso, pero si por casualidad necesitase nueva información tendría que hacer otra más, por lo que decidí hacer que infoMatrix guardase un objeto clave-valor por cada casilla. Ahora mismo guarda el entero que ya guardaba antes, si la casilla ha sido descubierta y si tiene una bandera, pero si necesitase algun otro dato se podría añadir sin problema como otra entrada del objeto.

En la función clearZeroes, al hacer click en una casilla que es un cero, descubriremos todas las casillas de su alrededor que tambien sean cero y una más que tenga un número de minas diferente a este. Para esto, miramos la primera casilla en la que se ha hecho click, e inspeccionamos todas las de alrededor. Las revelamos, y  las que tambien tengan un valor de cero pasarán a una cola. Además, también guardaremos las casillas que ya hemos descubierto para evitar comprobar una y otra vez las mismas casillas, creando un bucle infinito. Para ello, primero utilice dos arrays: uno para las casillas que debíamos comprobar a continuación y otra para las que ya habiamos visitado. Al principio, guardaban numeros, que seria el lugar que ocuparía la casilla si le diésemos un numero a todas las casillas contando por filas de izquierda a derecha y de arriba a abajo, pero quería una forma en la que guardase las posiciones. Por tanto fui a utilizar un objeto, pero entonces el .inlcludes que utilizaba no funcionaba, porque comparaba las referencias. Así que hice una función para comparar los atributos de estos objetos en especifico, pero al final mirar toda la cola resultaba en un orden O(n). Así que al final, creé una matriz de bools con la misma dimensión que el tablero que cambiaba las casillas a true cuando ya habian sido visitadas. De esta forma, comprobar si una casilla ya habia sido visitada se volvía un O(1).

