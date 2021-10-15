import * as THREE from "../libs/three.js/r131/three.module.js";

//Imports para manejo de la escena y carga de modelo de esteroides
import { OrbitControls } from '../libs/three.js/r131/controls/OrbitControls.js';
import { OBJLoader } from '../libs/three.js/r131/loaders/OBJLoader.js';
import { MTLLoader } from '../libs/three.js/r131/loaders/MTLLoader.js';

let renderer = null, scene = null, camera = null; //Elementos generales de la escena
let orbitControls = null; //Controlara la escena
let materials = {}; //Se guardaran todas las imagenes a servir para los materiales
let textureMap = null; //Usado para la carga de materiales (imagen con color normal)
let bumpMap = null; //Usado para la carga de materiales (imagen con "relieve")
let sistemaSolar = null; //Variable a ser el grupo con todos los astros
let cinturonAsteroides = null; //Variable donde se condensaran a todos los asteroides 
let planetas = []; //Se guardaran todos los planetas en este arreglo
let velocidadRotaciones = []; //Se guardan las velocidades para las rotaciones de los plan
const velocidadesRotacion = [1, 0.7, 0.65, 0.48, 0.38, 0.32, 0.28, 0.18, 0.12];
let distanciaAlSol = []; //Radio de las orbitas del planeta
let posicionesLunas = [[], [], [], [], [], [], [], [], []] //Se guardan posiciones de todas las lunas
let lunas = [[], [], [], [], [], [], [], [], []]; //Se guardan las lunas
let esfera = null; //Usado para la geometria de los astros, a excepcion de los asteroides
let asteroide = null; //Usado para replicar todos los asteroides
let asteroides = []; //Arreglo para guardar todos los asteroides del cinturon

//Se definen los archivos de .obj y .mtl para la carga del modelo del asteroide
let objMtlModelUrl = {obj:'./Asteroide/10464_Asteroid_v1_Iterations-2.obj', mtl:'./Asteroide/10464_Asteroid_v1_Iterations-2.mtl'};

let currentTime = Date.now();

function main()
{
    cargarAsteroide(objMtlModelUrl); //Se carga el asteroide de manera primaria, por tomar cierto tiempo para lograrlo
    const canvas = document.getElementById("webglcanvas"); //Se obtiene el canvas donde se visualiza el sistema
    setTimeout(function(){createScene(canvas); update();}, 1500); //Se espera dos segundos antes de crear todo el sistema
}

//Realiza las actualizaciones sobre los diferentes componentes del Sistema Solar 
function animate() 
{
    const now = Date.now();
    currentTime = now;

    let valorTraslacion = currentTime * 0.0008

    //Animaciones y actualizaciones para los planetas
    planetas.forEach((planeta, index) => {
        const velocidad = velocidadRotaciones[index];
        planeta.rotation.y += velocidad / 2.9 //Rotacion sobre el eje de los planetas
        //Traslacion de cada uno de los planetas alrededor del sol
        planeta.position.set(
            Math.cos(valorTraslacion * velocidadesRotacion[index]) * distanciaAlSol[index], 0, Math.sin(valorTraslacion * velocidadesRotacion[index]) * distanciaAlSol[index]
        );
      });

    //Animaciones y actualizaciones para las lunas
    for(var i = 0; i <lunas.length; i++){
        for(var j = 0; j<lunas[i].length; j++){
            lunas[i][j].rotation.y += 0.1 //Al parecer las lunas tienen rotacion y traslacion jaja
            //Traslacion a medida de cada una de las lunas para cada uno de los planetas
            lunas[i][j].position.set(
                Math.cos(valorTraslacion * velocidadesRotacion[j]) * (posicionesLunas[i][j][1] - distanciaAlSol[i]), posicionesLunas[i][j][0], 
                Math.sin(valorTraslacion * velocidadesRotacion[j]) * (posicionesLunas[i][j][1] - distanciaAlSol[i])
            )
        }
    }
    
    //Rotacion para cada uno de los asteroides del cintuon de asteroides
    for(var object of asteroides){
        if(object){
            object.rotation.x += 0.03;
            object.rotation.y += 0.03;
            object.rotation.z += 0.03;
        }
    }
    //Traslacion del cintuón completo de asteroides alrededor del sol 
    cinturonAsteroides.rotation.y += .0042
}

//Actualiza constantemente la escena
function update()
{
    requestAnimationFrame(function() { update(); });
    //Hace el rendering de la imagen
    renderer.render( scene, camera );
    animate();
    //Actualizacion de orbitControl para manejo de la escena
    orbitControls.update()
}

