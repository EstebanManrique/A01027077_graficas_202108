import {triangle} from "./triangle.js";

function main(){
    const canvas = document.getElementById("sierpinskiCanvas")
    const contexto = canvas.getContext("2d");

    let triangulo = new triangle(1000,500,-500);
    triangulo.drawSierpinski(contexto,triangulo.x, triangulo.y, triangulo.sideLength, 8)
}

main()
