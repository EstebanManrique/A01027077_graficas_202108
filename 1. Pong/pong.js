import {
    bar
} from "./bar.js"
import {
    ball
} from "./ball.js"
import {
    scoreboard
} from "./scoreboard.js"

function puntoNuevo(bola, scoreDer, scoreIzq) { //Funcion para contabilizar puntos y reiniciar posicion de pelota en el canvas
    if (bola.x == 0) { //Suma de punto para jugador de la derecha y restablecimiento de pelota
        scoreDer.score++;
        bola.x = 250;
        bola.y = 150;
    } else if (bola.x == 500) { //Suma de punto para jugador de la izquierda y restablecimiento de pelota
        scoreIzq.score++;
        bola.x = 250;
        bola.y = 150;
    }
}

function update(barraIzq, barraDer, bola, contexto, scoreIzq, scoreDer) { //Funcion para la actualizacion de los diferentes componentes del juego
    requestAnimationFrame(() => update(barraIzq, barraDer, bola, contexto, scoreIzq, scoreDer));

    contexto.clearRect(0, 0, 500, 300);

    barraIzq.update();
    barraDer.update();
    bola.update(barraDer, barraIzq);

    barraIzq.draw(contexto);
    barraDer.draw(contexto);
    bola.draw(contexto);
    scoreIzq.draw(contexto);
    scoreDer.draw(contexto);

    puntoNuevo(bola, scoreDer, scoreIzq); //Invocacion en caso de que haya contabilizacion de puntos
}

function main() { //Definicion de los diferentes componentes del Pong, incluyendo bola, barras y scoreboard
    const canvas = document.getElementById("pongCanvas");
    const contexto = canvas.getContext("2d");

    let barraIzq = new bar(20, 150, 30, 60, "white", "w", "s");
    let barraDer = new bar(450, 150, 30, 60, "white", "o", "l");
    let bola = new ball(250, 150, 10, "white");
    let scoreIzq = new scoreboard(120, 55, 0, "white");
    let scoreDer = new scoreboard(340, 55, 0, "white");

    barraIzq.draw(contexto);
    barraDer.draw(contexto);

    update(barraIzq, barraDer, bola, contexto, scoreIzq, scoreDer);
}

main();