AFRAME.registerComponent('power', {
schema:
{
},

init: function () {
	this.cone = document.createElement('a-entity');
	this.cone.setAttribute("position", "0 1.0 0");
	this.cone.setAttribute("geometry", "primitive: cone; radius-bottom: 0.5; radius-top: 0.0");
	this.cone.setAttribute("material", "color: green");
	this.el.appendChild(this.cone);
}

});
