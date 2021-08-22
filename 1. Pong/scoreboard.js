class scoreboard{
    constructor(x, y, score, color){
        this.x = x;
        this.y = y;
        this.score = score;
        this.color = color;
    }

    draw(contexto){
        contexto.fillStyle = this.color;
        contexto.font = "60px serif"
        contexto.fillText(this.score, this.x, this.y);
    }

}

export {scoreboard};