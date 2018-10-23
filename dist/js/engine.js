function init() {

	const planets = {};

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

	class Resources {
		constructor() {
			this.elements = {

			}
		}
	}

	/* planets */
	class Planets {
		constructor(radius, wSegments, hSegments, col, size, mass, composition) {
			this.geometry = new THREE.SphereGeometry(radius, wSegments, hSegments);;
			this.material = new THREE.MeshBasicMaterial({color: col});;
			this.planets = [];

			this.properties = {
				size: size,
				mass: mass,
				radius: radius,
				composition: {},
				wSegments: wSegments,
				hSegments: hSegments,
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

			this.speed = {
				x: 0,
				y: 0,
			};

			this.velocity = {
				x: 0,
				y: 0,
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

			/* matrix boundaries */
			this.matrixBoundaries = {};

			/* matrix max size */
			this.xSize = [];
			this.ySize = [];

			/* is the planet rendered */
			this.rendered = false;

			/* is the planet removed */
			this.removed = false;

			/* whether gravity is activated to this object */
			this.pull = {
				37: null,
				38: null,
				39: null,
				40: null,
			}

			this.randomColorTets = [0xFFAC33, 0x33FF93, 0xFF3333, 0x3380FF, 0xFFFC33];
			this.cooldown = 0;

			this.insert = true;
		}

		/* set initial radius and segments of the planet */
		setSize(radius, wSegments, hSegments,) {
			this.geometry = new THREE.SphereGeometry(radius, wSegments, hSegments);
		}

		/* set planets material */
		setMaterial(color) {
			this.material = new THREE.MeshBasicMaterial({color: color});
		}

		/* create a planet */
		createPlanet() {
			this.planet = new THREE.Mesh(this.geometry, this.material);
		}

		/* set position of the planet */
		setPosition() {
			this.planet.position.x = this.positionCoord.x;
			this.planet.position.y = this.positionCoord.y;
		}

		/* set planet properties */
		setProperties(type, value) {
			this.properties[type] = value;
		}

		setScale(num, sign, plan) {
			console.log(num, sign, plan);
			if (plan.geometry.scale.x > num && sign === '-') {
				plan.geometry.scale.x -= 0.05;
				plan.geometry.scale.y -= 0.05;
				plan.geometry.scale.z -= 0.05;
			} else if (plan.geometry.scale.x < num && sign === '+') {
				plan.geometry.scale.x += 0.05;
				plan.geometry.scale.y += 0.05;
				plan.geometry.scale.z += 0.05;
			}
		}

		/* render a planet */
		render() {
			scene.add(this.planet);
		}

		/* check whether a planet has to be rendered */
		renderCheck() {
			const maxCoord = this.pixelsToCoord(window.innerWidth, 0, 1);
			if (Math.abs(this.positionCoord.x) < maxCoord.x * 2 && Math.abs(this.positionCoord.y) < maxCoord.y * 2) {
				if (this.rendered === true) {
					return true;
				}
				this.render();
				this.rendered = true;
				return true;
			} else {
				this.rendered = false;
			}
		}

		/* remove a planet */
		remove() {
			scene.remove(this.planet);
			this.removed = true;
		}

		/* adds velocity to the planets and player */
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

			this.speed.x += this.velocity.x;
			this.speed.y += this.velocity.y;
		}

		updatePlayer() {
			this.gravity();
			this.addSpeed();

			this.globalCoord.x += (this.speed.x * world.getTime());
			this.globalCoord.y += (this.speed.y * world.getTime());

			this.calculateBoundaries();
		}

		updatePlanet() {
			//console.log('Diferrence', this.globalCoord.x - planets.player.globalCoord.x);
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

			return vector;
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
			const x = coordX - planets.player.globalCoord.x;
			const y = coordY - planets.player.globalCoord.y;
			this.positionCoord.x = x;
			this.positionCoord.y = y;
		}

		calculateBoundaries() {
			this.matrixBoundaries.x = [planets.player.globalCoord.x - this.xSize[0], planets.player.globalCoord.x + this.xSize[1]];
			this.matrixBoundaries.y = [planets.player.globalCoord.y - this.ySize[0], planets.player.globalCoord.y + this.ySize[1]];
			//console.log(this.matrixBoundaries);
		}

		checkMatrixSize() {
			this.xSize = [Math.abs(this.positionCoord.x), (Math.abs(this.positionCoord.x))];
			this.ySize = [Math.abs(this.positionCoord.y), (Math.abs(this.positionCoord.y))]
		}

		spawnLocation() {
			this.globalCoord.x = Math.random() * (30 - (-30)) + (-30);
			this.globalCoord.y = Math.random() * (30 - (-30)) + (-30);
			console.log(this.globalCoord);
		}

		collision(center, plan) {
			if (center < plan.properties.radius + this.properties.radius) {
				if (this.properties.mass > plan.properties.mass) {
					this.setScale(plan.properties.mass, '+', this);
				} else if (this.properties.mass > plan.properties.mass) {
					this.setScale(plan.properties.mass, '+', plan);
				} else if (this.properties.mass === plan.properties.mass) {
					const rand = [plan, this];
					this.setScale(rand[Math.floor(Math.random() * 1)].properties.mass, '+', rand[Math.floor(Math.random() * 1)]);
				}
				if (this.planet.scale.x <= 0) {
					this.remove();
					delete planets[this];
				}
			}
		}

		shatterPlanet(num) {
			if (planets.length < num) {
				for (let i = 0; i < 10; i++) {
					planets.push(new Planets(0.2, 6, 6, 0xFF3333, 1, 5));
				}
			}


			console.log(planets);
		}

		gravity() {
			for (let plan in planets) {
				//const x = this.positionCoord.x - planets[plan].positionCoord.x;
	        	//const y = this.positionCoord.y - planets[plan].positionCoord.y;
	        	//const center = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	        	console.log(this.globalCoord.x, this.globalCoord.y);
				if (planets[plan] !== this && this.velocity.x < 0.001 && this.velocity.x > -0.001 && this.velocity.y < 0.001 && this.velocity.y > -0.001) {
					const velX = (planets[plan].positionCoord.x - (this.positionCoord.x));
					const velY = (planets[plan].positionCoord.y - (this.positionCoord.y));
					if (velX > -10 && velX < 10 && velY > -10 && velY < 10) {
						this.velocity.x = velX * 0.00001;
						this.velocity.y = velY * 0.00001;
					}
				}
			}
		}
	}

	planets.player = new Planets(0.5, 24, 24, 0xFFE933, 1, 10);
	planets.planet1 = (new Planets(0.3, 24, 24, 0xFF3333, 1, 5));
	//planets.planet2 = (new Planets(0.2, 24, 24, 0xFF3333, 1, 5));


	class UI {
		constructor() {
			this.body = document.querySelector('body');
			this.coordinatesMarker;
		}

		createCoordinatesUI() {
			this.body.insertAdjacentHTML('afterbegin', `<div id="player-coordinates"><p>lat - ( ${planets.player.globalCoord.x} )</p><p>lng - ( ${planets.player.globalCoord.y} )</p></div>`);
		}

		update() {
			this.coordinatesMarker = document.querySelector('#player-coordinates');
			this.coordinatesMarker.children[0].textContent = `lat - ( ${planets.player.globalCoord.x} )`;
			this.coordinatesMarker.children[1].textContent = `lng - ( ${planets.player.globalCoord.y} )`;

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
			camera.setCameraProp('position', 'setZ', (15));
		}

		loadPlanet() {
			planets.player.createPlanet();
			planets.player.spawnLocation();
			planets.player.render();
			planets.player.navigationKeyboard();
			planets.player.coordToPixels();
			planets.player.checkMatrixSize();

			for (let plan in planets) {
				planets[plan].createPlanet();
				planets[plan].spawnLocation();
			}




			//planet2.createPlanet();
			//planet2.spawnLocation();
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

			planets.player.updatePlayer();

			for (let plan in planets) {
				if (plan !== 'player') {
					planets[plan].updatePlanet();
				}
			}

			//planet2.updatePlanet();

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