//Carga de los materiales para planetas, lunas y el sol
function materiales(mapUrl, bumpMapUrl, nombreTexture){
    textureMap = new THREE.TextureLoader().load(mapUrl); //Definicion de normal map
    if(bumpMapUrl != null){
        bumpMap = new THREE.TextureLoader().load(bumpMapUrl); //Definicion de bump map
    }
    else{
        bumpMap = ""
    }
    if(nombreTexture == "solTexture"){}
    //Definicion del material para los astros
    materials[nombreTexture] = new THREE.MeshPhongMaterial({map: textureMap, lightMap:textureMap, bumpMap: bumpMap, bumpScale: 0.06})
}

//Generacion y definicion de elementos de los planetas y orbitas
function ajustarPlaneta(sistemaSolar, planeta, distancia, escala, rotacion){
    planeta.visible = true;
    planeta.position.set(0,0,distancia); //Posicion del planeta
    planeta.scale.set(escala, escala, escala); //Escala/Tamano del planeta
    sistemaSolar.add(planeta); //Agrega el planeta al sistema sola
    planetas.push(planeta); //Agrega el planeta a un arreglo de planetas
    velocidadRotaciones.push(rotacion/20); //Se define velocidad de rotacion del planeta
    distanciaAlSol.push(distancia); //Se define la distancia entre planeta y sol
    
    let orbitaPlaneta =  new THREE.Shape(); //Usada para la generación de la órbita
    orbitaPlaneta.moveTo(distancia, 0); // https://threejs.org/docs/#api/en/extras/core/Path.moveTo
    orbitaPlaneta.absarc(0,0,distancia, 0, 2 * Math.PI, false); //Definición de la Curva
    let puntosOrbita = orbitaPlaneta.getPoints(365); //Obtención de puntos para realizar la curva
    let geometriaOrbita = new THREE.BufferGeometry().setFromPoints(puntosOrbita); //Definición de la órbita con puntos previamente obtenidos
    geometriaOrbita.rotateX(THREE.Math.degToRad(-90)) //Rotacion de la orbita para fines de muestra
    let materialOrbita = new THREE.LineBasicMaterial({color: 0xbec2cb}); //Material/Definicion de color (silver) para la orbita del planeta
    let orbitaDibujada = new THREE.Line(geometriaOrbita, materialOrbita) //Definicion final de la orbita
    scene.add(orbitaDibujada);
}

//Carga de anillo para planetas que lo requieran
function cargarAnillo(texturaAnillo, planeta){
    var textura = new THREE.TextureLoader().load(texturaAnillo); //Carga de textura para el anillo en cuestion
    const geometriaAnillo = new THREE.RingBufferGeometry(3,4,128) //Geometria de "anillo"
    var posicion = geometriaAnillo.attributes.position;
    
    //Se uso este link como referencia: https://codepen.io/prisoner849/pen/zYOgroW?editors=0010
    var vectorPosiciones = new THREE.Vector3(); 
    for (let i = 0; i < posicion.count; i++){
        vectorPosiciones.fromBufferAttribute(posicion, i);
        geometriaAnillo.attributes.uv.setXY(i, vectorPosiciones.length() < 4 ? 0 : 1, 1);
    }
  
    //Definicion del material para el anillo en cuestion
    const material = new THREE.MeshBasicMaterial({
      map: textura,
      color: 0xFBE7C6,
      side: THREE.DoubleSide,
      transparent: true
    });
    
    const anillo = new THREE.Mesh(geometriaAnillo, material);
    anillo.rotateX(THREE.Math.degToRad(-60)) //Rotacion del anillo para adecuarlo al planeta
    planeta.add(anillo) //Se liga el anillo al planeta
}

//Generacion y definicion de elementos para las lunas
function crearLuna(indicePlaneta, numeroLunas){
    if (numeroLunas == 0) //En caso de haber completado toda la creacion de lunas para ese planeta
        return;
    else{
        var luna = new THREE.Mesh(esfera, materials["moonTexture"]) //Definicion de mesh ya con Material
        luna.visible = true;
        let y = (Math.random() * (2.2 - 1.1) + 1.1) 
        let z = planetas[indicePlaneta].position.z + (Math.random() * (7 - 5) + 5)
        luna.position.set(0, y, z) //Posicionamiento de la luna
        luna.scale.set(.14, .14, .14) //Escala de la luna
        sistemaSolar.add(luna) //Se agrega la luna al sistema solar
        planetas[indicePlaneta].add(luna) //Se agrega la luna al grupo del planeta
        lunas[indicePlaneta].push(luna) //Se guarda luna en un arreglo para update()
        posicionesLunas[indicePlaneta].push([y,z]) //Se guardan posiciones iniciales de la luna
        crearLuna(indicePlaneta, numeroLunas - 1);
    }
}

