AFRAME.registerSystem('game-system', {
	schema:
	{	power: { default: 5 }
	,	maxPower: { default: 20 }
	,	height: { default: 0 }
	,	maxHeight: { default: 0 }
	},

	init: function () {
		console.log("Game System Init");

		this.levelNum = 1;
		this.random = this.seed(this.levelNum);
		this.level = [];
		this.levelWH = 20;
		this.levelSZ = this.levelWH * this.levelWH;

		this.generateFloor(this, 0, 1, 0);
		this.money = 0;
		this.chain = [];
		this.restartText = null;
		this.listener = new THREE.AudioListener();
		this.listenerAdded = false;

		var entityEl = document.createElement('a-entity');
		entityEl.setAttribute("position", "10 0 -10");
		entityEl.setAttribute("geometry", "primitive: icosahedron; radius: 1");
		entityEl.setAttribute("portable", "colour: #6600DD; portedTo: true; position: " + this.level.length);
		entityEl.setAttribute("power", "");
		this.el.appendChild(entityEl);
		this.chain.push(entityEl);
		this.level.push(entityEl);

		var camera = document.querySelector('#camera-rig');
		camera.setAttribute("position", "10 1.6 -10");
		
		var data = this.data;
		var system = this;
		this.el.addEventListener('jump', function(event) {
			var camera = document.querySelector('#camera-rig');
			if (data.power > 0) {
				var position = new THREE.Vector3();
				event.detail.dest.el.object3D.getWorldPosition(position);
				event.detail.dest.el.setAttribute("material", "color: " + event.detail.dest.data.colour);
				position.y += 1.6;
				var posOffset = camera.object3D.position.clone();
				posOffset.sub(position);

				camera.setAttribute("position", position);
				var heightMarker = document.querySelector("#height-marker");
				var height = Math.floor(position.y);
				heightMarker.setAttribute("value", height + "m");

				event.detail.dest.line = new PolyLine(1.0);
                event.detail.dest.line.setDirection(posOffset);
                event.detail.dest.line.setPoint(posOffset);
                var lineEnt = document.createElement("a-entity");
                lineEnt.setObject3D("mesh", event.detail.dest.line.mesh);
                event.detail.dest.el.appendChild(lineEnt);
                event.detail.dest.line = lineEnt;

				--data.power;

				if ((undefined != event.detail.dest.el.components.power)
				&& (false == event.detail.dest.el.components.portable.data.portedTo)) {
					data.power += 5;
					if (data.power > data.maxPower)
						data.power = data.maxPower;
				}
				
				if (data.power <= 0) {
						if (null == system.restartText) {
						system.restartText = document.createElement('a-entity');
						system.restartText.setAttribute("position", "0 1 -2.5" );
						system.restartText.setAttribute("geometry", "primitive: plane; width: 1; height: 1;");
						system.restartText.setAttribute("portable", "colour: #444444; position: " + system.level.length);
						system.restartText.setAttribute("restart", "");
						system.restartText.setAttribute("text", "value: RESTART; width:5; align:center");
						system.restartText.system = system;
						event.detail.dest.el.appendChild(system.restartText);
					}
				}

				if ((undefined != event.detail.dest.el.components.levelup)
				&& (system.levelNum < event.detail.dest.el.components.levelup.data.level)) {
					system.levelNum = event.detail.dest.el.components.levelup.data.level;

					var toDestroy = system.chain.splice(0);
					for (var i = 0; i < toDestroy.length; ++i)
						system.money += 10 * (i + 1);
						
					data.power += 5;
					if (data.power > data.maxPower)
						data.power = data.maxPower;

					system.generateFloor(system, position.x, position.y / 10, position.z);
				}

				// check chain
				if (false == system.chain.includes(event.detail.dest.el)) {
					system.chain.push(event.detail.dest.el);
				} else {
					var from = system.chain.indexOf(event.detail.dest.el);
					var toDestroy = system.chain.splice(from + 1);
					for (var i = 0; i < toDestroy.length; ++i) {
						var index = toDestroy[i].components.portable.data.position;
						if (-1 != index) system.level[index] = undefined;
						system.el.removeChild(toDestroy[i]);
						system.money += 10 * (i + 1);
					}
					event.detail.dest.el.removeChild(event.detail.dest.line);
				}
			} else {
				// yes, probably should be separate function.. but with less than a day to go.. sod it
				if (undefined != event.detail.dest.el.components.restart) {
					system.levelNum = 1;
					system.generateFloor(system, 0, 1, 0);
					system.money = 0;
					data.power = system.data.power = 5;
					data.height = system.data.height = 0;
					system.chain = [];
					system.restartText = null;
					
					var entityEl = document.createElement('a-entity');
					entityEl.setAttribute("position", "10 0 -10");
					entityEl.setAttribute("geometry", "primitive: icosahedron; radius: 1");
					entityEl.setAttribute("portable", "colour: #6600DD; portedTo: true; position: " + system.level.length);
					entityEl.setAttribute("power", "");
					system.el.appendChild(entityEl);
					system.chain.push(entityEl);
					system.level.push(entityEl);

					camera.setAttribute("position", "10 1.6 -10");
				}
			}

			event.detail.dest.el.setAttribute("portable", "portedTo: true");
		});
	},

	update: function() {
	},

	remove: function() {
	},

	tick: function (time, timeDelta) {
		var powerMarker = document.querySelector("#power-marker");
		var powerValue = "";
		for (var i = 0; i < this.data.power; ++i)
			powerValue += "I";
		powerMarker.setAttribute("value", powerValue);
		
		var moneyMarker = document.querySelector("#money-marker");
		moneyMarker.setAttribute("value", "$" + this.money);
	},

	seed: function(s) {
    return function() {
        s = Math.sin(s) * 10000; return s - Math.floor(s);
    };
	},

	generateFloor: function(system, _x, _y, _z) {
		var hasPower = false;
		for (var i = 0; i < system.level.length; ++i)
			if (undefined != system.level[i]) system.el.removeChild(system.level[i]);
		system.level = [];
		for (var i = 0; i < system.levelSZ; ++i) {
			var hasPoint = 25 > (system.random() * 100);
			if (true == hasPoint) {
				var z = _z + (((i % system.levelWH) * 10) + (system.random() * 10));
				var x = _x + (((i / system.levelWH) * 10) + (system.random() * 10));
				var y = (_y * 10) + (system.random() * 10);

				var isPower = 25 > (system.random() * system.levelSZ);
				if (true == hasPower) isPower = false;
				if (true == isPower) {
					var entityEl = document.createElement('a-entity');
					entityEl.setAttribute("position", (x - 100) + " " + y + " " + (z - 100));
					entityEl.setAttribute("geometry", "primitive: icosahedron; radius: 1");
					entityEl.setAttribute("portable", "colour: #6600DD; position: " + this.level.length);
					entityEl.setAttribute("power", "");
					entityEl.system = system;
					system.el.appendChild(entityEl);
					this.level.push(entityEl);
				} else {
					var entityEl = document.createElement('a-entity');
					entityEl.setAttribute("position", (x - 100) + " " + y + " " + (z - 100) );
					entityEl.setAttribute("geometry", "primitive: icosahedron; radius: 1");
					entityEl.setAttribute("portable", "colour: #FF1144; position: " + this.level.length);
					entityEl.system = system;
					system.el.appendChild(entityEl);
					this.level.push(entityEl);
				}
			}
		}

		var entityEl = document.createElement('a-entity');
		var leveluppos = new THREE.Vector3(((system.random() * 100) - 50), ((_y * 10) + 30), ((system.random() * 100) - 50));
		entityEl.setAttribute("position", leveluppos.x + " " + leveluppos.y + " " + leveluppos.z );
		entityEl.setAttribute("geometry", "primitive: icosahedron; radius: 1");
		entityEl.setAttribute("portable", "colour: #663C00; position: " + this.level.length);
		entityEl.setAttribute("levelup", "level: " + system.levelNum + 1);
		entityEl.system = system;
		system.el.appendChild(entityEl);
		
		var line = new PolyLine(1.0, 0x00FFF0, 0.25);
		leveluppos.y *= -1;
		line.setDirection(leveluppos);
		line.setPoint(leveluppos);
		var lineEnt = document.createElement("a-entity");
		lineEnt.setObject3D("mesh", line.mesh);
		entityEl.appendChild(lineEnt);
		entityEl.line = lineEnt;
		
		this.level.push(entityEl);
	}
});
