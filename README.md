# DesarrolloWeb_M1

---USO DE IA---
Lo principal para lo que he usado IA es para hacer el tablero en css con casillas que tuvieran un ratio 1/1 y que no cambiasen de tamaño si cambiaba la pantalla. Sobre el mismo tema, la he utilizado para buscar información sobre la propiedad display: grid en css, y en un par de cuestiones sobre métodos de javascript, como el .shift() para los arrays o .inlcudes() para ver si existe un elemento en una lista.

Ejemplos: 
"cómo hago en js un pop para el primer elemento"
"y si quiero hacer que las casillas sean cuadradas? imagínate, quiero que el ancho sea 80vw pero el alto puede variar, varía para acomodar las casillas cuadradas. pero no quiero dar un número a las casillas, quiero que sean de altas según calcule el grid que tienen que ser anchas."
"como reeescribo el evento contextmenu?"

---AUTOPSIA---
Al principio tenía una matriz (infoMatrix) que representaba el tablero, y guardaba un -1 si en la casilla había una mina y en las demás contaba cuantas minas habia alrededor y guardaba ese número, siendo este el que se revela cuando le das click izquierdo. Pero me faltaba guardar información de las casillas, como si estaba descubierta o no, o si tenía una bandera. Pensé en hacer otra matriz que guardase eso, pero si por casualidad necesitase nueva información tendría que hacer otra más, por lo que decidí hacer que infoMatrix guardase un diccionario clave-valor por cada casilla. Ahora mismo guarda el entero que ya guardaba antes, si la casilla ha sido descubierta y si tiene una bandera, pero si necesitase algun otro dato se podría añadir sin problema como otra entrada del diccionario

