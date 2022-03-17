import "./style.css";
import gsap from "gsap";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const world = {
  plane: {
    width: 250,
    height: 250,
    widthSegments: 50,
    heightSegments: 50,
  },
};

function generatePlane() {
  planeMesh.geometry.dispose();
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  );

  //OBJECT DESTRUCTERING - the length of the array is independant, of the code. not hard-coded length
  //Vertices Position Randomization
  const { array } = planeMesh.geometry.attributes.position;
  const randomValues = [];
  //Looping through all the vertices of the plane.
  //This For loop can be used for pushing a randomValues + If statement is for randomizing the verticies position, every three values bc the array goes in order of x,y,z repeating
  for (let i = 0; i < array.length; i++) {
    if (i % 3 === 0) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];

      array[i] = x + (Math.random() - 0.5) * 3;
      array[i + 1] = y + (Math.random() - 0.5) * 3;
      array[i + 2] = z + (Math.random() - 0.5) * 3;
    }

    randomValues.push(Math.random() * Math.PI * 2); //true randomization uses PI/2, not just -0.5 to 0.5
  }

  //creating a new property called "originalPosition", that stores the original array/location of the vertices before animating it
  //creating a new properly, based on randomValues from ~Line 35
  planeMesh.geometry.attributes.position.randomValues = randomValues;
  planeMesh.geometry.attributes.position.originalPosition =
    planeMesh.geometry.attributes.position.array;
  //color attribute addition
  const colors = [];
  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0.19, 0.4); //This is the RBG Color Values for planeMesh!
  }

  //Adding 'color' as an Float32BufferAttribute
  // 3 values for 3 colors ,rgb
  planeMesh.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );
}

//Raycaster - an object that tells where the laser is pointed into the screen, if it's touching an object
const raycaster = new THREE.Raycaster();

//3 Main things: scene, camera, renderer => remember to add mesh/lights/camera to the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio); //get rid of jagged edges. renders clearly on any screen
document.body.appendChild(renderer.domElement);

new OrbitControls(camera, renderer.domElement);
camera.position.z = 50; //move camera, otherwise it'll stay in the center of the scene

const planeGeometry = new THREE.PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments
);
const planeMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);
generatePlane();

//No light, no models show up, except for MeshBasicMaterial
const pointLight = new THREE.DirectionalLight(0xffffff, 1); //a spotlight
pointLight.position.set(0, 1, 1);

const ambientLight = new THREE.AmbientLight(0xff00ff); //everywhere consistent light

const backLight = new THREE.DirectionalLight(0xffffff, 1); //a spotlight
backLight.position.set(0, 0, -1);

scene.add(pointLight, backLight, ambientLight);

const listener = new THREE.AudioListener();
camera.add(listener);
const dogsound = new THREE.Audio(listener);
scene.add(dogsound);
const fairySound = new THREE.Audio(listener);
scene.add(fairySound);
const bananasound = new THREE.Audio(listener);
scene.add(bananasound);
// create a global audio source
const sound = new THREE.Audio(listener);
scene.add(sound);
// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load("sounds/lemmings.mp3", function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.1);
  sound.play(); //.play()
});

const mouse = {
  x: undefined,
  y: undefined,
};

function elf() {
  const elfScene = new THREE.Scene();
  elfScene.add(camera);
  elfScene.add(pointLight, backLight, ambientLight);
  renderer.render(elfScene, camera);
}

//TEXTURE
const textureLoader = new THREE.TextureLoader();

const normalTexture = textureLoader.load("textures/NormalMap.png");

