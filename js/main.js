

/* ------------------------------

  GA Vivid

------------------------------*/

var container,
    renderer,
    uniforms,
    scene,
    camera,
    clock = new THREE.Clock,
    plane,
    sphere,
    light,
    shapeMesh,
    sphereMesh,
    scaleSphere,
    sphereClone,
    dotEffect,
    RGBEffect,
    controls,
    composer,
    height = window.innerHeight,
    particles = new THREE.Object3D(),
    amountParticles = 50,
    centerVector = new THREE.Vector3(0, 0, 0),
    floorMesh;

init();
animate();

function init() {

    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.y = 1000;
    camera.position.z = -100;

    scene = new THREE.Scene();
    createScene();
    createGroundParticles();
    scene.add(particles);

    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    var renderColor = new THREE.Color('#00FF7F')
    renderer.setClearColor(0x000000, 0);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    document.body.appendChild(renderer.domElement);
    compositingSetup();
    window.addEventListener('resize', onWindowResize);
}

function createScene() {
  var shapeMeshMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color('#00FF7F'),
    wireframeLinewidth: 3,
    wireframe: true,
    shininess: 0,
    shininess: 200,
    emissive: '#fff',
  });
  var icosahedronGeometry = new THREE.IcosahedronGeometry(300, 2);
	material = new THREE.MeshPhongMaterial({color: 0x03405f, wireframe: true, wireframeLinewidth: 2});

  // different style using a cube - could possibly be deleted
  // var cube = new THREE.CubeGeometry(200, 200, 200);

  // create a shape which we will use as a wireframe for asthetics
  // shapeMesh = new THREE.Mesh(cube, shapeMeshMaterial);
  shapeMesh = new THREE.Mesh(icosahedronGeometry, material);

  shapeMesh.position.set(50, 0, 0);
  scene.add(shapeMesh);

  // Create the sphere.
  var sphere = new THREE.SphereGeometry(100, 3, 3);
  var sphereMaterial = new THREE.MeshPhongMaterial({
      specular: '#FF1493',
      color: '#FF4500',
      emissive: '#00FF7F',
      shininess: 10
  });
  sphereMesh = new THREE.Mesh(sphere, sphereMaterial);
  for (var i = 0; i < 10; i ++) {
    sphereClone = sphereMesh.clone();
    sphereClone.rotation.x = (Math.random() * 360) * 2.0;
    sphereClone.position.x = (Math.random() * 501 - 200) * 2.0;
    sphereClone.position.y = (Math.random() * 501 - 200) * 2.0;
    sphereClone.position.z = (Math.random() * 501 - 200) * 2.0;
    scene.add(sphereClone);
  };

  // Set position to the sphere.
  sphereMesh.position.set(1, 200, 1);

  createWeirdSpline();

  // our lighting
  scene.add(new THREE.AmbientLight(0x222222));
  light = new THREE.DirectionalLight(0x777777);
  light.position.set(1, 1, 1);
  scene.add(light);
}


function compositingSetup() {
  composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));

  // dot effect
  dotEffect = new THREE.ShaderPass(THREE.DotScreenShader);
  dotEffect.uniforms['scale'].value = 0.01;
  // composer.addPass(dotEffect);

  // RGB effect
  RGBEffect = new THREE.ShaderPass(THREE.RGBShiftShader);
  RGBEffect.uniforms['amount'].value = 0.0035;
  composer.addPass(RGBEffect);

  // add glitch
  var glitch = new THREE.GlitchPass();
  glitch.renderToScreen = true;
  composer.addPass(glitch);

  // mirror effect
  uniforms = {
      diffuse: { type: "t", value: null },
      side: { type: "f", value: 1.0 }
  };
  var mirrorEffect = THREE.MirrorShader = {
      uniforms: uniforms,
      vertexShader: document.getElementById( 'vertexshader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentshader' ).textContent

  };
  var mirrorPass = new THREE.ShaderPass(THREE.MirrorShader);
  composer.addPass(mirrorEffect);
  composer.addPass(mirrorPass);
  mirrorPass.renderToScreen = true;
}


