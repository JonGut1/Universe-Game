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
			this.renderer.shadowMap.enabled = true;
			this.renderer.shadowMap.type = THREE.BasicShadowMap;
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
			this.planets = {};
			this.centerCoordinates = {
				global: {
					x: 0,
					y: 0,
				}
			};
			this.screenBoundaries = {};
		}

		time(time) {
			this.dt = time;
		}

		getTime() {
			return this.dt;
		}

		addPlanetsCoordinates(obj) {
			this.planets[obj.planetData.id] = obj;
		}

		addMatrixCenterCoord(coord) {
			if (coord) {
				this.centerCoordinates.global = coord;
				this.globalCoordToMatrixCoord(coord.x, coord.y);
			}
		}

		/* ----------------------------- gravity (START) ----------------------------- */

		/* fabric of space-time */
		gravity(obj) {
			const int = setInterval(() => {
				let vel = {x: 0, y: 0};
				for (let plan in this.planets) {

					if (this.planets[plan].planetData.id !== obj.planetData.id) {
						const center = this.distanceBetweenObjects(obj.planetCoordinates.global, this.planets[plan].planetCoordinates.global, 'global');
		    			if (center <  obj.properties.mass * 70) {
		    				vel = this.calculateVelocity(obj, this.planets[plan], vel);
		    			}
		    		}
				}
				if (vel.x !== 0 || vel.y !== 0) {
					obj.setVelocity(vel);
				} else {
					obj.setVelocity(obj.properties.velocity);
				}
				clearInterval(int);
			}, 0);
		}

		/* ----------------------------- gravity (END) ----------------------------- */

		/* ----------------------------- velocity (START) ----------------------------- */

		calculateVelocity(objLocal, objExt, vel) {
			if (vel.x < 0.01 && vel.x > -0.01 && vel.y < 0.01 && vel.y > -0.01) {
				const posX = (objExt.planetCoordinates.global.x - objLocal.planetCoordinates.global.x) * objExt.properties.mass;
				const posY = (objExt.planetCoordinates.global.y - objLocal.planetCoordinates.global.y) * objExt.properties.mass;
				const velX = vel.x + (posX * 0.0001);
				const velY = vel.y + (posY * 0.0001);
				return {x: velX, y: velY};
			}
		}

		/* ----------------------------- velocity (END) ----------------------------- */

		/* ----------------------------- collisions (START) ----------------------------- */

		collision(obj) {
			const int = setInterval(() => {
				for (let plan in this.planets) {
					if (obj.planetData.id !== this.planets[plan].planetData.id) {
						const matrixCoord = this.distanceBetweenObjects(obj.planetCoordinates.global, this.planets[plan].planetCoordinates.global, 'matrix');
						if (matrixCoord <= (obj.properties.radius + this.planets[plan].properties.radius)) {
							console.log('hit............................');
							this.calculateOutcome(obj, this.planets[plan]);
						}
					}
				}
				clearInterval(int);
			}, 0);

		}

		calculateOutcome(obj1, obj2) {
			let velocityX = obj1.properties.velocity.x - obj2.properties.velocity.x;
			let velocityY = obj1.properties.velocity.y - obj2.properties.velocity.y;
			let mass = obj1.properties.mass + obj2.properties.mass;
			if (obj1.planetData.type !== 'player') {
				if (obj1.properties.mass > obj2.properties.mass) {
					obj1.setScale(obj2.properties.mass, 'increase');
				} else if (obj1.properties.mass < obj2.properties.mass) {
					velocityX = 0;
					velocityY = 0;
					mass = 0;
					obj1.setScale(obj1.properties.mass, 'decrease');
				} else if (obj1.properties.mass === obj2.properties.mass) {
					console.log('draw...........');
				}
			} else {
				if (obj1.properties.mass >= obj2.properties.mass) {
					obj1.setScale(obj2.properties.mass, 'increase');
				} else if (obj1.properties.mass < obj2.properties.mass) {
					obj1.setScale(obj2.properties.mass, 'decrease');
					velocityX = 0;
					velocityY = 0;
					mass = 0;
					console.log('game over.....................................');
				}
			}
				obj1.setVelocity({x: velocityX, y: velocityY});
				obj1.setMass(mass);
				console.log(this.planets);
		}

		/* ----------------------------- collisions (END) ----------------------------- */

		/* ----------------------------- remove planet for good (START) ----------------------------- */

		deletePlanet(obj) {
			delete this.planets[obj.planetData.id];
		}

		/* ----------------------------- remove planet for good (END) ----------------------------- */

		/* ----------------------------- calculating screen and matrix dimensions (START) ----------------------------- */

		calculateRenderBoundaries() {
			const leftUpperMatrix = this.pixelsToMatrix(0, 0, 0.9);
			const positionCoordX = Math.abs(leftUpperMatrix.x);
			const positionCoordY = Math.abs(leftUpperMatrix.y);
			const xBoundries = [(0 - positionCoordX) * (camera.zoom / 2), (0 + positionCoordX) * (camera.zoom / 2)];
			const yBoundries = [(0 - positionCoordY ) * (camera.zoom / 2), (0 + positionCoordY) * (camera.zoom / 2)];
			this.screenBoundaries.matrix = {x: xBoundries, y: yBoundries};
		}

		/* ----------------------------- calculating screen and matrix dimensions (END) ----------------------------- */

		/* ----------------------------- calculating coordinates (START) ----------------------------- */

		pixelsToMatrix(positionX, positionY, positionZ) {
			const vector = new THREE.Vector3(positionX, positionY, positionZ);
			vector.x = ((vector.x) / (window.innerWidth / 2) - 1);
			vector.y = -((vector.y) / (window.innerHeight / 2) - 1);
			vector.unproject(camera.render());
			return vector;
		}

		matrixToPixels(positionX, positionY, positionZ) {
			const vector = new THREE.Vector3(positionX, positionY, positionZ);
		    vector.project(camera.render());
		    vector.x = (vector.x + 1) * window.innerWidth / 2;
		    vector.y = (-vector.y + 1) * window.innerHeight / 2;
		    return vector;
		}

		globalCoordToMatrixCoord(coordX, coordY) {
			const x = coordX - this.centerCoordinates.global.x;
			const y = coordY - this.centerCoordinates.global.y;
			return {x: x, y: y};
		}

		distanceBetweenObjects(obj1 , obj2, action) {
			let x;
        	let y;
			if (action === 'global') {
				x = obj1.x - obj2.x;
				y = obj1.y - obj2.y;
			} else if (action === 'matrix') {
				const matrixObj1 = this.globalCoordToMatrixCoord(obj1.x, obj1.y);
				const matrixObj2 = this.globalCoordToMatrixCoord(obj2.x, obj2.y);
				x = matrixObj1.x - matrixObj2.x;
				y = matrixObj1.y - matrixObj2.y;
			}

        	return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		}

		/* ----------------------------- calculating coordinates (END) ----------------------------- */

	}

	const world = new World({x: 5000, y: 5000});

	/* planets */
	class Planets {
		constructor(radius, wSegments, hSegments, material, mass, composition, speed, velocity, id) {
			this.planet;					// created planet

			/* planet data */
			this.planetData = {
				id: id,
				type: id.startsWith('p') ? 'player' : 'enemy',
				rendered: null,
				spawned: null,
				removed: null,
			};

			this.geometry;					// planet geometry
			this.material;					// planet mesh
			this.lighting;					// planet lighting

			/* planet properties */
			this.properties = {
				speed: speed,				// speed
				velocity: velocity,			// velocity
				mass: mass,					// mass
				radius: radius,				// initial radius
				material: material,			// meterial
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
		}

		/* ----------------------------- init planet create (START) ----------------------------- */

		/* set initial radius and segments of the planet */
		setSize(radius = this.properties.radius, wSegment = this.properties.wSegments, hSegment = this.properties.hSegments,) {
			this.geometry = new THREE.SphereGeometry(radius, wSegment, hSegment);
		}

		/* set planets material */
		setMaterial(type, color = this.properties.material.color) {
			if (type === 'sun') {
				this.material = new THREE.MeshBasicMaterial({color: color});
				//this.material.color.multiplyScalar(2);
			} else if (type === 'planet') {
				this.material = new THREE.MeshLambertMaterial({color: color});
				//this.material.color.multiplyScalar(1);
			}

		}

		/* create a planet */
		createPlanet(type) {
			this.planet = new THREE.Mesh(this.geometry, this.material);
			if (type === 'sun') {
				this.planet.castShadow = false;
				this.planet.receiveShadow = false;
				this.planetData.spawned = true;
			} else if (type === 'planet') {
				this.planet = new THREE.Mesh(this.geometry, this.material);
				this.planetData.spawned = true;
				this.planet.castShadow = true;
				this.planet.receiveShadow = true;
			}

			console.log(this.planet);
		}

		createLighting() {
			this.lighting = new THREE.PointLight(0xFEFBC0, 5, 100, 1);
			this.lighting.castShadow = true;
			this.lighting.position.x = 0;
			this.lighting.position.y = 0;
			this.lighting.position.z = 0;
			console.log(this.lighting);
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

		setScale(amount, action) {
			if (action === 'increase') {

			} else if (action === 'decrease') {
				this.deletePlanet();
			}
		}

		/* set planet velocity */
		setVelocity(amount) {
			this.properties.velocity.x = amount.x;
			this.properties.velocity.y = amount.y;
		}

		/* set planet mass */
		setMass(amount) {
			this.properties.mass = amount;
		}

		setLuminosity() {

		}

		removeLights() {
			scene.remove(this.lighting);
		}

		/* adds speed to the planets and player */
		addSpeed() {
			/* arrow navigation */
			if (this.keyboardNavigation.pressedKeys[37]) {
				if (this.properties.speed.x > -0.1) {
					this.properties.speed.x -= 0.005;
				}
			}
			if (this.keyboardNavigation.pressedKeys[38]) {
				if (this.properties.speed.y < 0.1) {
					this.properties.speed.y += 0.005;
				}
			}
			if (this.keyboardNavigation.pressedKeys[39]) {
				if (this.properties.speed.x < 0.1) {
					this.properties.speed.x += 0.005;
				}
			}
			if (this.keyboardNavigation.pressedKeys[40]) {
				if (this.properties.speed.y > -0.1) {
					this.properties.speed.y -= 0.005;
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
		renderPlayer() {
			this.planet.add(this.lighting);
			scene.add(this.planet);
			this.planetData.rendered = true;
		}

		renderEnemy() {
			scene.add(this.planet);
			this.planetData.rendered = true;
		}

		/* check whether a planet has to be rendered */
		renderCheck() {
			let boundaries;
				boundaries = world.screenBoundaries.matrix;
				if (boundaries.x[0] < this.planetCoordinates.matrix.x && boundaries.x[1] > this.planetCoordinates.matrix.x && boundaries.y[0] < this.planetCoordinates.matrix.y && boundaries.y[1] > this.planetCoordinates.matrix.y) {
					if (this.planetData.rendered === null) {
						console.log('add...............................................');
						this.renderEnemy();
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

		/* delete planet from planets array */
		deletePlanet() {
			this.renderRemove();
			world.deletePlanet(this);
		}

		/* ----------------------------- planet render options (END) ----------------------------- */

		/* ----------------------------- in animation loop functions (START) ----------------------------- */

		updatePlayer() {
			this.addSpeed();

			this.planet.receiveShadow = false;
			this.planet.castShadow = false;

			this.planetCoordinates.global.x += (this.properties.speed.x * world.getTime());
			this.planetCoordinates.global.y += (this.properties.speed.y * world.getTime());

			world.addPlanetsCoordinates(this);
			world.addMatrixCenterCoord(this.planetCoordinates.global);

		}

		updatePlanet() {
			this.addSpeed();

			this.planetCoordinates.global.x += (this.properties.speed.x * world.getTime());
			this.planetCoordinates.global.y += (this.properties.speed.y * world.getTime());

			this.planetCoordinates.matrix = world.globalCoordToMatrixCoord(this.planetCoordinates.global.x, this.planetCoordinates.global.y);

			this.setPosition();

			world.addPlanetsCoordinates(this);

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
	}

	const planetsArr = [];

	// radius, wSegments, hSegments, material, mass, composition, speed, velocity

	planetsArr.push(new Planets(1, 24, 24, {color: 0xF6B90A}, 0.4, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'player'));
	planetsArr.push(new Planets(1, 24, 24, {color: 0x9B631C}, 0.2, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'enemy1'));
	planetsArr.push(new Planets(1, 24, 24, {color: 0x9B631C}, 0.2, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'enemy2'));
	planetsArr.push(new Planets(1, 24, 24, {color: 0x9B631C}, 0.2, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'enemy3'));
	//planetsArr.push(new Planets(0.3, 24, 24, {color: 0xFF3333}, 0.1, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'enemy4'));
	//planetsArr.push(new Planets(0.3, 24, 24, {color: 0xFF3333}, 0.1, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'enemy5'));
	//planetsArr.push(new Planets(0.3, 24, 24, {color: 0xFF3333}, 0.1, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'enemy6'));
	//planetsArr.push(new Planets(0.3, 24, 24, {color: 0xFF3333}, 0.1, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'enemy7'));
	//planetsArr.push(new Planets(0.3, 24, 24, {color: 0xFF3333}, 0.1, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'enemy8'));
	//planetsArr.push(new Planets(0.3, 24, 24, {color: 0xFF3333}, 0.1, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'enemy9'));
	//planetsArr.push(new Planets(0.3, 24, 24, {color: 0xFF3333}, 0.1, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'enemy10'));
	//planetsArr.push(new Planets(0.3, 24, 24, {color: 0xFF3333}, 0.1, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'enemy11'));
	//planetsArr.push(new Planets(0.3, 24, 24, {color: 0xFF3333}, 0.1, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'enemy12'));
	//planetsArr.push(new Planets(0.3, 24, 24, {color: 0xFF3333}, 0.1, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'enemy13'));
	//planetsArr.push(new Planets(0.3, 24, 24, {color: 0xFF3333}, 0.1, {}, {x: 0, y: 0}, {x: 0, y: 0}, 'enemy14'));


	function insertPlanetsIntoObj(insert) {
		insert.forEach((planet) => {
			world.planets[planet.planetData.id] = planet;
		});
		console.log(world.planets);
	}
	insertPlanetsIntoObj(planetsArr);

	class UI {
		constructor() {
			this.body = document.querySelector('body');
			this.coordinatesMarker;
		}

		createCoordinatesUI() {
			this.body.insertAdjacentHTML('afterbegin', `<div id="player-coordinates"><p>lat - ( ${world.centerCoordinates.global.x} )</p><p>lng - ( ${world.centerCoordinates.global.y} )</p></div>`);
		}

		update() {
			this.coordinatesMarker = document.querySelector('#player-coordinates');
			this.coordinatesMarker.children[0].textContent = `lat - ( ${world.centerCoordinates.global.x} )`;
			this.coordinatesMarker.children[1].textContent = `lng - ( ${world.centerCoordinates.global.y} )`;

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
			world.planets.player.setSize();
			world.planets.player.setMaterial('sun');
			world.planets.player.createPlanet('sun');
			world.planets.player.createLighting();
			world.planets.player.spawnLocation();
			world.planets.player.renderPlayer();
			world.planets.player.navigationKeyboard();



			world.calculateRenderBoundaries();

			for (let plan in world.planets) {
				if (plan !== 'player') {
					world.planets[plan].setSize();
					world.planets[plan].setMaterial('planet');
					world.planets[plan].createPlanet('planet');
					world.planets[plan].spawnLocation();
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

			for (let plan in world.planets) {
				if (plan !== 'player') {
					world.planets[plan].updatePlanet();
				} else {
					world.planets[plan].updatePlayer();
				}
				world.gravity(world.planets[plan]);
				world.collision(world.planets[plan]);
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