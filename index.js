var uniforms,
    attributes,
    shaderMaterial,
    sphere,
    verts,
    values,
    scene,
    camera,
    clock,
    renderer,
    geometry,
    material,
    cube,
    light,
    composer,
    effect,
    circle,
    circle2,
    cubes = [],
    cubeHolder = [],
    stars = [],
    mesh,
    data,
    sphere, plane1, plane2, plane3, plane4;

var verticalMirror;

var spherePosition = -180;
var spherePresent = false;

var wallPosition = 2450;

// Sound variables;
var analyser, source, bufferLength, dataArray, soundBuffer, frequencyData, bufferSource, sourceJs, buffer;
var url = 'http://madeonwmas.s3-eu-west-1.amazonaws.com/assets/audio/bass.1.1.mp3';
var array = new Array();

var boost = 0;
var request;

var vertexHeight = 1;
var Definition = 20;
var Size = 50;

var context;

window.onload = function(){
  context = new (window.AudioContext || window.webkitAudioContext)();

    // setup
  var WIDTH = window.innerWidth, HEIGHT = window.innerHeight;
  renderer = new THREE.WebGLRenderer();
  clock = new THREE.Clock;
  camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
  camera.position.z = 300;

  scene = new THREE.Scene();
  // data = generateHeight( 1024, 1024 );
  scene.add(camera);

  // create a skybox
  var skyGeometry = new THREE.SphereGeometry(2000, 25, 25);

  // this is deprecated
  // use this instead
  var texture =  new THREE.TextureLoader().load( "sky-dome.png" );

  // shading isn't an option for this material
  // link to list of attributes
  //http://threejs.org/docs/#Reference/Materials/MeshLambertMaterial
  var skyMaterial = new THREE.MeshLambertMaterial({
      map: texture
      // shading: THREE.SmoothShading
  });

  var sky = new THREE.Mesh(skyGeometry, skyMaterial);
  sky.material.side = THREE.BackSide;
  // scene.add(sky);

  renderer.setSize(WIDTH, HEIGHT);

  light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);

  scene.add(light);

  var $container = $('#container');
  $container.append(renderer.domElement);

  // createPlane()
  buildWalls()
  makeStars()

    // createSphere();


  // loop render
  var frame = 0;
  var amplitude = 0;

  function update() {
    // amplitude = (Math.sin(clock.getElapsedTime())) * 2; //(1 + Math.sin(frame) / Math.PI) / 2;
    amplitude = 2

    if(clock.getElapsedTime() > 1){
      makeWallsAppear();
    }

    if(clock.getElapsedTime() >= 7){
      // addSphere()
    }

    if(clock.getElapsedTime() >= 3){
      rotateCamera();
    }

    if(clock.getElapsedTime() > 4){
      goForward();
    }

    if(clock.getElapsedTime() >= 26){
      stopCameraRotation();
    }

    //camera movement
    // camera.position.z -= 0.1
    // camera.rotation.x += 0.001
    // camera.rotation.y += 0.001
    // camera.rotation.z += 0.005

    // loop through each star
		for(var i=0; i<stars.length; i++) {

			star = stars[i];

			// and move it forward dependent on the mouseY position.
			star.position.z +=  i/10;

			// if the particle is too close move it to the back
			if(star.position.z>1000) star.position.z-=2000;

		}

    renderer.render(scene, camera);

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

var addSphere = function(){

  //create sphere
  if(!spherePresent){
    var texture = new THREE.TextureLoader().load( "images/bluey-purple.jpg" );
    var geometry = new THREE.SphereGeometry( Size, Definition, Definition );
    material = new THREE.MeshBasicMaterial({
          wireframe: true,
          wireframeLinewidth: 1.5,
          map: texture
        });
    sphere = new THREE.Mesh( geometry, material);

    sphere.position.y = spherePosition;

    scene.add( sphere );
    spherePresent = true;
  }
  updateSphere()
}

var updateSphere = function(){
  if(sphere.position.y >= 0){
    sphere.position.y = 0
  } else {
    sphere.position.y += 2
  }
  sphere.rotation.x += 0.01
  sphere.rotation.y += 0.01
  sphere.rotation.z += 0.01
}

var rotateCamera = function(){
  camera.rotation.z += 0.005
}

var goForward = function(){
  camera.position.z -= 15
}

var stopCameraRotation = function(){
  camera.rotation.z = 0;
}


function updateVerts() {
 for (var i = 0; i < sphere.geometry.vertices.length; i++)
 {
   sphere.geometry.vertices[i].z -= Math.random()*vertexHeight -(vertexHeight/2);
   sphere.geometry.vertices[i].x -= Math.random()*vertexHeight -(vertexHeight/2);
   sphere.geometry.vertices[i].y -= Math.random()*vertexHeight -(vertexHeight/2);

 }
 // sphere.colors.push(new THREE.Color(Math.random(), Math.random(), Math.random()));

 sphere.geometry.verticesNeedUpdate = true;
};


// function generateHeight( width, height ) {
//   var data = new Uint8Array( width * height ), perlin = new ImprovedNoise(),
//   size = width * height, quality = 2, z = Math.random() * 100;
//   for ( var j = 0; j < 4; j ++ ) {
//     quality *= 4;
//     for ( var i = 0; i < size; i ++ ) {
//       var x = i % width, y = ~~ ( i / width );
//       data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * 0.5 ) * quality + 10;
//     }
//   }
//   return data;
// }


// var createPlane = function(){
//   var quality = 16, step = 1024 / quality;
//   var material = new THREE.MeshPhongMaterial( {color: "#2194ce", side: THREE.DoubleSide, shading: THREE.FlatShading} );
//   var geometry = new THREE.PlaneGeometry( 2000, 2000, quality - 1, quality - 1  );
//
//   var plane = new THREE.Mesh( geometry, material );
//
//   plane.rotation.x = 150;
//   plane.position.y = -110;
//
//   var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1.5 );
//   scene.add( light );
//
//   for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
//     var x = i % quality, y = Math.floor( i / quality );
//     geometry.vertices[ i ].y = data[ ( x * step ) + ( y * step ) * 1024 ] * 2 - 128;
//   }
//
//   scene.add( plane );
// }

var buildWalls = function(){

    // top and bottom
    var textureTB = new THREE.TextureLoader().load( "images/greeny-particles-TB.jpg" );
    textureTB.wrapS = THREE.MirroredRepeatWrapping;
    textureTB.wrapT = THREE.MirroredRepeatWrapping;
    textureTB.repeat.set( 1, 2 );

    // left and right
    var textureLR = new THREE.TextureLoader().load( "images/greeny-particles.jpg" );
    textureLR.wrapS = THREE.RepeatWrapping;
    textureLR.wrapT = THREE.RepeatWrapping;

    textureLR.repeat.set( 2, 1 );

    //top wall
     plane1 = new THREE.Mesh( new THREE.PlaneGeometry( 500, 3000, 10, 15 ), new THREE.MeshBasicMaterial({
          color: 0xcccccc,
          wireframe: true,
          wireframeLinewidth: 2.0,
          map: textureTB
      }));
     plane1.rotation.x = Math.PI/2;
     plane1.position.y = wallPosition;
     plane1.position.z = 50-1500;
     scene.add( plane1 );

     //left wall
     plane2 = new THREE.Mesh( new THREE.PlaneGeometry( 3000, 500, 15, 5 ), new THREE.MeshBasicMaterial({
          color: 0xcccccc,
          wireframe: true,
          wireframeLinewidth: 2.0,
          map: textureLR
      }));
     plane2.rotation.y = Math.PI/2;
     plane2.position.x = -wallPosition;
     plane2.position.z = 50-1500;
     scene.add( plane2 );

     //right wall
     plane3 = new THREE.Mesh( new THREE.PlaneGeometry( 3000, 500, 15, 5 ), new THREE.MeshBasicMaterial({
          color: 0xcccccc,
          wireframe: true,
          wireframeLinewidth: 2.0,
          map: textureLR
       }));
     plane3.rotation.y = -Math.PI/2;
     plane3.position.x = wallPosition;
     plane3.position.z = 50-1500;
    scene.add( plane3 );

    //bottom wall
     plane4 = new THREE.Mesh( new THREE.PlaneGeometry( 500, 3000, 5, 15 ), new THREE.MeshBasicMaterial({
          color: 0xcccccc,
          wireframe: true,
          wireframeLinewidth: 2.0,
          map: textureTB
       }));
     plane4.rotation.x = -Math.PI/2;
     plane4.position.y = -wallPosition;
     plane4.position.z = 50-1500;
     scene.add( plane4 );


    //  var directionalLight = new THREE.DirectionalLight( 0xffffff, 30.5 );
    //  directionalLight.position.set( 0, 0, -400 );
    // //  directionalLight.rotation.x = 90
    //  scene.add( directionalLight );
    //
    //  directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 50);
    //  camera.add( directionalLightHelper);
    //  scene.add( directionalLightHelper );
}

var makeWallsAppear = function(){
  if(wallPosition <= 250){
    wallPosition = 250;
  } else {
    wallPosition -= 15
  }
  plane1.position.y = wallPosition
  plane2.position.x = -wallPosition
  plane3.position.x = wallPosition
  plane4.position.y = -wallPosition

}

var makeStars = function() {
  for ( var z= -4500; z < 4500; z+=20 ) {

		// Make a sphere (exactly the same as before).
		var geometry   = new THREE.SphereGeometry(0.8, 10, 10)
    var texture =  new THREE.TextureLoader().load( "sky-dome.png" );
		var material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: texture
    });
		var sphere = new THREE.Mesh(geometry, material)

		// This time we give the sphere random x and y positions between -500 and 500
		sphere.position.x = Math.random() * 1000 - 500;
		sphere.position.y = Math.random() * 1000 - 500;

		// Then set the z position to where it is in the loop (distance of camera)
		sphere.position.z = z;

		// scale it up a bit
		sphere.scale.x = sphere.scale.y = 2;

		//add the sphere to the scene
		scene.add( sphere );

		//finally push it to the stars array
		stars.push(sphere);
	}
}