const loader = new GLTFLoader();
let obj;
let modelObj = [];
loader.load(
  "assets/scene.gltf",
  function (gltf) {
    gltf.scene.userData = { name: "elf" };
    let elfobj;
    elfobj = gltf.scene;
    elfobj.scale.y = 200;
    elfobj.scale.x = 200;
    elfobj.scale.z = 200;

    scene.add(elfobj);
    modelObj.push(elfobj);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);
loader.load(
  "banana/scene.gltf",
  function (gltf) {
    gltf.scene.userData = { id: "banana" };
    obj = gltf.scene;
    obj.scale.y = 200;
    obj.scale.x = 200;
    obj.scale.z = 200;

    scene.add(obj);
    modelObj.push(obj);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);
loader.load(
  "shiba/scene.gltf",
  function (gltf) {
    gltf.scene.userData = { id: "dog" };
    let obj = gltf.scene;
    obj.scale.set(10, 10, 10);
    obj.position.x = 100;
    obj.position.z = 100;
    scene.add(obj);
    modelObj.push(obj);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

////////////////////////////////////////////////////

let frame = 0;
function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
  //elf();
  raycaster.setFromCamera(mouse, camera);
  frame += 0.01;

  if (obj) {
    obj.rotation.y += 0.01;
  }

  /////////////////////////
  snow.forEach((flake) => {
    flake.position.y -= 5; //1

    // make the snow start again at the top
    // once it reaches the bottom
    // using a conditional

    if (flake.position.y < -window.innerHeight / 2) {
      flake.position.y = window.innerHeight / 2;
      flake.material.opacity = 0; //fading/popping in from the top, but it doesn't look that different/great..
    }
    if (flake.material.opacity < 1) flake.material.opacity += 0.005; //animating the opacity to disapear at the bottom
  });

  const { array, originalPosition, randomValues } =
    planeMesh.geometry.attributes.position;
  for (let i = 0; i < array.length; i += 3) {
    // x
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01;

    // y
    array[i + 1] =
      originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.001;
  }

  planeMesh.geometry.attributes.position.needsUpdate = true;

  const intersects = raycaster.intersectObject(planeMesh);
  if (intersects.length > 0) {
    const { color } = intersects[0].object.geometry.attributes;

    // vertice 1
    color.setX(intersects[0].face.a, 0.1);
    color.setY(intersects[0].face.a, 0.5);
    color.setZ(intersects[0].face.a, 1);

    // vertice 2
    color.setX(intersects[0].face.b, 0.1);
    color.setY(intersects[0].face.b, 0.5);
    color.setZ(intersects[0].face.b, 1);

    // vertice 3
    color.setX(intersects[0].face.c, 0.1);
    color.setY(intersects[0].face.c, 0.5);
    color.setZ(intersects[0].face.c, 1);

    intersects[0].object.geometry.attributes.color.needsUpdate = true;

    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4,
    };

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1,
    };

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      duration: 1,
      onUpdate: () => {
        // vertice 1
        color.setX(intersects[0].face.a, hoverColor.r);
        color.setY(intersects[0].face.a, hoverColor.g);
        color.setZ(intersects[0].face.a, hoverColor.b);

        // vertice 2
        color.setX(intersects[0].face.b, hoverColor.r);
        color.setY(intersects[0].face.b, hoverColor.g);
        color.setZ(intersects[0].face.b, hoverColor.b);

        // vertice 3
        color.setX(intersects[0].face.c, hoverColor.r);
        color.setY(intersects[0].face.c, hoverColor.g);
        color.setZ(intersects[0].face.c, hoverColor.b);
        color.needsUpdate = true;
      },
    });
  }
}

////////////////////////////////////////////////////////
// FLAKES = TORUS RINGS FALLING
let flake; //this is being used each time, in for loop
const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({
  color: 0x2d8f4b,
  metalness: 0.7,
  normalMap: normalTexture,
  roughness: 0.2,
});

function rand(a, b) {
  return a + Math.random() * (b - a); //a rand() from ZIM, for varying snowfall
}

const snow = []; // declare an array

//loop 300x, each time meshing the flake and geometry
for (let i = 0; i < 300; i++) {
  flake = new THREE.Mesh(geometry, material);

  flake.position.set(
    rand(-world.plane.width / 2, world.plane.width / 2),
    rand(-world.plane.width / 2, world.plane.width / 2),
    rand(-90, 300)
  );


  snow.push(flake); //** push the mesh into the array [] snow

  scene.add(flake); //**add the flakes to the scene
}

animate();

//browser is crashing if audio played for all movement
function playHoverSound() {
  // create an AudioListener and add it to the camera
  const listener = new THREE.AudioListener();
  camera.add(listener);

  // create a global audio source
  const sound = new THREE.Audio(listener);
  scene.add(sound);
  // load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("sounds/lemmings.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setVolume(0.05);
    sound.play(); //.play()
  });
}

addEventListener("mousemove", (event) => {
  //playHoverSound();
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;

  modelCursor();
});

function modelCursor() {
  raycaster.setFromCamera(mouse, camera);
  const found = raycaster.intersectObjects(modelObj, true);
  if (found.length > 0) {
    document.body.style.cursor = "pointer";
  } else {
    document.body.style.cursor = "default";
  }
}

addEventListener("mouseup", (event) => {
  //playHoverSound();
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const found = raycaster.intersectObjects(modelObj, true);
  if (found.length > 0) {
    if (found[0]) {
      //get the model name

      let objectName = found[0].object.parent.name;
      console.log(objectName);
      if (objectName.includes("polySurface")) {
     
        audioLoader.load("sounds/dog_bark.mp3", function (buffer) {
          dogsound.setBuffer(buffer);
          dogsound.setLoop(false);
          dogsound.setVolume(1);
          dogsound.play();
        });
      } else if (objectName.includes("mushroom")) {
        audioLoader.load("sounds/fairy.mp3", function (buffer) {
          fairySound.setBuffer(buffer);
          fairySound.setLoop(false);
          fairySound.setVolume(1);
          fairySound.play();
        });
      } else if (objectName.includes("Banana")) {
        audioLoader.load("sounds/banana.mp3", function (buffer) {
          bananasound.setBuffer(buffer);
          bananasound.setLoop(false);
          bananasound.setVolume(1);
          bananasound.play();
        });
      }
    }
  }
});
