import * as shaderUtils from '../common/shaderUtils.js'
const mat4 = glMatrix.mat4;

let projectionMatrix;

let shaderVertexPositionAttribute, shaderVertexColorAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

const duration = 10000; // ms e indica cada cuanto hay actualizacion de figuras
let yOcta = 0.0 //Posicion original de octaedro. Variable usada para controlar mov. en y
let mov = 0 //Indica cambio de traslacion en y
let primerMov = 0 //Bandera para saber si octaedro esta subiendo o bajando

//Shader para vertices
const vertexShaderSource = `#version 300 es

        in vec3 vertexPos; // Vertex from the buffer
        in vec4 vertexColor;

        out vec4 color;

        uniform mat4 modelViewMatrix; // Object's position
        uniform mat4 projectionMatrix; // Camera's position

        void main(void) {
    		// Return the transformed and projected vertex value
            gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);
            color = vertexColor * 0.8;
        }`;

//Shader para Colores 
const fragmentShaderSource = `#version 300 es

        precision mediump float;
        in vec4 color;
        out vec4 fragColor;

        void main(void) {
        fragColor = color;
    }`;

function main(){
    const canvas = document.getElementById("canvasFiguras"); //Se obtiene Canvas
    const gl = initWebGL(canvas); //Se inicia canvas con initWebGl
    initViewport(gl, canvas); //Se inicia Viewport
    initGL(canvas);

    let scutoid = createScutoid(gl, [-5.5,0,-4], [1,1,0.2]) //Generación de Escutoide
    let dodecahedron = createDodecahedron(gl, [0,0,-4], [-0.4, 1.0, 0.1]); //Generacion de Dodecaedro
    let octahedron = createOctahedron(gl, [3.4,yOcta,0], [0,1,0]) //Generacion de Octaedro

    const shaderProgram = shaderUtils.initShader(gl, vertexShaderSource, fragmentShaderSource); //Inicio de shaders
    bindShaderAttributes(gl, shaderProgram); //Se unen shaders

    update(gl, shaderProgram, [scutoid, dodecahedron, octahedron]); //Constante actualizacion de las figuras
}

//Inicio de WebGL
function initWebGL(canvas)
{
    let gl = null;
    let msg = "Your browser does not support WebGL, or it is not enabled by default.";
    try {
        gl = canvas.getContext("webgl2");
    } 
    catch (e) {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl) {
        throw new Error(msg);
    }

    return gl;        
}

//Inicio de Viewport
function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

//Matriz de proyeccion es definida 
function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
    // mat4.orthoNO(projectionMatrix, -4, 4, -3.5, 3.5, 1, 100)
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