//Creacion completa del cinturón de asteroides
function crearCintunonAsteroides(distancia, numeroAsteroides){
    cinturonAsteroides = new THREE.Object3D;
    cinturonAsteroides.visible = true;
    cinturonAsteroides.position.set(0,0,0); //Posicionamiento del grupo del sistema de asteroides
    let orbitaAsteroides =  new THREE.Shape();
    orbitaAsteroides.moveTo(distancia, 0); // https://threejs.org/docs/#api/en/extras/core/Path.moveTo
    orbitaAsteroides.absarc(0,0,distancia, 0, 2 * Math.PI, false); //Definición de la Curva
    let puntosOrbitaA = orbitaAsteroides.getPoints(numeroAsteroides); //Obtención de puntos para realizar la curva
    let geometriaOrbitaA = new THREE.BufferGeometry().setFromPoints(puntosOrbitaA); //Definición de la órbita con puntos previamente obtenidos
    geometriaOrbitaA.rotateX(THREE.Math.degToRad(-90)) //Rotacion de la orbita para fines de muestra
    let materialOrbitaA = new THREE.LineBasicMaterial({color: 0xff0000}); //Material/Definicion de color (rojo) para la orbita del planeta
    let orbitaDibujadaA = new THREE.Line(geometriaOrbitaA, materialOrbitaA)
    scene.add(orbitaDibujadaA); //Definicion final de la orbita
    
    for(var i = 0; i<((numeroAsteroides) * 2) / 6; i++){ //Ciclado para crear todos los asteroides
        let asteroideNuevo = asteroide.clone(); //Se usa el metodo clone para optimizar el proceso
        asteroideNuevo.scale.set(0.0005, 0.0005, 0.0005); //Escala del asteroides
        
        //Definicion aleatoria, dentro del rango del cintuon de asteroides, de las posiciones de cada uno de los asteroides
        let x = (Math.random() * (3.4 - 2) + 2)
        let y = (Math.random() * (1 - 0.5) + 0.5)
        let z = (Math.random() * (3. - 2) + 2)
        let signoX = Math.random()
        let signoY = Math.random()
        let signoZ = Math.random()
        
        //Definicion de "cuadrante" para posicionar el asteroide en el cinturon
        if(signoX > 0.49){
            x = x * -1
        }
        if(signoY > 0.49){
            y = y * -1
        }
        if(signoZ > 0.49){
            z = z * -1
        }

        //Se define la posicion del asteroide
        asteroideNuevo.position.x +=  geometriaOrbitaA.attributes.position.array[(27*i)] + x;
        asteroideNuevo.position.y +=  geometriaOrbitaA.attributes.position.array[(27*i) + 1] + y;
        asteroideNuevo.position.z +=  geometriaOrbitaA.attributes.position.array[(27*i) + 2] + z;
        
        cinturonAsteroides.add(asteroideNuevo); //Se arega el asteroide al cinturon
        asteroides.push(asteroideNuevo); //Se agrega asteroide a un arreglo para su uso en update()
    }
    scene.add(cinturonAsteroides)
}

//Manejo de errores
function onError ( err ){ console.error( err ); };

function onProgress( xhr ) {
    if ( xhr.lengthComputable ) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( xhr.target.responseURL, Math.round( percentComplete, 2 ) + '% downloaded' );
    }
}

//Se carga los arhivos para el modelo del asteroide
async function cargarAsteroide(model){
    try
    {
        const mtlLoader = new MTLLoader();
        const materials = await mtlLoader.loadAsync(model.mtl, onProgress, onError); //Definicion del archivo .mtl
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        asteroide = await objLoader.loadAsync(model.obj, onProgress, onError); //Definicion del archivo .obj
    }
    //Manejo de errores
    catch (err){
        onError(err);
    }
}