var playSong = function(){
		request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = 'arraybuffer';

	    request.onload = function(){
	    	context.decodeAudioData(
	    		request.response,
	    		function(buffer){
	    			if(!buffer){
	    				console.log('Error decoding file data');
						  return;
	    			}

	    			//sourceJs = context.createJavaScriptNode(2048);
	    			//createJavaScriptNode has been renamed to createScriptProcessor.
	    			sourceJs = context.createScriptProcessor(2048)
	    			sourceJs.buffer = buffer;
	    			sourceJs.connect(context.destination);

	    			//Creates the analyser
	    			analyser = context.createAnalyser();
	    			analyser.smoothingTimeConstant = 0.5;

	    			analyser.fftSize = 512;

	    			source = context.createBufferSource();

	    			source.buffer = buffer;
	    			//Looping the sound??
	    			source.loop = true;

	    			//connects the source with the analyser;
	    			source.connect(analyser);
	    			//connects the analyser with the sound node??
	    			analyser.connect(sourceJs);
	    			source.connect(context.destination);
	    			//When the sound is playing, do that:

	    			sourceJs.onaudioprocess = function(e){
	    				// sizeValue = parseInt($('#sizeInput').val());
	    				//array is the data we need to use to update each 3D shape.
              console.log(array)
	    				array = new Uint8Array(analyser.frequencyBinCount);
	    				//Puts the sound data in the analyser?
	    				analyser.getByteFrequencyData(array);
	    				//makes the sound move another way
	    				//analyser.getByteTimeDomainData(array);
	    				boost = 0;

	    				for(var i = 0; i < array.length; i++){
	    					boost += array[i];

	    				}
	    			};
		   			play();
	    		}
	    	)
	    };

    request.send();

	 function play() {
	 	source.start(0)
	}
};
