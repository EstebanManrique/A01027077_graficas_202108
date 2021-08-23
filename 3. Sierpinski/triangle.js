class triangle{
    constructor(x,y,sideLength){
        this.x = x;
        this.y = y;
        this.sideLength = sideLength;
    }

    draw(contexto,x,y,sideLength,color){
        contexto.beginPath();
        contexto.moveTo(x, y);
        contexto.lineTo(x + (sideLength/2), y + sideLength * Math.sin(Math.PI/3))
        contexto.lineTo(x + sideLength, y);
        contexto.lineTo(x, y);
        contexto.closePath();
        contexto.fillStyle = color
        contexto.fill()
    }

    drawSierpinski(contexto,x,y,sideLength,divisiones){
        let sideLengthMitad = (sideLength / 2);
        let posiconesVertices = [x + (sideLengthMitad/2), y + sideLengthMitad * Math.sin(Math.PI/3),
                                 x + sideLengthMitad, y, x, y]
        if(divisiones != 0){
            for(let i = 0; i<3; i++){
                this.drawSierpinski(contexto,posiconesVertices[(2*i)],posiconesVertices[(2*i)+1],sideLengthMitad,divisiones-1)
            }
        }
        else{
            for(let i = 0; i<3; i++){
                this.draw(contexto,posiconesVertices[(2*i)],posiconesVertices[(2*i)+1],sideLengthMitad,"tomato")
            }
        }
    }
}
export {triangle};