function createScene(canvas)
{
    //Crea el Three.js renderer
    renderer = new THREE.WebGL1Renderer({canvas: canvas, antialias: true});

    //Define el tamano del viewport
    renderer.setSize(canvas.width, canvas.height);

    //Crea la escena de Three.js
    scene = new THREE.Scene();

    //Se asigna fondo al sistema solar y se asigna a la escena
    const fondoSistemaSolar = new THREE.TextureLoader().load("./textures/fondoSistemaSolar.jpg")
    scene.background = fondoSistemaSolar

    //Agrega una camara a la escena 
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(-9,6,25)
    scene.add(camera);

    //Manejo de la escena y desplazamiento dentro de la misma
    orbitControls = new OrbitControls(camera, renderer.domElement)

    //Definicion de grupos principales del sistema solar
    sistemaSolar = new THREE.Object3D;
    let solGrupo = new THREE.Object3D;
    sistemaSolar.add(solGrupo)

    const light = new THREE.PointLight(0xffff00, 1); //Fuente de Luz centralizada, asimilando la naturaleza del sol
    light.castShadow = true;
    
    //Creacion del sol
    materiales("./textures/sunmap.jpg", null, "solTexture");
    esfera = new THREE.SphereGeometry(2,50,50)
    let sol = new THREE.Mesh(esfera, materials["solTexture"])
    sol.visible = true;
    solGrupo.add(sol, light);

    materiales("./textures/moonmap1k.jpg", "./textures/moonbump1k.jpg", "moonTexture"); //Carga de materiales para las lunas del

    //Creacion de todos los planetas
    materiales("./textures/mercurymap.jpg", "./textures/mercurybump.jpg", "mercuryTexture");
    let mercurio = new THREE.Mesh(esfera, materials["mercuryTexture"])
    ajustarPlaneta(sistemaSolar, mercurio, 6/1.2, (.05)*1.5, 0.3)
    crearLuna(0,0)

    materiales("./textures/venusmap.jpg", "./textures/venusbump.jpg", "venusTexture")
    let venus =  new THREE.Mesh(esfera, materials["venusTexture"])
    ajustarPlaneta(sistemaSolar, venus, (11.37)/1.2, 0.125 *1., 0.1)
    crearLuna(1,0)

    materiales("./textures/earthmap1k.jpg", "./textures/earthbump1k.jpg", "earthTexture")
    let tierra =  new THREE.Mesh(esfera, materials["earthTexture"])
    ajustarPlaneta(sistemaSolar, tierra, (15.78)/1.2, 0.132 *1.5, 1)
    crearLuna(2,1)

    materiales("./textures/marsmap1k.jpg", "./textures/marsbump1k.jpg", "marsTexture")
    let marte =  new THREE.Mesh(esfera, materials["marsTexture"])
    ajustarPlaneta(sistemaSolar, marte, (24)/1.2, 0.07 *1.5, 1)
    crearLuna(3,2)

    materiales("./textures/jupitermap.jpg", null, "jupiterTexture");
    let jupiter= new THREE.Mesh(esfera, materials["jupiterTexture"])
    ajustarPlaneta(sistemaSolar, jupiter, 48/1.2, (.5)*1.5, 2.1)
    crearLuna(4,5)

    materiales("./textures/saturnmap.jpg", null, "saturnTexture")
    let saturno =  new THREE.Mesh(esfera, materials["saturnTexture"])
    ajustarPlaneta(sistemaSolar, saturno, (58)/1.2, .44 *1.5, 2)
    cargarAnillo("./textures/saturnringcolor.jpg", saturno)
    crearLuna(5,5)

    materiales("./textures/uranusmap.jpg", null, "uranusTexture")
    let urano =  new THREE.Mesh(esfera, materials["uranusTexture"])
    ajustarPlaneta(sistemaSolar, urano, (80)/1.2, 0.35 *1.5, 1.3)
    cargarAnillo("./textures/uranusringcolour.jpg", urano)
    crearLuna(6,4)

    materiales("./textures/neptunemap.jpg", null, "neptuneTexture")
    let neptuno =  new THREE.Mesh(esfera, materials["neptuneTexture"])
    ajustarPlaneta(sistemaSolar, neptuno, (105)/1.2, 0.335 *1.5, 1.35)
    crearLuna(7,3)

    materiales("./textures/plutomap1k.jpg", null, "plutoTexture")
    let pluton =  new THREE.Mesh(esfera, materials["plutoTexture"])
    ajustarPlaneta(sistemaSolar, pluton, (120)/1.2, 0.14 *1.5, 0.68)
    crearLuna(8,3)

    scene.add(sistemaSolar); //Se agrega sistema solar (aun sin asteroides) a la escena

    crearCintunonAsteroides(30, 8000); //Creacion del cinturon de asteroides
}

window.onload = () => main();