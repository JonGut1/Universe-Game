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

		remove(obj) {
			this.scene.remove(obj);
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

	class World {
		constructor(size) {
			this.world = size;
			this.dt = 1;
		}

		time(time) {
			this.dt = time;
		}

		getTime() {
			return this.dt;
		}
	}

	const world = new World({x: 5000, y: 5000});

	/* planets */
	class Planets {
		constructor(radius, wSegments, hSegments, col, size, mass, composition) {
			this.geometry = new THREE.SphereGeometry(radius, wSegments, hSegments);;
			this.material = new THREE.MeshBasicMaterial({color: col, wireframe: true});;
			this.planet;

			this.properties = {
				size: size,
				mass: mass,
				composition: {},
			}

			this.positionCoord = {
				x: 0,
				y: 0,
				z: 0.9,
			}

			this.positionPixels = {
				x: 0,
				y: 0,
				z: 0.9,
			}

			this.globalCoord = {
				x: 0,
				y: 0,
			}

			this.scale = 1;

			this.speed = {
				x: 0,
				y: 0,
			};

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

			this.pressedKeys = {
				37: null,
				38: null,
				39: null,
				40: null,
			}

			this.matrixBoundaries = {};

			this.boundaries = {};

			this.xSize = [];
			this.ySize = [];

			this.rendered = false;

			this.removed = false;

			this.pull = {
				37: null,
				38: null,
				39: null,
				40: null,
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

		setPosition() {
			this.planet.position.x = this.positionCoord.x;
			this.planet.position.y = this.positionCoord.y;
		}

		render() {
			console.log(scene);
			scene.add(this.planet);
		}

		renderCheck() {
			if (Math.abs(this.positionCoord.x) < 4 && Math.abs(this.positionCoord.y) < 4) {
				if (this.rendered === true) {
					return true;
				}
				this.render();
				this.rendered = true;
				return true;
			} else {
				console.log();
				this.rendered = false;
			}
		}

		setProperties(type, value) {
			this.properties[type] = value;
		}

		remove() {
			scene.remove(this.planet);
			this.removed = true;
		}

		addSpeedPlanets() {
			/* gravity pull */
			if (this.pull[37]) {
				if (this.speed.x > -0.01) {
					this.speed.x -= 0.0001;
				}
			}
			if (this.pull[38]) {
				if (this.speed.y < 0.01) {
					this.speed.y += 0.0001;
				}
			}
			if (this.pull[39]) {
				if (this.speed.x < 0.01) {
					this.speed.x += 0.0001;
				}
			}
			if (this.pull[40]) {
				if (this.speed.y > -0.01) {
					this.speed.y -= 0.0001;
				}
			}
		}

		addSpeed() {
			/* arrow navigation */
			if (this.pressedKeys[37]) {
				if (this.speed.x > -0.01) {
					this.speed.x -= 0.001;
				}
			}
			if (this.pressedKeys[38]) {
				if (this.speed.y < 0.01) {
					this.speed.y += 0.001;
				}
			}
			if (this.pressedKeys[39]) {
				if (this.speed.x < 0.01) {
					this.speed.x += 0.001;
				}
			}
			if (this.pressedKeys[40]) {
				if (this.speed.y > -0.01) {
					this.speed.y -= 0.001;
				}
			}

			/* gravity pull */
			if (this.pull[37]) {
				if (this.speed.x > -0.01) {
					this.speed.x -= 0.0001;
				}
			}
			if (this.pull[38]) {
				if (this.speed.y < 0.01) {
					this.speed.y += 0.0001;
				}
			}
			if (this.pull[39]) {
				if (this.speed.x < 0.01) {
					this.speed.x += 0.0001;
				}
			}
			if (this.pull[40]) {
				if (this.speed.y > -0.01) {
					this.speed.y -= 0.0001;
				}
			}
		}

		updatePlayer() {
			this.addSpeed();

			this.globalCoord.x += (this.speed.x * world.getTime());
			this.globalCoord.y += (this.speed.y * world.getTime());

			this.calculateBoundaries();

			//console.log(this.globalCoord);
			//console.log(this.pressedKeys);

			//this.planet.rotation.x += 0.001;
			this.planet.rotation.y += 0.001;
			this.planet.rotation.z += 0.001;
		}

		updatePlanet() {
			this.gravity();
			this.addSpeed();

			this.globalCoord.x += (this.speed.x * world.getTime());
			this.globalCoord.y += (this.speed.y * world.getTime());

			this.globalCoordToMatrixCoord(this.globalCoord.x, this.globalCoord.y);
			if (this.renderCheck() === true) {
				this.removed = false;
				this.setPosition();
			} else {
				if (this.removed === false) {
					this.remove();
				}
			}
		}

		navigationKeyboard() {
			const body =  document.querySelector('body');
			body.addEventListener('keydown', (e) => {
				if (e.keyCode === 37) {
					this.pressedKeys[37] = true;
				}
				if (e.keyCode === 38) {
					this.pressedKeys[38] = true;
				}
				if (e.keyCode === 39) {
					this.pressedKeys[39] = true;
				}
				if (e.keyCode === 40) {
					this.pressedKeys[40] = true;
				}
			});

			body.addEventListener('keyup', (e) => {
				if (e.keyCode === 37) {
					this.pressedKeys[37] = null;
				}
				if (e.keyCode === 38) {
					this.pressedKeys[38] = null;
				}
				if (e.keyCode === 39) {
					this.pressedKeys[39] = null;
				}
				if (e.keyCode === 40) {
					this.pressedKeys[40] = null;
				}
			});
		}

		pixelsToCoord(positionX = this.positionPixels.x, positionY = this.positionPixels.y, positionZ = this.positionPixels.z) {
			const vector = new THREE.Vector3(positionX, positionY, positionZ);
			vector.x = ((vector.x) / (window.innerWidth / 2) - 1);
			vector.y = -((vector.y) / (window.innerHeight / 2) - 1);

			vector.unproject(camera.render());
		}

		coordToPixels() {
			const vector = new THREE.Vector3(this.positionCoord.x, this.positionCoord.y, this.positionCoord.z);
			console.log(camera.render());

		    vector.project(camera.render());

		    vector.x = (vector.x + 1) * window.innerWidth / 2;
		    vector.y = (-vector.y + 1) * window.innerHeight / 2;

		    this.positionPixels = vector;
		}

		globalCoordToMatrixCoord(coordX, coordY) {
			const x = coordX - player.globalCoord.x;
			const y = coordY - player.globalCoord.y;
			this.positionCoord.x = x;
			this.positionCoord.y = y;
		}

		calculateBoundaries() {
			this.matrixBoundaries.x = [player.globalCoord.x - this.xSize[0], player.globalCoord.x + this.xSize[1]];
			this.matrixBoundaries.y = [player.globalCoord.y - this.ySize[0], player.globalCoord.y + this.ySize[1]];
			//console.log(this.matrixBoundaries);
		}

		checkMatrixSize() {
			this.pixelsToCoord(window.innerWidth, window.innerHeight, 0.9);
			this.xSize = [Math.abs(this.positionCoord.x), (Math.abs(this.positionCoord.x))];
			this.ySize = [Math.abs(this.positionCoord.y), (Math.abs(this.positionCoord.y))]
		}

		spawnLocation() {
			this.globalCoord.x = Math.random() * (5 - (-5)) + (-5);
			this.globalCoord.y = Math.random() * (5 - (-5)) + (-5);
			console.log(this.globalCoord);
		}

		collision() {

		}

		gravity() {
			console.log(this.globalCoord.x, player.globalCoord.x);
			if (this !== player && this.positionCoord.x < 7 && this.positionCoord.y < 7) {
				if (this.positionCoord.x > player.positionCoord.x) {
					this.pull[37] = true;
					this.pull[39] = null;

					player.pull[39] = true;
					player.pull[37] = null;
				}

				if (this.positionCoord.x < player.positionCoord.x) {
					this.pull[39] = true;
					this.pull[37] = null;

					player.pull[37] = true;
					player.pull[39] = null;
				}

				if (this.positionCoord.y > player.positionCoord.y) {
					this.pull[40] = true;
					this.pull[38] = null;

					player.pull[38] = true;
					player.pull[40] = null;
				}

				if (this.positionCoord.y < player.positionCoord.y) {
					this.pull[38] = true;
					this.pull[40] = null;

					player.pull[40] = true;
					player.pull[38] = null;
				}
			}
		}
	}

	const player = new Planets(0.4, 32, 32, 0xFFE933, 1, 10);
	const planet = new Planets(0.2, 32, 32, 0xFFFFFF, 1, 5);

	class UI {
		constructor() {
			this.body = document.querySelector('body');
			this.coordinatesMarker;
		}

		createCoordinatesUI() {
			this.body.insertAdjacentHTML('afterbegin', `<div id="player-coordinates"><p>lat - ( ${player.globalCoord.x} )</p><p>lng - ( ${player.globalCoord.y} )</p></div>`);
		}

		update() {
			this.coordinatesMarker = document.querySelector('#player-coordinates');
			this.coordinatesMarker.children[0].textContent = `lat - ( ${player.globalCoord.x} )`;
			this.coordinatesMarker.children[1].textContent = `lng - ( ${player.globalCoord.y} )`;

		}
	}

	const ui = new UI();

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
			camera.setCameraProp('position', 'setZ', (5));
		}

		loadPlanet() {
			player.createPlanet();
			player.spawnLocation();
			player.render();
			player.navigationKeyboard();
			player.coordToPixels();
			player.checkMatrixSize();

			planet.createPlanet();
			planet.spawnLocation();
		}

		loadUI() {
			ui.createCoordinatesUI();
		}
	}

	const loader = new Loader();

	class Animation {
		constructor() {
			this.last;
			this.dt;
			this.now;
		}

		play() {
			const now = Date.now();
			animate.dt = (now - animate.last) / 1000.0;
            world.getTime(now);
			requestAnimationFrame(animate.play);
			renderer.render(scene.render(), camera.render());

			player.updatePlayer();

			planet.updatePlanet();

			ui.update();

			animate.last = now;
		}

		stopPlay() {

		}
	}

	const animate = new Animation();

	loader.loadCanvas();
	loader.loadScene();
	loader.loadCamera();
	loader.loadPlanet();
	loader.loadUI();

	animate.play();


	console.log('Page loaded......');
}