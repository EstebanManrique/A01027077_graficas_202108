//Clase para barras en juego de Pong

class bar {
    constructor(x, y, width, height, color, upkey, downkey) { //Constructor de clase barra
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.upkey = upkey;
        this.downkey = downkey;

        this.up = false;
        this.down = false;

        this.keyEvents();
    }

    keyEvents() { //Definicion de teclas para indicar movimiento de las dos barras del juego
        document.addEventListener("keydown", event => {
            if (event.key == this.upkey) {
                this.up = true;
            }
            if (event.key == this.downkey) {
                this.down = true;
            }
        });

        document.addEventListener("keyup", event => {
            if (event.key == this.upkey) {
                this.up = false;
            }
            if (event.key == this.downkey) {
                this.down = false;
            }
        });
    }

    update() { //Metodo de update para las barras, en caso de movimiento hacia arriba o hacia abajo
        if (this.up) this.y -= 5;
        if (this.down) this.y += 5;

        if (this.y < 0) this.y = 0;
        if (this.y > (300 - this.height)) //Tiene que ser el mismo height que el del canvas en el html
            this.y = (300 - this.height)
    }

    draw(contexto) { //Dibujo de barras en Canvas
        contexto.fillStyle = this.color;
        contexto.fillRect(this.x, this.y, this.width, this.height)
    }

}

export {
    bar
};