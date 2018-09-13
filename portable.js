AFRAME.registerComponent('portable', {
schema:
{	maxCountdown: {default: 1000}
,	colour: {default: "#fff"}
,	portedTo: {default: false}
,	position: {default: -1}
},

init: function () {
	// Do something when component first attached.
	this.countdown = this.data.maxCountdown;
	this.inFocus = false;
	this.el.setAttribute("material", "color: " + this.data.colour);

	this.el.addEventListener("mouseenter", () => {
		this.el.setAttribute("scale", "1.2 1.2 1.2");
		this.inFocus = true;
	});

	this.el.addEventListener("mouseleave", () => {
		this.el.setAttribute("scale", "1.0 1.0 1.0");
		this.el.setAttribute("material", "color: " + this.data.colour);
		this.inFocus = false;
	});
},

update: function (oldData) {
// Do something when component's data is updated.
if ((oldData.portedTo != this.data.portedTo)
&& (true == this.data.portedTo)) {
	this.torus = document.createElement('a-entity');
  this.torus.setAttribute("position", "0 1.0 0");
  this.torus.setAttribute("geometry", "primitive: torus; arc: 360; radius: 0.25; radius-tubular: 0.05");
  this.torus.setAttribute("rotation", "-90 0 0");
  this.torus.setAttribute("material", "color: #00D4FF");
  this.el.appendChild(this.torus);
}
},

tick: function (time, timeDelta) {
// Do something on every scene tick or frame.
	if (true == this.inFocus) {
		this.countdown -= timeDelta;
		var colour = new THREE.Color(this.data.colour);
		var offset = (this.countdown / this.data.maxCountdown);
		colour.r = Math.max(0.0, colour.r * offset);
		colour.g = Math.max(0.0, colour.g * offset);
		colour.b = Math.max(0.0, colour.b * offset);
		this.el.setAttribute("material", "color: #" + colour.getHexString());
	} else this.countdown = this.data.maxCountdown;

	if (this.countdown <= 0) {
		var gamesystem = document.querySelector('a-scene').systems['game-system'];
		gamesystem.el.emit('jump', { dest: this }, false);
		this.countdown = this.data.maxCountdown;
	}
}
});