//Creacion de Escutoide
function createScutoid(gl, translation, rotationAxis)
{
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        //HEXAGONO
        -1.0,  0.0,  1.5,
       -0.5,-0.87,  1.5,
        0.5,-0.87,  1.5,
        1.0,  0.0,  1.5,
        0.5, 0.87,  1.5,
       -0.5, 0.87,  1.5,

       //CARA 1 "RECTANGULAR"
       -0.5,-0.87,  1.5,
        0.5,-0.87,  1.5,
      -0.31,-0.95, -1.5,
       0.81,-0.59, -1.5, 
      
      //CARA 2 "RECTANGULAR"
       -1.0,  0.0,  1.5,
       -0.5,-0.87,  1.5,
       -1.0,  0.0, -1.5,
      -0.31,-0.95, -1.5,

       //CARA 1 "IRREGULAR"
        0.5,-0.87,  1.5,
        1.0,  0.0,  1.5,
       0.81,-0.59, -1.5,
       0.81, 0.59, -1.5,
       0.81, 0.59,  0.0,

        //CARA TRIANGULO PEQUENO
        1.0,  0.0,  1.5,
        0.5, 0.87,  1.5,
       0.81, 0.59,  0.0,

        //CARA 2 "IRREGULAR"
        0.5, 0.87,  1.5,
       -0.5, 0.87,  1.5,
       0.81, 0.59, -1.5,
      -0.31, 0.95, -1.5,
       0.81, 0.59,  0.0,

        //CARA 3 "RECTANGULAR"
       -0.5, 0.87,  1.5,
       -1.0,  0.0,  1.5,
      -0.31, 0.95, -1.5,
       -1.0,  0.0, -1.5,

        //PENTAGONO
        -1.0,  0.0, -1.5,
        -0.31,-0.95, -1.5,
        0.81,-0.59, -1.5,
        0.81, 0.59, -1.5,
        -0.31, 0.95, -1.5,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let colorBuffer = gl.createBuffer(); //Creacion Buffer de colores
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    //Arreglo con codigos para colores de cada cara de la figura
    let faceColors = [
        [1.0, 0.0, 0.0, 1],
        [0.0, 1.0, 0.0, 1],
        [0.0, 0.0, 1.0, 1],
        [1.0, 1.0, 0.0, 1],
        [1.0, 0.0, 1.0, 1],
        [0.0, 1.0, 1.0, 1],
        [0.80,0.70,0.55,1],
        [0.68,0.45,0.55,1]
    ];

    let vertexColors = [];

    //Dependiendo del numero de triangulos por cara, se agrega color a los vertices (cada uno) de las mismas
    faceColors.forEach((color, i) =>{
        let nVertex = 0;
        if (i == 0) {
            nVertex = 6;
        } else if (i == 3 || i == 5 || i == 7) {
            nVertex = 5;
        } else if  (i == 4) {
            nVertex = 3;
        } else {
            nVertex = 4;
        }

        for (let j=0; j < nVertex; j++) {
            vertexColors.push(...color);
        }
    });


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let indexBuffer = gl.createBuffer(); //Buffer para indices que crean triangulos en las caras de las figuras
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    //Arreglo de indices para crear triangulos
    let indices = [
        0, 1, 2, 0, 5, 2, 5, 2, 3, 3, 4, 5, //INDICES HEXAGONO
        6, 7, 8, 9, 8, 7, //INDICES CARA 1 "RECTANGULAR"
        10, 11, 12, 13, 12, 11, //INDICES CARA 2 "RECTANGULAR"
        14, 15, 16, 17, 16, 15, 15, 17, 18, //INDICES CARA 1 "IRREGULAR"
        19, 20, 21, //INDICES CARA TRIANGULO
        22, 24, 26, 22, 23, 24, 25, 24, 23, //INDICES CARA 2 "IRREGULAR"
        27, 28, 29, 30, 29, 28, //INDICES CARA 3 "RECTANGULAR"
        31, 32, 33, 31, 33, 35, 33, 34, 35 //INDICES PENTAGONO
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    let scutoid = {
        buffer: vertexBuffer, colorBuffer:colorBuffer, indices:indexBuffer,
        vertSize:3, nVerts:36, colorSize:4, nColors: 36, nIndices:60,
        primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
    }
    //Vertices de tamano 3, 36 de ellos, con colores de tamano 4 para los 36 vertices y se generaron 26 indices

    mat4.translate(scutoid.modelViewMatrix, scutoid.modelViewMatrix, translation); //Traslacion aplicada a figura

    scutoid.update = function() //Funcion de actualziacion del movimiento de la figura
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return scutoid;
}

//Creacion de Dodecaedro
function createDodecahedron(gl, translation, rotationAxis)
{
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        //BASE INFERIOR DE FIGURA
        0.5, 0, 0, //A
        -0.5, 0, 0, //B
        0.81, -0.95, 0, //E
        -0.81, -0.95, 0, //C
        0, -1.54, 0, //D

        //LOS SIGUIENTES 5 "BLOQUES" DE VERTICES SON PARA LAS CARAS "INFERIORES"
        -0.5, 0 , 0, 
        -0.81, 0.43, 0.85, //F
        -1.31, -0.26, 1.38, //L
        -1.31, -1.11, 0.85, //G
        -0.81, -0.95, 0,
        
        -0.81, -0.95, 0,
        -1.31, -1.11, 0.85,
        -0.81, -1.8, 1.38, //M
        0, -2.06, 0.85, //H
        0, -1.54, 0,

        -0.5, 0, 0,
        -0.81, 0.43, 0.85,
        0, 0.69, 1.38, //K
        0.81, 0.43, 0.85, //J
        0.5, 0, 0,

        0.5, 0, 0,
        0.81, 0.43, 0.85,
        1.31, -0.26, 1.38, //O
        1.31, -1.11, 0.85, //I
        0.81, -0.95, 0,

        0.81, -0.95, 0,
        1.31, -1.11, 0.85,
        0.81, -1.8, 1.38, //N
        0, -2.06, 0.85,
        0, -1.54, 0,

        //LOS SIGUIENTES 5 "BLOQUES" DE VERTICES SON PARA LAS CARAS "SUPERIORES"
        1.31, -1.11, 0.85,
        0.81, -1.8, 1.38,
        0.5, -1.38, 2.23, //S
        0.81, -0.43, 2.23, //T
        1.31, -0.26, 1.38,

        0.81, 0.43, 0.85,
        1.31, -0.26, 1.38,
        0.81, -0.43, 2.23,
        0, 0.16, 2.23, //P
        0, 0.69, 1.38,

        -0.81, 0.43, 0.85,
        0, 0.69, 1.38,
        0, 0.16, 2.23,
        -0.81, -0.43, 2.23, //Q
        -1.31, -0.26, 1.38,

        -1.31, -1.11, 0.85,
        -1.31, -0.26, 1.38,
        -0.81, -0.43, 2.23,
        -0.5, -1.38, 2.23, //R
        -0.81, -1.8, 1.38, //M

        0, -2.06, 0.85,
        -0.81, -1.8, 1.38,
        -0.5, -1.38, 2.23,
        0.5, -1.38, 2.23,
        0.81, -1.8, 1.38,

        //BASE SUPERIOR DE FIGURA
        -0.5, -1.38, 2.23, 
        -0.81, -0.43, 2.23,
        0, 0.16, 2.23,
        0.81, -0.43, 2.23,
        0.5, -1.38, 2.23
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let colorBuffer = gl.createBuffer(); //Creacion Buffer de colores
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    //Arreglo con codigos para colores de cada cara de la figura
    let faceColors = [
        [1.0, 0.0, 0.0, 1],
        [0.0, 1.0, 0.0, 1],
        [0.0, 0.0, 1.0, 1],
        [1.0, 1.0, 0.0, 1],
        [1.0, 0.0, 1.0, 1],
        [0.0, 1.0, 1.0, 1],
        [0.80,0.70,0.55,1],
        [0.68,0.45,0.55,1],
        [0.2, 0.2, 0.99, 1],
        [0.45, 0.99, 0.45, 1],
        [0.85, 0.55, 0.1, 1],
        [0.12, 0.1, 0.3, 1]
    ];

    let vertexColors = [];

    //Se agrega un color distinto a los 5 vertices de cada una de las caras de la figura
    faceColors.forEach(color => {
        for(let j=0; j<5; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let dodecahedronIndexBuffer = gl.createBuffer(); //Buffer para indices que crean triangulos en las caras de las figuras
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodecahedronIndexBuffer);

    //Arreglo de indices para crear triangulos
    let dodecahedronIndices = [
        0, 1, 2, 1, 2, 3, 4, 3, 2, //INDICES BASE INFERIOR
        5, 6, 7, 5, 7, 9, 9, 8, 7, //INDICES CARA INFERIOR 1
        10, 11, 12, 10, 12, 14, 14, 13, 12, //INDICES CARA INFERIOR 2
        15, 16, 17, 15, 17, 19, 19, 18, 17, //INDICES CARA INFERIOR 3
        20, 21, 22, 20, 22, 24, 24, 23, 22, //INDICES CARA INFERIOR 4
        25, 26, 27, 25, 27, 29, 29, 28, 27, //INDICES CARA INFERIOR 5
        30, 31, 32, 30, 32, 34, 34, 33, 32, //INDICES CARA SUPERIOR 1
        35, 36, 37, 35, 37, 39, 39, 38, 37, //INDICES CARA SUPERIOR 2
        40, 41, 42, 40, 42, 44, 44, 43, 42, //INDICES CARA SUPERIOR 3
        45, 46, 47, 45, 47, 49, 49, 48, 47, //INDICES CARA SUPERIOR 4
        50, 51, 52, 50, 52, 54, 54, 53, 52, //INDICES CARA SUPERIOR 5
        55, 56, 57, 55, 57, 59, 59, 58, 57 //INDICES BASE INFERIOR
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodecahedronIndices), gl.STATIC_DRAW);
    
    let dodecahedron = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:dodecahedronIndexBuffer,
            vertSize:3, nVerts:60, colorSize:4, nColors: 60, nIndices:108,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
    };
    //Vertices de tamano 3, 60 de ellos, con colores de tamano 4 para los 60 vertices y se generaron 108 indices

    mat4.translate(dodecahedron.modelViewMatrix, dodecahedron.modelViewMatrix, translation); //Traslacion aplicada a figura

    dodecahedron.update = function() //Funcion de actualziacion del movimiento de la figura
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return dodecahedron;
}

//Creacion de Octaedro
function createOctahedron(gl, translation, rotationAxis)
{
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        //CARA 1
        1,0,0,
        0,1,0,
        0,0,1,

        //CARA 2
        1,0,0,
        0,1,0,
        0,0,-1,

        //CARA 3
        1,0,0,
        0,-1,0,
        0,0,1,

        //CARA 4
        1,0,0,
        0,-1,0,
        0,0,-1,

        //CARA 5
        -1,0,0,
        0,1,0,
        0,0,1, 

        //CARA 6
        -1,0,0,
        0,1,0,
        0,0,-1,

        //CARA 7
        -1,0,0,
        0,-1,0,
        0,0,1,
    
        //CARA 8
        -1,0,0,
        0,-1,0,
        0,0,-1,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    let colorBuffer = gl.createBuffer(); //Creacion Buffer de colores
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    //Arreglo con codigos para colores de cada cara de la figura
    let faceColors = [
        [1.0, 0.0, 0.0, 1],
        [0.0, 1.0, 0.0, 1],
        [0.0, 0.0, 1.0, 1],
        [1.0, 1.0, 0.0, 1],
        [1.0, 0.0, 1.0, 1],
        [0.0, 1.0, 1.0, 1],
        [0.80,0.70,0.55,1],
        [0.68,0.45,0.55,1]
    ];

    let vertexColors = [];
    
    //Se agrega color a cada uno de los 3 vertices por cara
    faceColors.forEach(color =>{
        for(let j=0; j<3; j++)
            vertexColors.push(...color);      
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let indexBuffer = gl.createBuffer(); //Buffer para indices que crean triangulos en las caras de las figuras
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    let indices = [
       0,1,2, //INDICE CARA 1
       3,4,5, //INDICE CARA 2
       6,7,8, //INDICE CARA 3
       9,10,11, //INDICE CARA 4
       12,13,14, //INDICE CARA 5
       15,16,17, //INDICE CARA 6
       18,19,20, //INDICE CARA 7
       21,22,23 //INDICE CARA 8
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    let octahedron = {
        buffer: vertexBuffer, colorBuffer:colorBuffer, indices:indexBuffer,
        vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:24,
        primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
    }
    //Vertices de tamano 3, 24 de ellos, con colores de tamano 4 para los 24 vertices y se generaron 24 indices

    mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation); //Traslacion aplicada a figura

    octahedron.update = function() //Funcion de actualziacion del movimiento de la figura
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
        
        //Se modifica traslacion dependdiendo de posicion de figura
        if(primerMov == 0){
            if(mov<212){ //Si no ha llegado a la parte superior, sigue subiendo
                yOcta = 0.005; //Sube
                mov+= 1;
            }
            else{
                primerMov = 1;
            }
        }
        else{
            if(mov > -212){ //Si no ha llegado a la parte inferio, sigue bajando
                yOcta = -0.005;
                mov-= 1;
            }
            else{
                primerMov = 0;
            }
        }
       mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0,yOcta,0]); //Actualizacion de traslacion        
    };
    return octahedron;
}

function bindShaderAttributes(gl, shaderProgram)
{
    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");
}

//Funcion para dibujar las figuras en el plano
function draw(gl, shaderProgram, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // set the shader to use
    gl.useProgram(shaderProgram);

    for(let i = 0; i< objs.length; i++)
    {
        let obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

//Funcion para hacer la actualizacion de la rotacion y traslacion de figuras
function update(gl, shaderProgram, objs) 
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(()=> update(gl, shaderProgram, objs));

    draw(gl,shaderProgram, objs);

    objs.forEach(obj =>{
        obj.update();
    })
}

main();