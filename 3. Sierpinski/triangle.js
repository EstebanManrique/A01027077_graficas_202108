//Clase para triangulos y recursión para Sierpinski

//Se uso el siguiente link como apoyo para elaborar este script: https://xtrp.io/blog/2020/11/20/generating-the-sierpinski-triangle-in-vanilla-javascript-with-html5-canvas/

class triangle {
    constructor(x, y, sideLength) { //Constructor del triangulo dentro de los cuales se dibujaran el resto
        this.x = x; //Coordenada en x del vertice inferior izquierdo del triangulo mas grande
        this.y = y; //Coordenada en y del vertice inferior izquierdo del triangulo mas grande
        this.sideLength = sideLength; //Longitud del triangulo mas grande 
    }

    draw(contexto, x, y, sideLength, color) { //Metodo con el cual se dibujan los triangulos
        contexto.beginPath();
        contexto.moveTo(x, y); //Se establece comienzo de dibujo en el punto x,y
        contexto.lineTo(x + (sideLength / 2), y + sideLength * Math.sin(Math.PI / 3)) //Se dibuja primera arista
        contexto.lineTo(x + sideLength, y); //Se dibuja segunda arista
        contexto.lineTo(x, y); //Se dibuja tercera arista
        contexto.closePath();
        contexto.fillStyle = color //Se rellena triangulo con este color
        contexto.fill()
    }

    drawSierpinski(contexto, x, y, sideLength, divisiones) { //Funcion recursiva con la cual se pueden hacer los diferentes niveles triangulos
        let sideLengthMitad = (sideLength / 2); // Se obtiene la mitad de la longitud dada por cada nivel de triangulos que se vaya a hacer
        let posiconesVertices = [x + (sideLengthMitad / 2), y + sideLengthMitad * Math.sin(Math.PI / 3),
            x + sideLengthMitad, y, x, y
        ] //Este arreglo sirve para poder definir tres diferentes vertices de los cuales se comienzan a dibujar diferentes triangulos en cada uno de los niveles
        if (divisiones != 0) { //En caso de que aun haya niveles por dibujar, se llama funcion recursiva
            for (let i = 0; i < 3; i++) {
                this.drawSierpinski(contexto, posiconesVertices[(2 * i)], posiconesVertices[(2 * i) + 1], sideLengthMitad, divisiones - 1) //Funcion recursiva
            }
        } else { //En caso de que hay un numero de divisiones 0, se dibuja triangulo sencillo
            this.draw(contexto, x, y, sideLength, "firebrick") //Dibjuo de triangulo sencillo
        }
    }
}
export {
    triangle
};