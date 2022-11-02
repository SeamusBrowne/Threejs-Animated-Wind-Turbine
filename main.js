      import * as THREE from '../build/three.module.js';

	import Stats from './jsm/libs/stats.module.js';

	import { OrbitControls } from './jsm/controls/OrbitControls.js';
	import { RoomEnvironment } from './jsm/environments/RoomEnvironment.js';
	import { RGBELoader } from './jsm/loaders/RGBELoader.js';

	import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
	import { DRACOLoader } from './jsm/loaders/DRACOLoader.js';

	let camera, scene, renderer;
	let stats;

	let controls;

	const rotor = [];

	function init() {

		const container = document.getElementById( 'container' );

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.setAnimationLoop( render );
		renderer.outputEncoding = THREE.sRGBEncoding;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 0.85;
		container.appendChild( renderer.domElement );

		window.addEventListener( 'resize', onWindowResize );

		stats = new Stats();
		container.appendChild( stats.dom );

		//

		camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 100 );
		camera.position.set( 10, 5, 16 );

		controls = new OrbitControls( camera, container );
		controls.target.set( 0, 10, 0 );
		controls.update();
		
		new RGBELoader()
		.setDataType( THREE.UnsignedByteType )
		.setPath( 'textures/equirectangular/' )
		.load( 'free_sky_dome_tl1_391.hdr', function ( texture ) {

			const envMap = pmremGenerator.fromEquirectangular( texture ).texture;

			scene.background = envMap;
			//scene.environment = envMap;

			texture.dispose();
			pmremGenerator.dispose();
       		} );

		
		const pmremGenerator = new THREE.PMREMGenerator( renderer );

		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xeeeeee );
		scene.environment = pmremGenerator.fromScene( new RoomEnvironment() ).texture;


		// materials

		const turbineMaterial = new THREE.MeshPhysicalMaterial( {
			color: 0xc8c8c8, metalness: 0.2, roughness: 0.4, clearcoat: 0.2, clearcoatRoughness: 0.4
		} );

		// Wind Turbine

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath( 'js/libs/draco/gltf/' );

		const loader = new GLTFLoader();
		loader.setDRACOLoader( dracoLoader );

		loader.load( 'models/windTurbine.glb', function ( gltf ) {

			const turbineModel = gltf.scene.children[ 0 ];

			turbineModel.getObjectByName( 'Turbine' ).material = turbineMaterial;
			turbineModel.getObjectByName( 'Rotor' ).material = turbineMaterial;

			rotor.push(
				turbineModel.getObjectByName( 'Rotor' )
			);
			
			scene.add( turbineModel );

		} );

	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	function render() {

		const time = - performance.now() / 1500;

		for ( let i = 0; i < rotor.length; i++ ) {

			rotor[i].rotation.z = time * Math.PI;

		}

		renderer.render( scene, camera );

		stats.update();

	}

	init();
