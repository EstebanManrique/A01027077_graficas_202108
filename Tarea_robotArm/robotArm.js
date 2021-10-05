import * as THREE from "../libs/three.js/r131/three.module.js"
import {addMouseHandler} from "./sceneHandlers.js" //Script para usar slider para controlar zoom y rotacion del brazo para verlo de distintos angulos

let renderer = null, scene = null, camera = null;

const duration = 5000; // ms
let currentTime = Date.now();

function main() 
{
    const canvas = document.getElementById("webglcanvas");
    createScene(canvas);
    update();
}

//Realiza las actualizaciones sobre los diferentes componentes de la escena y el brazo 
function animate() 
{
    const now = Date.now();
    const deltat = now - currentTime;
    currentTime = now;
    const fract = deltat / duration;
    const angle = Math.PI * 2 * fract;
}

//Actualiza constantemente la escena
function update()
{
    requestAnimationFrame(function() { update(); });
    //Hace el rendering de la imagen
    renderer.render( scene, camera );
    animate();
}

//Crea la escena y todos sus componentes dentro de ellos
function createScene(canvas)
{   
    //Crea el Three,js renderer
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    //Define el size del viewport
    renderer.setSize(canvas.width, canvas.height);
    
    //Crea la escena de Three.js
    scene = new THREE.Scene();

    //Le da color al fondo de la escena
    scene.background = new THREE.Color( 0.2, 0.2, 0.2 );

    //Agrega una camara a la escena
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.z = 24;
    scene.add(camera);

    const light = new THREE.DirectionalLight( 0xffffff, 1.0);

    //Le da posición y presencia a una fuente de luz en la escena
    light.position.set(-.5, .2, 1);
    light.target.position.set(0,-2,0);
    scene.add(light);

    //Luz Global de la escena
    const ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
    scene.add(ambientLight);

    //Se asigna imagen que va a servir como textura y se le aplica a material
    const textureUrl = "./img/goldTexture.jpg";
    const texture = new THREE.TextureLoader().load(textureUrl);
    const material = new THREE.MeshPhongMaterial({ map: texture });

    //Se crean cinco grupos de objetos, para cada componente importante del brazo
    const brazoGroup = new THREE.Object3D //Incluye al brazo completo y en particular al hombro, brazo y grupo del codo
    const codoGroup = new THREE.Object3D //Incluye al codo y al grupo del antebrazo
    const antebrazoGroup = new THREE.Object3D //Incluye al antebrazo y al grupo de la muneca
    const wristGroup = new THREE.Object3D //Incluye a la muneca y a un grupo que contiene a la mano
    const manoGroup = new THREE.Object3D //Tiene dentro de si a la mano

    //Tres geometrías son usadas para el brazo
    let poliedroLargo = new THREE.BoxGeometry(.8,2,1) //Usada para el antebrazo y el brazo 
    let poliedroCorto = new THREE.BoxGeometry(.6,.86,1) //Usada para la mano
    let cuboSencillo = new THREE.BoxGeometry(0.5,0.5,0.5) //Usada para uniones pequenas, como la muneca, dodo y hombro

    //Se crean las partes del cuerpo mediante la asociacion de las geometrias y los materiales
    let hombro = new THREE.Mesh(cuboSencillo, material)
    let brazo = new THREE.Mesh(poliedroLargo, material)
    let codo = new THREE.Mesh(cuboSencillo, material)
    let antebrazo = new THREE.Mesh(poliedroLargo, material)
    let wrist = new THREE.Mesh(cuboSencillo, material)
    let mano = new THREE.Mesh(poliedroCorto, material)

    //Creacion del grupo del hombro y brazo, el mas general
    brazoGroup.add(hombro,brazo,codoGroup)
    brazoGroup.position.set(0, 2.2, 0)
    brazo.position.set(0,-1.25,0)

    //Creacion del grupo del codo
    codoGroup.add(codo,antebrazoGroup)
    codoGroup.position.set(0,-2.5,0)

    //Creacion del grupo del antebrazo
    antebrazoGroup.add(antebrazo,wristGroup)
    antebrazoGroup.position.set(0,-1.25,0)

    //Creacion del grupo de la muneca/wrist
    wristGroup.add(wrist,manoGroup)
    wristGroup.position.set(0,-1.25,0)

    //Creacion del grupo de la mano
    manoGroup.add(mano)
    manoGroup.position.set(0,-.68,0)

    //Se agrega el brazo completo a la escena
    scene.add(brazoGroup)

    //Uso de GUI para la definición de los sliders para controlar el movimiento del brazo
    const gui = new dat.GUI({autoPlace: true})
    const hombroGUI = gui.addFolder('Shoulder') //Sliders para el hombro y practicamente todo el brazo
    hombroGUI.add(brazoGroup.rotation, 'x', -1.3, 1.3).step(0.01)
    hombroGUI.add(brazoGroup.rotation, 'z', -1.45, 1.45).step(0.01)
    const codoGUI = gui.addFolder('Elbow') //Sliders para el codo
    codoGUI.add(codoGroup.rotation, 'x', -1.5, 1.5).step(0.01)
    const antebrazoGUI = gui.addFolder("Forearm") //Sliders para el antebrazo
    antebrazoGUI.add(antebrazoGroup.rotation, 'y', -0.85, 0.85).step(0.01)
    const wristGUI = gui.addFolder("Wrist") //Sliders para la muneca
    wristGUI.add(wristGroup.rotation, 'x', -.45, 0.45).step(0.01)
    const manoGUI = gui.addFolder("Hand") //Sliders para la mano
    manoGUI.add(manoGroup.rotation, 'x', -0.3, 0.3).step(0.01)
    manoGUI.add(manoGroup.rotation, 'z', -0.15, 0.15).step(0.01)

    //Usado para poder controlar la ubicacion de los sliders
    var customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);

    //Se predifine rotacion para ver el brazo desde cierto "angulo"
    brazoGroup.rotation.y = -0.55

    addMouseHandler(canvas, brazoGroup); //Le da rotacion al brazo completo y se puede modificar zoom
}

main();