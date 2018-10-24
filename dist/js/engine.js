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
			this.zoom = 1;
		}

		setCameraProp(type, action, value) {
			this.camera[type][action](value);
			this.camera.updateProjectionMatrix();
			this.zoom = value;
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
		constructor(radius, wSegments, hSegments, material, mass, composition, speed, velocity, id) {
			this.planet;					// created planet

			this.planetData = {
				id: id,
				rendered: null,
				spawned: null,
			};

			this.geometry;					// planet geometry
			this.material;					// planet mesh

			/* planet properties */
			this.properties = {
				speed: speed,				// speed
				velocity: velocity,			// velocity
				mass: mass,					// mass
				radius: radius,
				material: material,			// initial radius
				composition: composition,	// planet composition
				wSegments: wSegments,		// width vertices
				hSegments: hSegments,		// height vertices
			}

			/* planet coordinates */
			this.planetCoordinates = {
				global: { 					// global coordinates
					x: 0,
					y: 0,
					z: 0.9,
				},
				pixel: { 					// screen pixel coordinates
					x: 0,
					y: 0,
					z: 0.9,
				},
				matrix: { 					// matrix coordinates
					x: 0,
					y: 0,
					z: 0.9,
				}
			}

			/* keyboard navigation */
			this.keyboardNavigation = {
				keys: {
					37: 'left', 			// left
					38: 'up',				// up
					39: 'right',			// right
					40: 'down', 			// down
				},
				pressedKeys: {
					37: null,				// left
					38: null,				// up
					39: null,				// right
					40: null,				// down
				}
			}

			/* matrix boundaries */
			this.screenBoundaries ={
				matrix: {},
			}
		}

		/* ----------------------------- init planet create (START) ----------------------------- */

		/* set initial radius and segments of the planet */
		setSize(radius = this.properties.radius, wSegment = this.properties.wSegments, hSegment = this.properties.hSegments,) {
			this.geometry = new THREE.SphereGeometry(radius, wSegment, hSegment);
		}

		/* set planets material */
		setMaterial(color = this.properties.material.color) {
			this.material = new THREE.MeshBasicMaterial({color: color});
		}

		/* create a planet */
		createPlanet() {
			this.planet = new THREE.Mesh(this.geometry, this.material);
			console.log(this.planet);
			this.planetData.spawned = true;
		}

		/* ----------------------------- init planet create (END) ----------------------------- */

		/* ----------------------------- manipulate planet properties (START) ----------------------------- */

		/* set position of the planet */
		setPosition(positionX = this.planetCoordinates.matrix.x, positionY = this.planetCoordinates.matrix.y) {
			this.planet.position.x = positionX;
			this.planet.position.y = positionY;
		}

		/* set planet properties */
		setProperties(type, value) {
			this.properties[type] = value;
		}

		setScale() {

		}

		/* adds speed to the planets and player */
		addSpeed() {
			/* arrow navigation */
			if (this.keyboardNavigation.pressedKeys[37]) {
				if (this.properties.speed.x > -0.1) {
					this.properties.speed.x -= 0.01;
				}
			}
			if (this.keyboardNavigation.pressedKeys[38]) {
				if (this.properties.speed.y < 0.1) {
					this.properties.speed.y += 0.01;
				}
			}
			if (this.keyboardNavigation.pressedKeys[39]) {
				if (this.properties.speed.x < 0.1) {
					this.properties.speed.x += 0.01;
				}
			}
			if (this.keyboardNavigation.pressedKeys[40]) {
				if (this.properties.speed.y > -0.1) {
					this.properties.speed.y -= 0.01;
				}
			}

			this.properties.speed.x += this.properties.velocity.x;
			this.properties.speed.y += this.properties.velocity.y;
		}

		spawnLocation() {
			this.planetCoordinates.global.x = Math.random() * (20 - (-20)) + (-20);
			this.planetCoordinates.global.y = Math.random() * (20 - (-20)) + (-20);
			console.log(this.planetCoordinates);
		}

		/* ----------------------------- manipulate planet properties (END) ----------------------------- */

		/* ----------------------------- planet render options (START) ----------------------------- */

		/* render a planet */
		render() {
			scene.add(this.planet);
			this.planetData.rendered = true;
		}

		/* check whether a planet has to be rendered */
		renderCheck() {
			const boundaries = planets.player.screenBoundaries.matrix;
				if (boundaries.x[0] < this.planetCoordinates.matrix.x && boundaries.x[1] > this.planetCoordinates.matrix.x && boundaries.y[0] < this.planetCoordinates.matrix.y && boundaries.y[1] > this.planetCoordinates.matrix.y) {
					if (this.planetData.rendered === null) {
						console.log('add...............................................');
						this.render();
					} else {
						return;
					}
				} else {
					if (this.planetData.rendered === true) {
						console.log('remove...............................................');
						this.renderRemove();
					}
				}
		}

		/* remove a planet */
		renderRemove() {
			scene.remove(this.planet);
			this.planetData.rendered = null;
		}

		/* ----------------------------- planet render options (END) ----------------------------- */

		/* ----------------------------- in animation loop functions (START) ----------------------------- */

		updatePlayer() {
			this.gravity();
			this.addSpeed();

			this.planetCoordinates.global.x += (this.properties.speed.x * world.getTime());
			this.planetCoordinates.global.y += (this.properties.speed.y * world.getTime());
		}

		updatePlanet() {
			this.gravity();
			this.addSpeed();

			this.planetCoordinates.global.x += (this.properties.speed.x * world.getTime());
			this.planetCoordinates.global.y += (this.properties.speed.y * world.getTime());

			this.planetCoordinates.matrix = this.globalCoordToMatrixCoord(this.planetCoordinates.global.x, this.planetCoordinates.global.y);

			this.setPosition();

			this.renderCheck();
		}

		/* ----------------------------- in animation loop functions (END) ----------------------------- */

		/* ----------------------------- player navigation controlls (START) ----------------------------- */

		navigationKeyboard() {
			const body =  document.querySelector('body');
			body.addEventListener('keydown', (e) => {
				if (e.keyCode === 37) {
					this.keyboardNavigation.pressedKeys[37] = true;
				}
				if (e.keyCode === 38) {
					this.keyboardNavigation.pressedKeys[38] = true;
				}
				if (e.keyCode === 39) {
					this.keyboardNavigation.pressedKeys[39] = true;
				}
				if (e.keyCode === 40) {
					this.keyboardNavigation.pressedKeys[40] = true;
				}
			});

			body.addEventListener('keyup', (e) => {
				if (e.keyCode === 37) {
					this.keyboardNavigation.pressedKeys[37] = null;
				}
				if (e.keyCode === 38) {
					this.keyboardNavigation.pressedKeys[38] = null;
				}
				if (e.keyCode === 39) {
					this.keyboardNavigation.pressedKeys[39] = null;
				}
				if (e.keyCode === 40) {
					this.keyboardNavigation.pressedKeys[40] = null;
				}
			});
		}

		/* ----------------------------- player navigation controlls (END) ----------------------------- */

		/* ----------------------------- calculating coordinates (START) ----------------------------- */

		pixelsToMatrix(positionX = this.planetCoordinates.pixel.x, positionY = this.planetCoordinates.pixel.y, positionZ = this.planetCoordinates.pixel.z) {
			const vector = new THREE.Vector3(positionX, positionY, positionZ);
			vector.x = ((vector.x) / (window.innerWidth / 2) - 1);
			vector.y = -((vector.y) / (window.innerHeight / 2) - 1);
			vector.unproject(camera.render());
			return vector;
		}

		matrixToPixels() {
			const vector = new THREE.Vector3(this.planetCoordinates.matrix.x, this.planetCoordinates.matrix.y, this.planetCoordinates.matrix.z);
		    vector.project(camera.render());
		    vector.x = (vector.x + 1) * window.innerWidth / 2;
		    vector.y = (-vector.y + 1) * window.innerHeight / 2;
		    return vector;
		}

		globalCoordToMatrixCoord(planetCoordX, planetCoordY) {
			const x = planetCoordX - planets.player.planetCoordinates.global.x;
			const y = planetCoordY - planets.player.planetCoordinates.global.y;
			return {x: x, y: y};
		}

		/* ----------------------------- calculating coordinates (END) ----------------------------- */

		/* ----------------------------- calculating screen and matrix dimensions (START) ----------------------------- */

		calculateRenderBoundaries() {
			const leftUpperMatrix = this.pixelsToMatrix(0, 0, 0.9);
			const positionCoordX = Math.abs(leftUpperMatrix.x);
			const positionCoordY = Math.abs(leftUpperMatrix.y);
			const xBoundries = [(this.planetCoordinates.matrix.x - positionCoordX) * (camera.zoom / 2), (this.planetCoordinates.matrix.x + positionCoordX) * (camera.zoom / 2)];
			const yBoundries = [(this.planetCoordinates.matrix.y - positionCoordY ) * (camera.zoom / 2), (this.planetCoordinates.matrix.y + positionCoordY) * (camera.zoom / 2)];
			this.screenBoundaries.matrix = {x: xBoundries, y: yBoundries};
			console.log(this.screenBoundaries.matrix);
		}

		/* ----------------------------- calculating screen and matrix dimensions (END) ----------------------------- */

		collision(plan) {
			const x = this.planetCoordinates.global.x - plan.planetCoordinates.global.x;
        	const y = this.planetCoordinates.global.y - plan.planetCoordinates.global.y;
        	const center = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        	//console.log(center);

		}

		gravity() {
			const int = setInterval(() => {
				let velX = 0;
				let velY = 0;
				let posX;
				let posY;
				for (let plan in planets) {
					//this.collision(planets[plan]);
					if (planets[plan] !== this && this.properties.velocity.x < 0.01 && this.properties.velocity.x > -0.01 && this.properties.velocity.y < 0.01 && this.properties.velocity.y > -0.01) {
						posX = (planets[plan].planetCoordinates.global.x - this.planetCoordinates.global.x) * planets[plan].properties.mass;
						posY = (planets[plan].planetCoordinates.global.y - this.planetCoordinates.global.y) * planets[plan].properties.mass;
						velX = velX + (posX * 0.0001);
						velY = velY + (posY * 0.0001);
					}
				}
				this.properties.velocity.x = velX;
				this.properties.velocity.y = velY;
				clearInterval(int);
			}, 0);



		}
	}

	const planetsArr = [];

	planetsArr.push(new Planets(0.5, 24, 24, {color: 0xFFE933}, 0.5, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'player'));		// radius, wSegments, hSegments, material, mass, composition, speed, velocity
	planetsArr.push(new Planets(0.2, 24, 24, {color: 0xFF3333}, 0.3, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'planet1'));
	planetsArr.push(new Planets(0.2, 24, 24, {color: 0xFF3333}, 0.3, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'planet2'));
	planetsArr.push(new Planets(0.2, 24, 24, {color: 0xFF3333}, 0.2, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'planet3'));
	planetsArr.push(new Planets(0.2, 24, 24, {color: 0xFF3333}, 0.2, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'planet4'));
	planetsArr.push(new Planets(0.2, 24, 24, {color: 0xFF3333}, 0.4, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'planet5'));
	planetsArr.push(new Planets(0.5, 24, 24, {color: 0xFF3333}, 0.5, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'planet6'));


	function insertPlanetsIntoObj(insert) {
		insert.forEach((planet) => {
			planets[planet.planetData.id] = planet;
		});
	}
	insertPlanetsIntoObj(planetsArr);

	class UI {
		constructor() {
			this.body = document.querySelector('body');
			this.coordinatesMarker;
		}

		createCoordinatesUI() {
			this.body.insertAdjacentHTML('afterbegin', `<div id="player-coordinates"><p>lat - ( ${planets.player.planetCoordinates.global.x} )</p><p>lng - ( ${planets.player.planetCoordinates.global.y} )</p></div>`);
		}

		update() {
			this.coordinatesMarker = document.querySelector('#player-coordinates');
			this.coordinatesMarker.children[0].textContent = `lat - ( ${planets.player.planetCoordinates.global.x} )`;
			this.coordinatesMarker.children[1].textContent = `lng - ( ${planets.player.planetCoordinates.global.y} )`;

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
			camera.setCameraProp('position', 'setZ', (20));
		}

		loadPlanet() {
			planets.player.setSize();
			planets.player.setMaterial();
			planets.player.createPlanet();
			planets.player.spawnLocation();
			planets.player.render();
			planets.player.calculateRenderBoundaries();
			planets.player.navigationKeyboard();

			for (let plan in planets) {
				if (plan !== 'player') {
					planets[plan].setSize();
					planets[plan].setMaterial();
					planets[plan].createPlanet();
					planets[plan].spawnLocation();
				}
			}
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