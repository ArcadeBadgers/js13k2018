AFRAME.registerComponent('levelup', {
schema:
{	level: { default: 1 }
},

init: function () {
	this.cycl = document.createElement('a-entity');
	this.cycl.setAttribute("position", "0 0.0 0");
	this.cycl.setAttribute("geometry", "primitive: cylinder; radius: 0.5; height: 2.0");
	this.cycl.setAttribute("material", "color: yellow");
	this.el.appendChild(this.cycl);
}
});
