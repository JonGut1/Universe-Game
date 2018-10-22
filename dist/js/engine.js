function init() {

	/* renders canvas */
	class Renderer {
		constructor() {
			this.ctx = document.querySelector('#main-canvas');
			this.renderer;
		}

		createWebGl() {
			this.renderer = new THREE.WebGLRenderer({canvas: this.ctx, antialias: true });
		}

		setCanvasSize(width, height) {
			if (width && height) {
				this.ctx.width = width;
				this.ctx.height = height;
			} else {
				this.ctx.width = window.innerWidth;
				this.ctx.height = window.innerHeight;
			}

		}

		render(scene, camera) {
			this.renderer.render(scene, camera);
		}

		update() {

		}
	}

	const renderer = new Renderer();

	/* creates a scene */
	class Scene {
		constructor() {
			this.scene;
		}

		createScene() {
			this.scene = new THREE.Scene();
		}

		setSceneBackground(color) {
			if (color) {
				this.scene.background = new THREE.Color(color);
			}
		}

		add(obj) {
			this.scene.add(obj);
			console.log(obj);
		}

		render() {
			return scene.scene;
		}

		update() {

		}

	}

	const scene = new Scene();

	/* creates a camera */
	class Camera {
		constructor(fov, ratio, near, far) {
			this.camera = new THREE.PerspectiveCamera(fov, ratio, near, far);
		}

		setCameraProp(type, action, value) {
			this.camera[type][action](value);
		}

		render() {
			return this.camera;
		}

		update() {

		}
	}

	const camera = new Camera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	/* planets */
	class Planets {
		constructor(radius, wSegments, hSegments, col) {
			this.geometry = new THREE.SphereGeometry(radius, wSegments, hSegments);;
			this.material = new THREE.MeshBasicMaterial({color: col, wireframe: true});;
			this.planet;

			this.positionCoord = {
				x: 1.4,
				y: -1,
				z: 0.9,
			}

			this.positionPixels = {
				x: 900,
				y: 400,
				z: 0.9,
			}

			this.scale = 1;
			this.speed = 0;
			this.directions = {
				x: 0,
				y: 0,
				z: 0,
			}
			this.rotation = {
				x: 0,
				y: 0,
				z: 0,
			}

			this.keys = {
				37: 'left',
				38: 'up',
				39: 'right',
				40: 'down',
			}
		}

		setSize(planet) {
			this.geometry = new THREE.SphereGeometry(planet.radius, planet.wSegments, planet.hSegments);
		}

		setMaterial(color) {
			this.material = new THREE.MeshBasicMaterial({color: color});
		}

		createPlanet() {
			this.planet = new THREE.Mesh(this.geometry, this.material);
		}

		render() {
			scene.add(this.planet);
		}

		update() {
			this.planet.position.x = this.positionCoord.x;
			this.planet.position.y = this.positionCoord.y;

			this.planet.rotation.x += 0.001;
			this.planet.rotation.y += 0.001;
			this.planet.rotation.z += 0.001;
		}

		navigationKeyboard() {
			console.log('Loaded nav');
			const body =  document.querySelector('body');
			body.addEventListener('keydown', (e) => {
				console.log(e.keyCode);
			});
		}

		pixelsToCoord() {
			const vector = new THREE.Vector3(this.positionPixels.x, this.positionPixels.y, this.positionPixels.z);
			vector.x = ((vector.x) / (window.innerWidth / 2) - 1);
			vector.y = -((vector.y) / (window.innerHeight / 2) - 1);

			vector.unproject(camera.render());

			this.positionCoord = vector;
			console.log(vector);
		}

		coordToPixels() {
			const vector = new THREE.Vector3(this.positionCoord.x, this.positionCoord.y, this.positionCoord.z);
			console.log(camera.render());

		    vector.project(camera.render());

		    vector.x = (vector.x + 1) * window.innerWidth / 2;
		    vector.y = (-vector.y + 1) * window.innerHeight / 2;

		    this.positionPixels = vector;
		    console.log(vector);
		}
	}

	const player = new Planets(0.4, 32, 32, 0xFFE933);
	//player.coordToPixels();
	player.pixelsToCoord();

	/* loader */
	class Loader {
		constructor() {

		}

		loadCanvas() {
			renderer.setCanvasSize(window.innerWidth, window.innerHeight);
			renderer.createWebGl();
		}

		loadScene() {
			scene.createScene();
			scene.setSceneBackground(0x000000);
		}

		loadCamera() {
			camera.setCameraProp('position', 'setZ', (2));
		}

		loadPlanet() {
			player.createPlanet();
			player.render();
			player.navigationKeyboard();
		}
	}

	const loader = new Loader();

	class Animation {
		constructor() {

		}

		play() {
			requestAnimationFrame(animate.play);
			renderer.render(scene.render(), camera.render());
			player.update();
		}

		stopPlay() {

		}
	}

	const animate = new Animation();

	loader.loadCanvas();
	loader.loadScene();
	loader.loadCamera();
	loader.loadPlanet();

	animate.play();


	console.log('Page loaded......');
}