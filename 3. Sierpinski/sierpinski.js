import {
    triangle
} from "./triangle.js"; //Se importa clase donde se dibuja triangulos y se tiene metodo recursivo para dibujarlos

function update(triangulo, contexto, slider, texto) { //Funcion de update de texto debajo de slider, al igual que de triangulo segun slider
    requestAnimationFrame(() => update(triangulo, contexto, slider, texto));

    contexto.clearRect(0, 0, 2000, 1000)
    let textoBase = "Numero de divisiones: "
    texto.innerText = textoBase.concat((slider.value).toString()) //Actualizacion de texto de acuerdo a slider

    triangulo.drawSierpinski(contexto, triangulo.x, triangulo.y, triangulo.sideLength, slider.value) //Actualizacion de triangulo segun numero en slider
}

function main() {
    const canvas = document.getElementById("sierpinskiCanvas") //Se obtiene canvas
    const contexto = canvas.getContext("2d"); //Generación de contexto
    const slider = document.getElementById("sierpinskiSlider") //Se obtiene elemento de slider
    const texto = document.getElementById("textoSlider") //Se obtiene elemento de texto debajo de slider

    let triangulo = new triangle(1000, 550, -560); //Dibuja el Triangulo dentro de los cuales se dibujaran el resto segun el slider
    triangulo.drawSierpinski(contexto, triangulo.x, triangulo.y, triangulo.sideLength, slider.value) //Funcion recursiva para dibujar los diferentes niveles de triangulos

    update(triangulo, contexto, slider, texto) //Se llama funcion de update del canvas
}

main()