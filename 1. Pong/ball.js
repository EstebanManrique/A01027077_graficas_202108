//Clase bola para juego de Pong

class ball {
    constructor(x, y, radio, color) { //Constructor de clase bola
        this.x = x;
        this.y = y;
        this.radio = radio;
        this.color = color;

        this.up = true;
        this.right = true;
    }

    update(barraDer, barraIzq) { //Metodo de update para movimiento de bola de acuerdo a colisiones

        //Direccion de bola en caso de que pelota vaya hacia abajo o hacia arriba
        if (this.up) this.y -= 5;
        else this.y += 5

        //Direcion de bola en caso de que peltoa vaya hacia la izquierda o derecha
        if (this.right) this.x += 5;
        else this.x -= 5;

        //Cambio de direccion en caso de colisionar con parte superior de juego
        if (this.y < 0) {
            this.up = false;
            this.y = 0;
        }

        //Cambio de direccion en caso de colisionar con parte inferior de juego
        if (this.y > 300) {
            this.up = true;
            this.y = 300;
        }

        //Cambio de direccion en caso de colisionar en pared izquierda --Antes de implementar colisiones y puntos--
        if (this.x < 0) {
            this.right = true
            this.x = 0;
        }

        //Cambio de direccion en caso de colisionar en pared derecha --Antes de implementar colisiones y puntos--
        if (this.x > 500) {
            this.right = false;
            this.x = 500
        }

        //Manejo de colisiones con barra Izquierda del pong
        if (this.x == (barraIzq.x + barraIzq.width) && (this.y >= barraIzq.y && this.y <= barraIzq.y + barraIzq.height)) { //Delimitacion de posicion de barra Izquierda
            if (this.y >= (((barraIzq.height) / 2) + 22) || this.y <= (((barraIzq.height) / 2) - 22)) //Cambio de posicion en caso de que impacte en parte "media" de barra
            {
                this.right = !(this.right)
            } else { //Cambio de posicion en caso de que bola impacte en los extremos de la barra
                this.right = !(this.right)
                this.up = !(this.up)
            }
        }

        //Manejo de colisiones con barra Derecha del pong
        if (this.x == (barraDer.x) && (this.y >= barraDer.y && this.y <= barraDer.y + barraDer.height)) { //Delimitacion de posicion de barra Derecha
            if (this.y >= (((barraDer.height) / 2) + 22) || this.y <= (((barraDer.height) / 2) - 22)) //Cambio de posicion en caso de que impacte en parte "media" de barra
            {
                this.right = !(this.right)
            } else { //Cambio de posicion en caso de que bola impacte en los extremos de la barra
                this.up = !(this.up)
                this.right = !(this.right)
            }
        }
    }

    //Dibujo de bola en Canvas
    draw(contexto) {
        contexto.fillStyle = this.color;
        contexto.beginPath();
        contexto.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        contexto.fill();
    }
}

export {
    ball
};