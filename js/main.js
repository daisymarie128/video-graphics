

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
    box,
    sphereMesh,
    scaleSphere,
    sphereClone,
    dotEffect,
    RGBEffect,
    controls,
    composer;

init();
animate();

function init() {

    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.y = 1000;
    camera.position.z = -200;

    scene = new THREE.Scene();
    createScene();

    renderer = new THREE.WebGLRenderer({alpha: true});
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
  var cube = new THREE.CubeGeometry(200, 200, 200);
  var boxMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color('#00FF7F'),
    wireframeLinewidth: 3,
    wireframe: true,
    shininess: 0,
    shininess: 200,
    emissive: '#fff',
  });
  var geometry = new THREE.IcosahedronGeometry(300,2);
	material = new THREE.MeshPhongMaterial( { color: 0x03405f, wireframe: true, wireframeLinewidth: 2 } );
  // Create box around the sphere.
  box = new THREE.Mesh( geometry, material );
  // box = new THREE.Mesh(cube, boxMaterial);
  box.position.set(50, 0, 0);
  scene.add(box);

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
    scene.add( sphereClone );
  }

  // Set position to the sphere.
  sphereMesh.position.set(1, 200, 1);
  // scene.add(sphereMesh);

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
  composer.addPass(glitch);

  // mirror effect
  uniforms = {
      diffuse: { type: "t", value: null },
      side: { type: "i", value: 1 }
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
  var circleRadius = 55;
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

function onWindowResize( event ) {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function animate() {
  render();
  requestAnimationFrame(animate);

  // Box rotation around the sphere.
  dotEffect.uniforms['scale'].value = getRandomInt(0.01, 10);
  RGBEffect.uniforms['amount'].value = getRandomInt(0.000035, 0.02);
  box.rotateX(-0.01).rotateZ(-0.01).rotateY(-0.01);



  splineUniforms.time.value = clock.getElapsedTime();
  splineHorizontal.scale.y += Math.sin(clock.getElapsedTime() * Math.PI) / 100;
  splineHorizontal.scale.x += Math.sin(clock.getElapsedTime() * Math.PI) / 100;
  // splineHorizontal.scale.z += Math.sin(clock.getElapsedTime() * Math.PI) / 100;
  splineHorizontal.rotation.x += Math.sin(clock.getElapsedTime()) * 0.1;
  // splineHorizontal.rotation.y = Math.abs(Math.sin(clock.getElapsedTime() * (Math.random() * .5)));
  splineHorizontal.rotation.y += Math.sin(clock.getElapsedTime()) * 0.05;
  box.rotateX(-0.01).rotateZ(-0.01).rotateY(-0.01);

  // splineVerticle.scale.y += Math.cos(clock.getElapsedTime() * Math.PI) / 100;
  // splineVerticle.scale.x += Math.cos(clock.getElapsedTime() * Math.PI) / 100;
  // splineVerticle.scale.z += Math.cos(clock.getElapsedTime() * Math.PI) / 100;
  splineVerticle.rotation.z += Math.cos(clock.getElapsedTime()) * 0.1;
  // splineVerticle.rotation.y = Math.abs(Math.cos(clock.getElapsedTime() * (Math.random() * .5)));
  // splineVerticle.rotation.y += Math.cos(clock.getElapsedTime()) * 0.05;


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
