import * as shaderUtils from "../common/shaderUtils.js"

const mat4 = glMatrix.mat4;

// projecttionMatrix a ser usada por figuras; modelVIewMatrix por shaders
let projectionMatrix, modelViewMatrix;

let shaderVertexPositionAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These are constant during a rendering cycle, such as lights position.
// Varyings: Used for passing data from the vertex shader to the fragment shader.
const vertexShaderSource = `#version 300 es

        in vec3 vertexPos; // Vertex from the buffer
        uniform mat4 modelViewMatrix; // Object's position
        uniform mat4 projectionMatrix; // Camera's position

        void main(void) {
    		// Return the transformed and projected vertex value
            gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);
        }`;

const fragmentShaderSource = `#version 300 es

        precision mediump float;
        out vec4 fragColor;

        void main(void) {
        // Return the pixel color: always output white
        fragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }`;

/** @type {WebGLRenderingContext} */
function main(){
    //Objeto canvas en el html es obtenido
    let canvas = document.getElementById("canvasFiguras");
    
    //Con esto se liga al canvas con GL y se inicia tambien el viewport
    let gl = initWebGL(canvas);
    initGL(gl, canvas);
    initViewport(gl, canvas);

    const shaderProgram = shaderUtils.initShader(gl, vertexShaderSource, fragmentShaderSource);

    //Proceso para hacer cuadrado
    let square = createSquare(gl);
    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, [-1.0, 0.65, -3.333]); //Se indica posicion
    bindShaderAttributes(gl, shaderProgram); //Se asignan manejadores para las variables definidas en el shader 
    draw(gl, shaderProgram, square); //Se dibuja cuadrado

    //Proceso para hacer triangulo 
    let triangle = createTriangle(gl);
    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, [1.0, 0.65, -3.333]); //Se indica posicion
    bindShaderAttributes(gl, shaderProgram); //Se asignan manejadores para las variables definidas en el shader
    draw(gl, shaderProgram, triangle); //Se dibuja triangulo

    //Proceso para hacer rombo
    let rombus = createRombus(gl);
    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, [-1.0, -0.65, -3.333]); //Se indica posicion
    bindShaderAttributes(gl, shaderProgram); //Se asignan manejadores para las variables definidas en el shader
    draw(gl, shaderProgram, rombus); //Se dibuja rombo
    
    //Proceso para hacer pacman
    let pacman = createPacman(gl)
    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, [1.0, -0.65, -3.333]); //Se indica posicion
    bindShaderAttributes(gl, shaderProgram); //Se asignan manejadores para las variables definidas en el shader
    draw(gl, shaderProgram, pacman); //Se dibuja pacman

}

function createSquare(gl){
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let verts = [.5, -.5, 0, .5, .5, 0, -.5, -.5, 0, -.5, .5, 0]; //Se definen 4 vertices para hacer dos triangulos, divididos por su diagonal

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    let square = {buffer: vertexBuffer, vertSize:3, nVerts:4, primtype:gl.TRIANGLE_STRIP} //4 vertices, cada uno con 3 valores

    return square;
}

function createTriangle(gl){
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let verts = [-.5, -.5, 0, .5, -.5, 0, 0, .5, 0]; //Se definen 3 vertices para hacer el triangulo en cuestion

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    let triangle = {buffer: vertexBuffer, vertSize:3, nVerts:3, primtype:gl.TRIANGLES}; //3 vertices, cada uno con 3 valores
    return triangle;
}

function createRombus(gl){
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let verts = [.5, 0, 0, 0, .5, 0, 0, -.5, 0, -.5, 0, 0]; //Se definen 4 vertices para hacer dos triangulos, divididos eje de simetrìa horizontal

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    let rombus = {buffer: vertexBuffer, vertSize:3, nVerts:4, primtype:gl.TRIANGLE_STRIP}; //4 vertices, cada uno con 3 valores
    return rombus;
}

function createPacman(gl){
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let verts = []; //Se crea arreglo de vertices vacios
    verts.push(0,0,0); //El primer vertice es el centro del circulo 
    let completos = 90;
    let incompletos = 0;
    //Se aplica teorema de Pitagoras para calcular coordenadas de siguientes extremos de la circunferencia: 290 triangulos
    for(let i = 0; i<290; i++){
        if(i<60){ //Cuadrante superior derecho; solo se dibujan 60 grados, ya que 30 corresponden a la "boca"
            verts.push((Math.cos((incompletos + 30) * (Math.PI / 180)) * .5), (Math.sin((incompletos + 30) * (Math.PI / 180)) * (.5)), 0)
            incompletos++;
        }
        else if (i>= 60 && i<150){ //Cuadrante superior izquierdo; se dibujan 90 grados
            if(i == 60){
                incompletos = 0
            }
            verts.push((Math.cos((completos) * (Math.PI / 180)) * (-.5)), (Math.sin((completos) * (Math.PI / 180)) * (.5)), 0)
            completos--;
        }
        else if (i>=150 && i<240){ //Cuadrante inferior izquierdo; se dibujan 90 grados
            if(i == 150){
                completos = 0
            }
            verts.push((Math.cos((completos) * (Math.PI / 180)) * (-.5)), (Math.sin((completos) * (Math.PI / 180)) * (-.5)), 0)
            completos++;
        }
        if (i>=240){ //Cuadrante inferior derecho; solo se dibujan 50 grados, ya que 40 corresponden a la "boca"
            verts.push((Math.cos((90 - incompletos) * (Math.PI / 180)) * .5), (Math.sin((90 - incompletos) * (Math.PI / 180)) * (-.5)), 0)
            incompletos++;
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    let rombus = {buffer: vertexBuffer, vertSize:3, nVerts:291, primtype:gl.TRIANGLE_FAN}; //291 vertices, con 3 elementos cada uno, utilizando Abanico de Triangulos
    console.log(verts)
    return rombus;
}

//Inicia el contexto a ser usado por WEbGl
function initWebGL(canvas) 
{
    let gl = null;
    let msg = "Your browser does not support WebGL, or it is not enabled by default.";

    try 
    {
        gl = canvas.getContext("webgl2"); //Se va a obtener un canvas con contexto 2d
    } 
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        throw new Error(msg);
    }

    return gl;        
}

// Se inicia el viewport, con forma de rectangulo 
function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(gl, canvas)
{
    //Pone el fondo de color negro
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //Libera el color buffer
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Crea una view matrix en  0, 0, -3.333
    modelViewMatrix = mat4.create();
   
    mat4.identity(modelViewMatrix);

    //Crea una project matrix con una vista de 45 grados
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);
}

function bindShaderAttributes(gl, shaderProgram)
{
    //Se asignan manejadores para las variables definidas en el shader de para que puedan ser inicializadas
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");
}

function draw(gl, shaderProgram, obj) 
{
    //Se empieza a usar el shader 
    gl.useProgram(shaderProgram);
    
    //Conecta los parametros del shader 
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);

    //Especifica memoria para el buffer de vertices
    gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
    gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, modelViewMatrix);

    //Realmente, esta es la funcion que va a dibujar cada uno de los objetos
    gl.drawArrays(obj.primtype, 0, obj.nVerts);
}

main(); //Se invoca la funcion main, que a su vez llama al resto de las funciones