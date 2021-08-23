//Clase para Scoreboard en juego de Pong

class scoreboard {
    constructor(x, y, score, color) { //Constrcutor de clase de Scoreboard
        this.x = x;
        this.y = y;
        this.score = score;
        this.color = color;
    }

    draw(contexto) { //Dibujo de scoreboard en Canvas
        contexto.fillStyle = this.color;
        contexto.font = "60px serif"
        contexto.fillText(this.score, this.x, this.y);
    }

}

export {
    scoreboard
};