// this is where we create our weird shape
function createWeirdSpline() {
  var points = [];

  // some maths to position our points in a ring
  for (var i = 0; i < 2 * Math.PI; i += .001) {
    var x = Math.sin(i) * 300;
    var y = Math.sin(i * 4) * 60
    var z = Math.cos(i) * 300;
    points.push(new THREE.Vector3(x, y, z));
  };
  var spline = new THREE.CatmullRomCurve3(points);
  var circleRadius = 35;
  var circleShape = new THREE.Shape();
  circleShape.moveTo(0, circleRadius);
  circleShape.quadraticCurveTo(circleRadius, circleRadius, circleRadius, 0);
  circleShape.quadraticCurveTo(circleRadius, - circleRadius, 0, - circleRadius);
  circleShape.quadraticCurveTo(-circleRadius, - circleRadius, - circleRadius, 0);
  circleShape.quadraticCurveTo(-circleRadius, circleRadius, 0, circleRadius);
  var extrudeSettings = {
    amount: 12,
    bevelEnabled: false,
    steps: 60,
    extrudePath: spline
  };
  var circle_extrude = circleShape.extrude(extrudeSettings);

  // uniforms for our shader
  splineUniforms = {
    time: {
      type: "f",
      value: 1.0
    },
    resolution: {
      type: "v2",
      value: new THREE.Vector2()
    }
  };

  var material = new THREE.ShaderMaterial({
    uniforms: splineUniforms,
    vertexShader: document.getElementById('splinevertexShader').textContent,
    fragmentShader: document.getElementById('splinefragmentShader').textContent
  });

  splineUniforms.resolution.value.x = 150;
  splineUniforms.resolution.value.y = 150;
  splineHorizontal = new THREE.Mesh(circle_extrude, material);
  scene.add(splineHorizontal);
  splineVerticle = splineHorizontal.clone();
  splineVerticle.rotation.x = 90;
  splineVerticle.scale.x = splineHorizontal.scale.x * 2.0;
  splineVerticle.scale.y = splineHorizontal.scale.y * 2.0;
  splineVerticle.scale.z = splineHorizontal.scale.z * 2.0;
  scene.add(splineVerticle);
}

function createGroundParticles(){
  var worldWidth = 60, worldDepth = 20;
  data = generateHeight(worldWidth, worldDepth);

  var geometry = new THREE.PlaneBufferGeometry(2000, 1000, 100, 100);
  geometry.rotateX(- Math.PI / 2);

  var vertices = geometry.attributes.position.array;

  for (var i = 0, j = 0, l = vertices.length; i  < l; i ++, j += 3) {

    vertices[j + 1] = data[i] * 10;

  }

  var pink = new THREE.Color( "#1565C0" );
  var particleMaterial = new THREE.PointsMaterial({
    color: pink,
    size: 4
   });


  floorMesh = new THREE.Points(geometry, particleMaterial);
  console.log( floorMesh)
  // mesh.position.z = 900;
  floorMesh.position.set(50, 0, 0);
  // mesh.position.y = -1000;
  scene.add(floorMesh);
};

function onWindowResize(event){
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

function animate() {
  render();
  requestAnimationFrame(animate);

  // Box rotation around the sphere.
  // dotEffect.uniforms['scale'].value = getRandomInt(0.01, 10);
  RGBEffect.uniforms['amount'].value = getRandomInt(0.000035, 0.02);
  shapeMesh.rotateX(-0.01).rotateZ(-0.01).rotateY(-0.01);



  splineUniforms.time.value = clock.getElapsedTime();
  splineHorizontal.scale.y += Math.sin(clock.getElapsedTime() * Math.PI) / 100;
  splineHorizontal.scale.x += Math.sin(clock.getElapsedTime() * Math.PI) / 100;
  // splineHorizontal.scale.z += Math.sin(clock.getElapsedTime() * Math.PI) / 100;
  splineHorizontal.rotation.x += Math.sin(clock.getElapsedTime()) * 0.1;
  // splineHorizontal.rotation.y = Math.abs(Math.sin(clock.getElapsedTime() * (Math.random() * .5)));
  splineHorizontal.rotation.y += Math.sin(clock.getElapsedTime()) * 0.05;
  shapeMesh.rotateX(-0.01).rotateZ(-0.01).rotateY(-0.01);

  // splineVerticle.scale.y += Math.cos(clock.getElapsedTime() * Math.PI) / 100;
  // splineVerticle.scale.x += Math.cos(clock.getElapsedTime() * Math.PI) / 100;
  // splineVerticle.scale.z += Math.cos(clock.getElapsedTime() * Math.PI) / 100;
  splineVerticle.rotation.z += Math.cos(clock.getElapsedTime()) * 0.1;
  // splineVerticle.rotation.y = Math.abs(Math.cos(clock.getElapsedTime() * (Math.random() * .5)));
  // splineVerticle.rotation.y += Math.cos(clock.getElapsedTime()) * 0.05;

  // floor animation
  // for (var i = 6; i < amountParticles * amountParticles; i++) {
  //   var particle = particles.children[i];
  //   particle.position.y = (Math.sin((particle.position.x + clock.getElapsedTime()) / 4) * Math.cos((particle.position.z + clock.getElapsedTime()) / 4)) * 3 * (Math.sin(clock.getElapsedTime()));
  // }



  // for (var i = 1; i < scene.children.length - 1; i++) {
    // scene.children[i].rotateX(-0.01).rotateZ(-0.01).rotateY(-0.01);
  // }
  composer.render();
}

function render() {
  controls.update();
  // renderer.render( scene, camera );
}

function getRandomInt(min, max) {
  return Math.random() * (max - min) + min;
};
