class ball {
    constructor(x, y, radio, color){
        this.x = x;
        this.y = y;
        this.radio = radio;
        this.color = color;

        this.up = true;
        this.right = true;
    }

    update(barraDer, barraIzq){
        if(this.up) this.y -= 5;
        else this.y += 5

        if(this.right) this.x += 5;
        else this.x -= 5;

        if(this.y < 0){
            this.up = false;
            this.y = 0;
        } 
        
        if(this.y > 300){
            this.up = true;
            this.y = 300;
        }
        
        if(this.x < 0){
            this.right = true
            this.x = 0;
        }
        
        if(this.x > 500){
            this.right = false;
            this.x = 500
        }
        
        if(this.x == (barraIzq.x + barraIzq.width) && (this.y >= barraIzq.y && this.y <= barraIzq.y + barraIzq.height)){
            if(this.y >= (((barraIzq.height) / 2) + 22) || this.y <= (((barraIzq.height) / 2 )- 22))
            {
                this.right = !(this.right)
            }
            else{
                this.right = !(this.right)
                this.up = !(this.up)
            }
        }

        if(this.x == (barraDer.x) && (this.y >= barraDer.y && this.y <= barraDer.y + barraDer.height)){
            if(this.y >= (((barraDer.height) / 2) + 22) || this.y <= (((barraDer.height) / 2) - 22))
            {
                this.right = !(this.right)
            }
            else{
                this.up = !(this.up)
                this.right = !(this.right)
            } 
        }
    }

    draw(contexto){
        contexto.fillStyle = this.color;
        contexto.beginPath();
        contexto.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        contexto.fill();
    }
}

export {ball};