import * as THREE from "../libs/three.js/r131/three.module.js";
import { OrbitControls } from '../libs/three.js/r131/controls/OrbitControls.js';
import { OBJLoader } from '../libs/three.js/r131/loaders/OBJLoader.js';
import { MTLLoader } from '../libs/three.js/r131/loaders/MTLLoader.js';

let renderer = null, scene = null, camera = null;
let orbitControls = null;
let materials = {};
let textureMap = null;
let bumpMap = null;
let sistemaSolar = null;
let cinturonAsteroides = null;
let planetas = [];
let velocidadRotaciones = [];
let distanciaAlSol = [];
const velocidadesRotacion = [1, 0.7, 0.65, 0.48, 0.38, 0.32, 0.28, 0.18, 0.12];
let posicionesLunas = [[], [], [], [], [], [], [], [], []]
let lunas = [[], [], [], [], [], [], [], [], []];
let esfera = null;
let asteroide = null;
let asteroides = [];

let objMtlModelUrl = {obj:'./Asteroide/10464_Asteroid_v1_Iterations-2.obj', mtl:'./Asteroide/10464_Asteroid_v1_Iterations-2.mtl'};

let currentTime = Date.now();

function main()
{
    cargarAsteroide(objMtlModelUrl);
    const canvas = document.getElementById("webglcanvas");
    setTimeout(function(){createScene(canvas); update();}, 2000);
}

//Realiza las actualizaciones sobre los diferentes componentes del Sistema Solar 
function animate() 
{
    const now = Date.now();
    currentTime = now;

    let valorTraslacion = currentTime * 0.0008

    planetas.forEach((planeta, index) => {
        const velocidad = velocidadRotaciones[index];
        planeta.rotation.y += velocidad / 2.9
        planeta.position.set(
            Math.cos(valorTraslacion * velocidadesRotacion[index]) * distanciaAlSol[index], 0, Math.sin(valorTraslacion * velocidadesRotacion[index]) * distanciaAlSol[index]
        );
      });

    for(var i = 0; i <lunas.length; i++){
        for(var j = 0; j<lunas[i].length; j++){
            lunas[i][j].rotation.y += 0.1 //Al parecer las lunas tienen rotacion y traslacion jaja
            lunas[i][j].position.set(
                Math.cos(valorTraslacion * velocidadesRotacion[j]) * (posicionesLunas[i][j][1] - distanciaAlSol[i]), posicionesLunas[i][j][0], 
                Math.sin(valorTraslacion * velocidadesRotacion[j]) * (posicionesLunas[i][j][1] - distanciaAlSol[i])
            )
        }
    }
    
    for(const object of asteroides)
        if(object){
            object.rotation.x += 0.008;
            object.rotation.y += 0.008;
            object.rotation.z += 0.008;
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
        let y = (Math.random() * (2.2 - 1.1) + 1.1)
        let z = planetas[indicePlaneta].position.z + (Math.random() * (7 - 5) + 5)
        luna.position.set(0, y, z)
        luna.scale.set(.08, .08, .08)
        sistemaSolar.add(luna)
        planetas[indicePlaneta].add(luna)
        lunas[indicePlaneta].push(luna)
        posicionesLunas[indicePlaneta].push([y,z])
        crearLuna(indicePlaneta, numeroLunas - 1);
    }
}

function crearCintunonAsteroides(distancia, numeroAsteroides){
    cinturonAsteroides = new THREE.Object3D;
    sistemaSolar.add(cinturonAsteroides)
    cinturonAsteroides.visible = true;
    cinturonAsteroides.position.set(0,0,distancia);
    let orbitaAsteroides =  new THREE.Shape();
    orbitaAsteroides.moveTo(distancia, 0); // https://threejs.org/docs/#api/en/extras/core/Path.moveTo
    orbitaAsteroides.absarc(0,0,distancia, 0, 2 * Math.PI, false);
    let puntosOrbitaA = orbitaAsteroides.getPoints(numeroAsteroides);
    let geometriaOrbitaA = new THREE.BufferGeometry().setFromPoints(puntosOrbitaA);
    geometriaOrbitaA.rotateX(THREE.Math.degToRad(-90))
    let materialOrbitaA = new THREE.LineBasicMaterial({color: 0xff0000});
    let orbitaDibujadaA = new THREE.Line(geometriaOrbitaA, materialOrbitaA)
    scene.add(orbitaDibujadaA);
    
    for(var i = 0; i<((numeroAsteroides) * 2) / 6; i++){
        let asteroideNuevo = asteroide.clone(); 
        asteroideNuevo.scale.set(0.0005, 0.0005, 0.0005);
        
        let x = (Math.random() * (3.4 - 2) + 2)
        let y = (Math.random() * (1 - 0.5) + 0.5)
        let z = (Math.random() * (3. - 2) + 2)
        let signoX = Math.random()
        let signoY = Math.random()
        let signoZ = Math.random()
        if(signoX > 0.49){
            x = x * -1
        }
        if(signoY > 0.49){
            y = y * -1
        }
        if(signoZ > 0.49){
            z = z * -1
        }
        
        asteroideNuevo.position.x +=  geometriaOrbitaA.attributes.position.array[(27*i)] + x;
        asteroideNuevo.position.y +=  geometriaOrbitaA.attributes.position.array[(27*i) + 1] + y;
        asteroideNuevo.position.z +=  geometriaOrbitaA.attributes.position.array[(27*i) + 2] + z;
        sistemaSolar.add(asteroideNuevo);
        cinturonAsteroides.add(asteroideNuevo);
        scene.add(asteroideNuevo)
        asteroides.push(asteroideNuevo);
    }
}

function onError ( err ){ console.error( err ); };

function onProgress( xhr ) {

    if ( xhr.lengthComputable ) {

        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( xhr.target.responseURL, Math.round( percentComplete, 2 ) + '% downloaded' );
    }
}

async function cargarAsteroide(model){
    try
    {
        const mtlLoader = new MTLLoader();
        const materials = await mtlLoader.loadAsync(model.mtl, onProgress, onError);
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        asteroide = await objLoader.loadAsync(model.obj, onProgress, onError);
    }
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
    ajustarPlaneta(sistemaSolar, jupiter, 48/1.2, (.5)*1.5, 2.1)
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
    ajustarPlaneta(sistemaSolar, pluton, (120)/1.2, 0.14 *1.5, 0.68)
    crearLuna(8,3)

    scene.add(sistemaSolar);

    crearCintunonAsteroides(30, 8000);

}

window.onload = () => main();