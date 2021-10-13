import * as THREE from "../libs/three.js/r131/three.module.js";
import { OrbitControls } from '../libs/three.js/r125/controls/OrbitControls.js';
import { OBJLoader } from '../libs/three.js/r125/loaders/OBJLoader.js';
import { MTLLoader } from '../libs/three.js/r125/loaders/MTLLoader.js';

let renderer = null, scene = null, camera = null;
let orbitControls = null;
let materials = {};
let textureMap = null;
let bumpMap = null;
let sistemaSolar = null;
let planetas = [];
let velocidadRotaciones = [];
let distanciaAlSol = [];
const velocidadesRotacion = [1, 0.7, 0.65, 0.48, 0.38, 0.32, 0.28, 0.18, 0.12];
let posicionesLunas = [[], [], [], [], [], [], [], [], []]
let lunas = [[], [], [], [], [], [], [], [], []];
let esfera = null;

const duration = 5000; // ms
let currentTime = Date.now();

function main()
{
    const canvas = document.getElementById("webglcanvas");
    createScene(canvas);
    update();
}

//Realiza las actualizaciones sobre los diferentes componentes del Sistema Solar 
function animate() 
{
    const now = Date.now();
    currentTime = now;

    let valorTraslacion = currentTime * 0.0008

    planetas.forEach((planeta, index) => {
        const velocidad = velocidadRotaciones[index];
        planeta.rotation.y += velocidad
        planeta.position.set(
            Math.cos(valorTraslacion * velocidadesRotacion[index]) * distanciaAlSol[index], 0, Math.sin(valorTraslacion * velocidadesRotacion[index]) * distanciaAlSol[index]
        );
      });

    for(var i = 0; i <lunas.length; i++){
        for(var j = 0; j<lunas[i].length; j++){
            console.log(lunas[i][j].position.z)
            lunas[i][j].rotation.y += 0.1 //Al parecer las lunas tienen rotacion y traslacion jaja
            lunas[i][j].position.set(
                Math.cos(valorTraslacion * velocidadesRotacion[j]) * (posicionesLunas[i][j][1] - distanciaAlSol[i]), posicionesLunas[i][j][0], 
                Math.sin(valorTraslacion * velocidadesRotacion[j]) * (posicionesLunas[i][j][1] - distanciaAlSol[i])
            )
        }
    }
}

//Actualiza constantemente la escena
function update()
{
    requestAnimationFrame(function() { update(); });
    //Hace el rendering de la imagen
    renderer.render( scene, camera );
    animate();
    orbitControls.update()
}

function materiales(mapUrl, bumpMapUrl, nombreTexture){
    textureMap = new THREE.TextureLoader().load(mapUrl);
    if(bumpMapUrl != null){
        bumpMap = new THREE.TextureLoader().load(bumpMapUrl);
    }
    else{
        bumpMap = ""
    }
    if(nombreTexture == "solTexture"){}
    materials[nombreTexture] = new THREE.MeshPhongMaterial({map: textureMap, lightMap:textureMap, bumpMap: bumpMap, bumpScale: 0.06})
}

function ajustarPlaneta(sistemaSolar, planeta, distancia, escala, rotacion){
    planeta.visible = true;
    planeta.position.set(0,0,distancia);
    planeta.scale.set(escala, escala, escala);
    sistemaSolar.add(planeta);
    planetas.push(planeta);
    velocidadRotaciones.push(rotacion/20);
    distanciaAlSol.push(distancia);
    
    let orbitaPlaneta =  new THREE.Shape();
    orbitaPlaneta.moveTo(distancia, 0); // https://threejs.org/docs/#api/en/extras/core/Path.moveTo
    orbitaPlaneta.absarc(0,0,distancia, 0, 2 * Math.PI, false);
    let puntosOrbita = orbitaPlaneta.getPoints(365);
    let geometriaOrbita = new THREE.BufferGeometry().setFromPoints(puntosOrbita);
    geometriaOrbita.rotateX(THREE.Math.degToRad(-90))
    let materialOrbita = new THREE.LineBasicMaterial({color: 0xbec2cb});
    let orbitaDibujada = new THREE.Line(geometriaOrbita, materialOrbita)
    scene.add(orbitaDibujada);
}

function crearLuna(indicePlaneta, numeroLunas){
    if (numeroLunas == 0)
        return;
    else{
        var luna = new THREE.Mesh(esfera, materials["moonTexture"])
        luna.visible = true;
        let y = (Math.random() * (0.1 - 0.01) + 0.01)
        let z = planetas[indicePlaneta].position.z + (Math.random() * (2 - 1.04) + 1.04)
        luna.position.set(0, y, z)
        luna.scale.set(.02, .02, .02)
        sistemaSolar.add(luna);
        lunas[indicePlaneta].push(luna)
        posicionesLunas[indicePlaneta].push([y,z])
        crearLuna(indicePlaneta, numeroLunas - 1);
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
    camera.position.set(-9,6,14)
    scene.add(camera);

    orbitControls = new OrbitControls(camera, renderer.domElement)

    sistemaSolar = new THREE.Object3D;
    let solGrupo = new THREE.Object3D;
    sistemaSolar.add(solGrupo)

    const light = new THREE.PointLight(0xffff00, 1);
    light.castShadow = true;
    
    materiales("./textures/sunmap.jpg", null, "solTexture");
    esfera = new THREE.SphereGeometry(2,50,50)
    let sol = new THREE.Mesh(esfera, materials["solTexture"])
    sol.visible = true;
    solGrupo.add(sol, light);

    materiales("./textures/moonmap1k.jpg", "./textures/moonbump1k.jpg", "moonTexture");

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
    ajustarPlaneta(sistemaSolar, jupiter, 34.2/1.2, (.5)*1.5, 2.1)
    crearLuna(4,5)

    materiales("./textures/saturnmap.jpg", null, "saturnTexture")
    let saturno =  new THREE.Mesh(esfera, materials["saturnTexture"])
    ajustarPlaneta(sistemaSolar, saturno, (58)/1.2, .44 *1.5, 2)
    crearLuna(5,5)

    materiales("./textures/uranusmap.jpg", null, "uranusTexture")
    let urano =  new THREE.Mesh(esfera, materials["uranusTexture"])
    ajustarPlaneta(sistemaSolar, urano, (80)/1.2, 0.35 *1.5, 1.3)
    crearLuna(6,4)

    materiales("./textures/neptunemap.jpg", null, "neptuneTexture")
    let neptuno =  new THREE.Mesh(esfera, materials["neptuneTexture"])
    ajustarPlaneta(sistemaSolar, neptuno, (105)/1.2, 0.335 *1.5, 1.35)
    crearLuna(7,3)

    materiales("./textures/plutomap1k.jpg", null, "plutoTexture")
    let pluton =  new THREE.Mesh(esfera, materials["plutoTexture"])
    ajustarPlaneta(sistemaSolar, pluton, (120)/1.2, 0.09 *1.5, 0.68)
    crearLuna(8,3)

    scene.add(sistemaSolar);
}

window.onload = () => main();