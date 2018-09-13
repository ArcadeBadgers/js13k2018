//Based on RayCurve pinched and adapted from https://github.com/fernandojsg/aframe-teleport-controls
var PolyLine = function (width, colour = 0x00FF00, opacity = 0.5) {
  this.geometry = new THREE.BufferGeometry();
  this.vertices = new Float32Array(12);
  this.width = width;

  this.geometry.addAttribute('position', new THREE.BufferAttribute(this.vertices, 3).setDynamic(true));

  this.material = new THREE.MeshBasicMaterial(
  {	side: THREE.DoubleSide
  ,	color: colour
  ,	opacity: opacity
  ,	transparent: true
  });

  this.mesh = new THREE.Mesh(this.geometry, this.material);
  this.mesh.drawMode = THREE.TriangleStripDrawMode;

  this.mesh.frustumCulled = false;
  this.mesh.vertices = this.vertices;

  this.direction = new THREE.Vector3();
};

PolyLine.prototype = {
  setDirection: function (direction) {
    var UP = new THREE.Vector3(0, 1, 0);
    this.direction
      .copy(direction)
      .cross(UP)
      .normalize()
      .multiplyScalar(this.width / 2);
  },

  setWidth: function (width) {
    this.width = width;
  },

  setPoint: (function () {
    var posA = new THREE.Vector3();
    var posB = new THREE.Vector3();

    return function (point) {
      posA.copy(point).add(this.direction);
      posB.copy(point).sub(this.direction);

      var idx = 6;
      this.vertices[idx++] = posA.x;
      this.vertices[idx++] = posA.y;
      this.vertices[idx++] = posA.z;

      this.vertices[idx++] = posB.x;
      this.vertices[idx++] = posB.y;
      this.vertices[idx++] = posB.z;

      this.geometry.attributes.position.needsUpdate = true;
    };
  })()
};
