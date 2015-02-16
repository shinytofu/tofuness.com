/**
 * Physics
 * A requirified port of Traer Physics from Processing to JavaScript.
 * Copyright (C) 2012 jonobr1
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

(function() {

var root = this, previousShortcut = root.Physics;

common = (function () {

	/**
	 * Pulled only what's needed from:
	 *
	 * Underscore.js 1.3.3
	 * (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
	 * http://documentcloud.github.com/underscore
	 */

	var breaker = {};
	var ArrayProto = Array.prototype;
	var ObjProto = Object.prototype;
	var hasOwnProperty = ObjProto.hasOwnProperty;
	var slice = ArrayProto.slice;
	var nativeForEach = ArrayProto.forEach;
	var nativeIndexOf      = ArrayProto.indexOf;
	var toString = ObjProto.toString;

	var has = function(obj, key) {
		return hasOwnProperty.call(obj, key);
	};

	var each = function(obj, iterator, context) {

		if (obj == null) return;
				if (nativeForEach && obj.forEach === nativeForEach) {
					obj.forEach(iterator, context);
				} else if (obj.length === +obj.length) {
					for (var i = 0, l = obj.length; i < l; i++) {
						if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
					}
				} else {
					for (var key in obj) {
						if (_.has(obj, key)) {
							if (iterator.call(context, obj[key], key, obj) === breaker) return;
						}
					}
				}

	};

	var identity = function(value) {
		return value;
	};

	var sortedIndex = function(array, obj, iterator) {
		iterator || (iterator = identity);
		var low = 0, high = array.length;
		while (low < high) {
			var mid = (low + high) >> 1;
			iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
		}
		return low;
	};

	return {

		has: has,

		each: each,

		extend: function(obj) {
			each(slice.call(arguments, 1), function(source) {
				for (var prop in source) {
					obj[prop] = source[prop];
				}
			});
			return obj;
		},

		indexOf: function(array, item, isSorted) {
			if (array == null) return -1;
			var i, l;
			if (isSorted) {
				i = sortedIndex(array, item);
				return array[i] === item ? i : -1;
			}
			if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
			for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
			return -1;
		},

		sortedIndex: sortedIndex,

		identity: identity,

		isNumber: function(obj) {
			return toString.call(obj) == '[object Number]';
		},

		isFunction: function(obj) {
			return toString.call(obj) == '[object Function]' || typeof obj == 'function';
		},

		isUndefined: function(obj) {
			return obj === void 0;
		},

		isNull: function(obj) {
			return obj === null;
		}

	}

})();


Vector = (function (_) {

	/**
	 * A two dimensional vector.
	 */
	var Vector = function(x, y) {

		this.x = x || 0;
		this.y = y || 0;

	};

	_.extend(Vector.prototype, {

		set: function(x, y) {
			this.x = x;
			this.y = y;
			return this;
		},

		copy: function(v) {
			this.x = v.x;
			this.y = v.y;
			return this;
		},

		clear: function() {
			this.x = 0;
			this.y = 0;
			return this;
		},

		clone: function() {
			return new Vector(this.x, this.y);
		},

		add: function(v1, v2) {
			this.x = v1.x + v2.x;
			this.y = v1.y + v2.y;
			return this;
		},

		addSelf: function(v) {
			this.x += v.x;
			this.y += v.y;
			return this;
		},

		sub: function(v1, v2) {
			this.x = v1.x - v2.x;
			this.y = v1.y - v2.y;
			return this;
		},

		subSelf: function(v) {
			this.x -= v.x;
			this.y -= v.y;
			return this;
		},

		multiplySelf: function(v) {
			this.x *= v.x;
			this.y *= v.y;
			return this;
		},

		multiplyScalar: function(s) {
			this.x *= s;
			this.y *= s;
			return this;
		},

		divideScalar: function(s) {
			if (s) {
				this.x /= s;
				this.y /= s;
			} else {
				this.set(0, 0);
			}
			return this;
		},

		negate: function() {
			return this.multiplyScalar(-1);
		},

		dot: function(v) {
			return this.x * v.x + this.y * v.y;
		},

		lengthSquared: function() {
			return this.x * this.x + this.y * this.y;
		},

		length: function() {
			return Math.sqrt(this.lengthSquared());
		},

		normalize: function() {
			return this.divideScalar(this.length());
		},

		distanceTo: function(v) {
			return Math.sqrt(this.distanceToSquared(v));
		},

		distanceToSquared: function(v) {
			var dx = this.x - v.x, dy = this.y - v.y;
			return dx * dx + dy * dy;
		},

		setLength: function(l) {
			return this.normalize().multiplyScalar(l);
		},

		equals: function(v) {
			return (this.distanceTo(v) < 0.0001 /* almost same position */);
		},

		lerp: function(v, t) {
			var x = (v.x - this.x) * t + this.x;
			var y = (v.y - this.y) * t + this.y;
			return this.set(x, y);
		},

		isZero: function() {
			return (this.length() < 0.0001 /* almost zero */ );
		}

	});

	return Vector;

})(common);


root.Physics = Physics = (function (ParticleSystem, raf, _) {

	var instances = [];

	/**
	 * Extended singleton instance of ParticleSystem with convenience methods for
	 * Request Animation Frame.
	 * @class
	 */
	var Physics = function() {

		var _this = this;

		this.playing = false;

		ParticleSystem.apply(this, arguments);

		this.animations = [];

		this.equilibriumCallbacks = [];

		instances.push(this);

	};

	_.extend(Physics, ParticleSystem, {

		superclass: ParticleSystem

	});

	_.extend(Physics.prototype, ParticleSystem.prototype, {

		/**
		 * Play the animation loop. Doesn't affect whether in equilibrium or not.
		 */
		play: function() {

			if (this.playing) {
				return this;
			}

			this.playing = true;
			this.__equilibrium = false;

			return this;

		},

		/**
		 * Pause the animation loop. Doesn't affect whether in equilibrium or not.
		 */
		pause: function() {

			this.playing = false;
			return this;

		},

		/**
		 * Toggle between playing and pausing the simulation.
		 */
		toggle: function() {

			if (this.playing) {
				this.pause();
			} else {
				this.play();
			}

			return this;

		},

		onUpdate: function(func) {

			if (_.indexOf(this.animations, func) >= 0 || !_.isFunction(func)) {
				return this;
			}

			this.animations.push(func);

			return this;

		},

		onEquilibrium: function(func) {

			if (_.indexOf(this.equilibriumCallbacks, func) >= 0 || !_.isFunction(func)) {
				return this;
			}

			this.equilibriumCallbacks.push(func);

			return this;

		},

		/**
		 * Call update after values in the system have changed and this will fire
		 * it's own Request Animation Frame to update until things have settled
		 * to equilibrium — at which point the system will stop updating.
		 */
		update: function() {

			if (this.__optimized && this.__equilibrium) {
				return this;
			}

			var i;

			this.tick();

			for (i = 0; i < this.animations.length; i++) {
				this.animations[i]();
			}

			if (this.__optimized && this.__equilibrium){

				for (i = 0; i < this.equilibriumCallbacks.length; i++) {
					this.equilibriumCallbacks[i]();
				}

			}

			return this;

		}

	});

	function loop() {

		raf(loop);

		for (var i = 0; i < instances.length; i++) {
			var system = instances[i];
			if (system.playing) {
				system.update();
			}
		}

	}

	loop();

	return Physics;

})(ParticleSystem = (function (Vector, Particle, Spring, Attraction, Integrator, _) {

	/**
	 * traer.js
	 * A particle-based physics engine ported from Jeff Traer's Processing
	 * library to JavaScript. This version is intended for use with the
	 * HTML5 canvas element. It is dependent on Three.js' Vector2 class,
	 * but can be overridden with any Vector2 class with the methods included.
	 *
	 * @author Jeffrey Traer Bernstein <jeff TA traer TOD cc> (original Java library)
	 * @author Adam Saponara <saponara TA gmail TOD com> (JavaScript port)
	 * @author Jono Brandel <http://jonobr1.com/> (requirified/optimization port)
	 *
	 * @version 0.3
	 * @date March 25, 2012
	 */

	/**
	 * The whole kit and kaboodle.
	 *
	 * @class
	 */
	var ParticleSystem = function() {

		this.__equilibriumCriteria = { particles: true, springs: true, attractions: true };
		this.__equilibrium = false; // are we at equilibrium?
		this.__optimized = false;

		this.particles = [];
		this.springs = [];
		this.attractions = [];
		this.forces = [];
		this.integrator = new Integrator(this);
		this.hasDeadParticles = false;

		var args = arguments.length;

		if (args === 1) {
			this.gravity = new Vector(0, arguments[0]);
			this.drag = ParticleSystem.DEFAULT_DRAG;
		} else if (args === 2) {
			this.gravity = new Vector(0, arguments[0]);
			this.drag = arguments[1];
		} else if (args === 3) {
			this.gravity = new Vector(arguments[0], arguments[1]);
			this.drag = arguments[3];
		} else {
			this.gravity = new Vector(0, ParticleSystem.DEFAULT_GRAVITY);
			this.drag = ParticleSystem.DEFAULT_DRAG;
		}

	};

	_.extend(ParticleSystem, {

		DEFAULT_GRAVITY: 0,

		DEFAULT_DRAG: 0.001,

		Attraction: Attraction,

		Integrator: Integrator,

		Particle: Particle,

		Spring: Spring,

		Vector: Vector

	});

	_.extend(ParticleSystem.prototype, {

		/**
		 * Set whether to optimize the simulation. This enables the check of whether
		 * particles are moving.
		 */
		optimize: function(b) {
			this.__optimized = !!b;
			return this;
		},

		/**
		 * Set the gravity of the ParticleSystem.
		 */
		setGravity: function(x, y) {
			this.gravity.set(x, y);
			return this;
		},

		/**
		* Sets the criteria for equilibrium
		*/
		setEquilibriumCriteria: function(particles, springs, attractions) {
			this.__equilibriumCriteria.particles = !!particles;
			this.__equilibriumCriteria.springs = !!springs;
			this.__equilibriumCriteria.attractions = !!attractions;
		},

		/**
		 * Update the integrator
		 */
		tick: function() {
			this.integrator.step(arguments.length === 0 ? 1 : arguments[0]);
			if (this.__optimized) {
				this.__equilibrium = !this.needsUpdate();
			}
			return this;
		},

		/**
		 * Checks all springs and attractions to see if the contained particles are
		 * inert / resting and returns a boolean.
		 */
		needsUpdate: function() {

			var i = 0;

			if (this.__equilibriumCriteria.particles) {
				for (i = 0, l = this.particles.length; i < l; i++) {
					if (!this.particles[i].resting()) {
						return true;
					}
				}
			}

			if (this.__equilibriumCriteria.springs) {
				for (i = 0, l = this.springs.length; i < l; i++) {
					if (!this.springs[i].resting()) {
						return true;
					}
				}
			}

			if (this.__equilibriumCriteria.attractions) {
				for (i = 0, l = this.attractions.length; i < l; i++) {
					if (!this.attractions[i].resting()) {
						return true;
					}
				}
			}

			return false;

		},

		/**
		 * Add a particle to the ParticleSystem.
		 */
		addParticle: function(p) {

			this.particles.push(p);
			return this;

		},

		/**
		 * Add a spring to the ParticleSystem.
		 */
		addSpring: function(s) {

			this.springs.push(s);
			return this;

		},

		/**
		 * Add an attraction to the ParticleSystem.
		 */
		addAttraction: function(a) {

			this.attractions.push(a);
			return this;

		},

		/**
		 * Makes and then adds Particle to ParticleSystem.
		 */
		makeParticle: function(m, x, y) {

			var mass = _.isNumber(m) ? m : 1.0;
			var x = x || 0;
			var y = y || 0;

			var p = new Particle(mass);
			p.position.set(x, y);
			this.addParticle(p);
			return p;

		},

		/**
		 * Makes and then adds Spring to ParticleSystem.
		 */
		makeSpring: function(a, b, k, d, l) {

			var spring = new Spring(a, b, k, d, l);
			this.addSpring(spring);
			return spring;

		},

		/**
		 * Makes and then adds Attraction to ParticleSystem.
		 */
		makeAttraction: function(a, b, k, d) {

			var attraction = new Attraction(a, b, k, d);
			this.addAttraction(attraction);
			return attraction;

		},

		/**
		 * Wipe the ParticleSystem clean.
		 */
		clear: function() {

			this.particles.length = 0;
			this.springs.length = 0;
			this.attractions.length = 0;

		},

		/**
		 * Calculate and apply forces.
		 */
		applyForces: function() {

			var i, p;

			if (!this.gravity.isZero()) {

				for (i = 0; i < this.particles.length; i++) {
					this.particles[i].force.addSelf(this.gravity);
				}

			}

			var t = new Vector();

			for (i = 0; i < this.particles.length; i++) {

				p = this.particles[i];
				t.set(p.velocity.x * -1 * this.drag, p.velocity.y * -1 * this.drag);
				p.force.addSelf(t);

			}

			for (i = 0; i < this.springs.length; i++) {
				this.springs[i].update();
			}

			for (i = 0; i < this.attractions.length; i++) {
				this.attractions[i].update();
			}

			for (i = 0; i < this.forces.length; i++) {
				this.forces[i].update();
			}

			return this;

		},

		/**
		 * Clear all particles in the system.
		 */
		clearForces: function() {
			for (var i = 0; i < this.particles.length; i++) {
				this.particles[i].clear();
			}
			return this;
		}

	});

	return ParticleSystem;

})(Vector,
Particle = (function (Vector, _) {

	var Particle = function(mass) {

		this.position = new Vector();
		this.velocity = new Vector();
		this.force = new Vector();
		this.mass = mass;
		this.fixed = false;
		this.age = 0;
		this.dead = false;

	};

	_.extend(Particle.prototype, {

		/**
		 * Get the distance between two particles.
		 */
		distanceTo: function(p) {
			return this.position.distanceTo(p.position);
		},

		/**
		 * Make the particle fixed in 2D space.
		 */
		makeFixed: function() {
			this.fixed = true;
			this.velocity.clear();
			return this;
		},

		/**
		 * Reset a particle.
		 */
		reset: function() {

			this.age = 0;
			this.dead = false;
			this.position.clear();
			this.velocity.clear();
			this.force.clear();
			this.mass = 1.0;

			return this;
		},

		/**
		 * Returns a boolean describing whether the particle is in movement.
		 */
		resting: function() {
			return this.fixed || this.velocity.isZero() && this.force.isZero();
		}

	});

	return Particle;

})(Vector,
common),
Spring = (function (Vector, _) {

	var Spring = function(a, b, k, d, l) {

		this.constant = k;
		this.damping = d;
		this.length = l;
		this.a = a;
		this.b = b;
		this.on = true;

	};

	_.extend(Spring.prototype, {

		/**
		 * Returns the distance between particle a and particle b
		 * in 2D space.
		 */
		currentLength: function() {
			return this.a.position.distanceTo(this.b.position);
		},

		/**
		 * Update spring logic.
		 */
		update: function() {

			var a = this.a;
			var b = this.b;
			if (!(this.on && (!a.fixed || !b.fixed))) return this;

			var a2b = new Vector().sub(a.position, b.position);
			var d = a2b.length();

			if (d === 0) {
				a2b.clear();
			} else {
				a2b.divideScalar(d);  // Essentially normalize
			}

			var fspring = -1 * (d - this.length) * this.constant;

			var va2b = new Vector().sub(a.velocity, b.velocity);

			var fdamping = -1 * this.damping * va2b.dot(a2b);

			var fr = fspring + fdamping;

			a2b.multiplyScalar(fr);

			if (!a.fixed) {
				a.force.addSelf(a2b);
			}
			if (!b.fixed) {
				b.force.subSelf(a2b);
			}

			return this;

		},

		/**
		 * Returns a boolean describing whether the spring is resting or not.
		 * Convenient for knowing whether or not the spring needs another update
		 * tick.
		 */
		resting: function() {

			var a = this.a;
			var b = this.b;
			var l = this.length;

			return !this.on || (a.fixed && b.fixed)
				|| (a.fixed && (l === 0 ? b.position.equals(a.position) : b.position.distanceTo(a.position) <= l) && b.resting())
				|| (b.fixed && (l === 0 ? a.position.equals(b.position) : a.position.distanceTo(b.position) <= l) && a.resting());

		}

	});

	return Spring;

})(Vector,
common),
Attraction = (function (Vector, _) {

	var Attraction = function(a, b, k, d) {

		this.a = a;
		this.b = b;
		this.constant = k;
		this.on = true;
		this.distanceMin = d;
		this.distanceMinSquared = d * d;

	};

	_.extend(Attraction.prototype, {

		update: function() {

		 var a = this.a, b = this.b;
		 if (!this.on || (a.fixed && b.fixed)) {
			 return;
		 }

		 var a2bx = a.position.x - b.position.x;
		 var a2by = a.position.y - b.position.y;

		 var a2b = new Vector().sub(a.position, b.position);

		 var a2bdistanceSquared = Math.max(a2b.lengthSquared(), this.distanceMinSquared);

		 var force = (this.constant * a.mass * b.mass) / a2bdistanceSquared;

		 var length = Math.sqrt(a2bdistanceSquared);

		 if (force === 0 || length === 0) {
			 a2b.clear();
		 } else {
			 a2b.divideScalar(length).multiplyScalar(force);
		 }

		 if (!a.fixed) {
			 a.force.subSelf(a2b);
		 }
		 if (!b.fixed) {
			 b.force.addSelf(a2b);
		 }

		 return this;

		},

		/**
		 * Returns a boolean describing whether the spring is resting or not.
		 * Convenient for knowing whether or not the spring needs another update
		 * tick.
		 *
		 * TODO: Test
		 */
		resting: function() {

			var a = this.a;
			var b = this.b;
			var l = this.distanceMin;

			return !this.on || (a.fixed && b.fixed)
				|| (a.fixed && b.position.distanceTo(a.position) <= l && b.resting())
				|| (b.fixed && a.position.distanceTo(b.position) <= l && a.resting());

		}

	});

	return Attraction;

})(Vector,
common),
Integrator = (function (Vector, _) {

	/**
	 * Runge Kutta Integrator
	 * http://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods
	 *
	 * @class
	 */
	var Integrator = function(s) {
		this.s = s;
		this.originalPositions = [];
		this.originalVelocities = [];
		this.k1Forces = [];
		this.k1Velocities = [];
		this.k2Forces = [];
		this.k2Velocities = [];
		this.k3Forces = [];
		this.k3Velocities = [];
		this.k4Forces = [];
		this.k4Velocities = [];
	};

	_.extend(Integrator.prototype, {

		allocateParticles: function() {

			while (this.s.particles.length > this.originalPositions.length) {
				this.originalPositions.push(new Vector());
				this.originalVelocities.push(new Vector());
				this.k1Forces.push(new Vector());
				this.k1Velocities.push(new Vector());
				this.k2Forces.push(new Vector());
				this.k2Velocities.push(new Vector());
				this.k3Forces.push(new Vector());
				this.k3Velocities.push(new Vector());
				this.k4Forces.push(new Vector());
				this.k4Velocities.push(new Vector());
			}

			return this;

		},

		step: function(dt) {

			var s = this.s;
			var p, x, y, i;

			var op, k1v, k2v, k3v, k4v, ov, k1f, k2f, k3f, k4f;

			this.allocateParticles();

			for (i = 0; i < s.particles.length; i++) {

				p = s.particles[i];

				if (!p.fixed) {
					this.originalPositions[i].copy(p.position);
					this.originalVelocities[i].copy(p.velocity);
				}

				p.force.clear();

			}

			// K1

			s.applyForces();

			for (i = 0; i < s.particles.length; i++) {

				p = s.particles[i];

				if (!p.fixed) {
					this.k1Forces[i].copy(p.force);
					this.k1Velocities[i].copy(p.velocity);
				}

				p.force.clear();

			}

			// K2

			for (i = 0; i < s.particles.length; i++) {

				p = s.particles[i];

				if (!p.fixed) {

					op = this.originalPositions[i];
					k1v = this.k1Velocities[i];
					x = op.x + k1v.x * 0.5 * dt;
					y = op.y + k1v.y * 0.5 * dt;
					p.position.set(x, y);

					ov = this.originalVelocities[i];
					k1f = this.k1Forces[i];
					x = ov.x + k1f.x * 0.5 * dt / p.mass;
					y = ov.y + k1f.y * 0.5 * dt / p.mass;
					p.velocity.set(x, y);

				}

			}

			s.applyForces();

			for (i = 0; i < s.particles.length; i++) {

				p = s.particles[i];

				if (!p.fixed) {
					this.k2Forces[i].copy(p.force);
					this.k2Velocities[i].copy(p.velocity);
				}

				p.force.clear();

			}

			// K3

			for (i = 0; i < s.particles.length; i++) {

				p = s.particles[i];

				if (!p.fixed) {

					op = this.originalPositions[i];
					k2v = this.k2Velocities[i];
					p.position.set(op.x + k2v.x * 0.5 * dt, op.y + k2v.y * 0.5 * dt);

					ov = this.originalVelocities[i];
					k2f = this.k2Forces[i];
					p.velocity.set(ov.x + k2f.x * 0.5 * dt / p.mass, ov.y + k2f.y * 0.5 * dt / p.mass);

				}

			}

			s.applyForces();

			for (i = 0; i < s.particles.length; i++) {

				p = s.particles[i];

				if (!p.fixed) {
					this.k3Forces[i].copy(p.force);
					this.k3Velocities[i].copy(p.velocity);
				}

				p.force.clear();

			}

			// K4

			for (i = 0; i < s.particles.length; i++) {

				p = s.particles[i];

				if (!p.fixed) {

					op = this.originalPositions[i];
					k3v = this.k3Velocities[i];
					p.position.set(op.x + k3v.x * dt, op.y + k3v.y * dt);

					ov = this.originalVelocities[i];
					k3f = this.k3Forces[i];
					p.velocity.set(ov.x + k3f.x * dt / p.mass, ov.y + k3f.y * dt / p.mass);

				}

			}

			s.applyForces();

			for (i = 0; i < s.particles.length; i++) {

				p = s.particles[i];

				if (!p.fixed) {
					this.k4Forces[i].copy(p.force);
					this.k4Velocities[i].copy(p.velocity);
				}

			}

			// TOTAL

			for (i = 0; i < s.particles.length; i++) {

				p = s.particles[i];

				p.age += dt;

				if (!p.fixed) {

					op = this.originalPositions[i];
					k1v = this.k1Velocities[i];
					k2v = this.k2Velocities[i];
					k3v = this.k3Velocities[i];
					k4v = this.k4Velocities[i];

					x = op.x + dt / 6.0 * (k1v.x + 2.0 * k2v.x + 2.0 * k3v.x + k4v.x);
					y = op.y + dt / 6.0 * (k1v.y + 2.0 * k2v.y + 2.0 * k3v.y + k4v.y);

					p.position.set(x, y);

					ov = this.originalVelocities[i];
					k1f = this.k1Forces[i];
					k2f = this.k2Forces[i];
					k3f = this.k3Forces[i];
					k4f = this.k4Forces[i];

					x = ov.x + dt / (6.0 * p.mass) * (k1f.x + 2.0 * k2f.x + 2.0 * k3f.x + k4f.x);
					y = ov.y + dt / (6.0 * p.mass) * (k1f.y + 2.0 * k2f.y + 2.0 * k3f.y + k4f.y);

					p.velocity.set(x, y);

				}

			}

			return this;

		}

	});

	return Integrator;

})(Vector,
common),
common),
requestAnimationFrame = (function () {

	/*
	 * Requirified version of Paul Irish's request animation frame.
	 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	 */

	return  window.requestAnimationFrame       ||
					window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame    ||
					window.oRequestAnimationFrame      ||
					window.msRequestAnimationFrame     ||
					function (callback) {
						window.setTimeout(callback, 1000 / 60);
					};
})(),
common);

})();

/*global jQuery */
/*!
 * Kerning.js
 * Version: 0.2
 * Copyright 2011 Joshua Gross
 * MIT license
 *
 * Usage:
 *  Include this file anywhere in your HTML
 *    <script src="kerning.js"></script>
 *
 *  Then, add any of the attributes following to your CSS, under any
 *  selectors you want modified:
 *    -letter-kern, -letter-size, -letter-weight, -letter-color, -letter-transform
 *    -word-kern, -word-size, -word-weight, -word-color, -word-transform
 *
 *  To use pairings (e.g., modify 'a' if 'ab' is paired):
 *    -letter-pairs('xy': [value], …)
 *    -word-pairs('cat mouse': [value], …)
 *
 *  To use multiple transforms, you need to use transform "groups":
 *    -transform-group([transform] [transform] …)
 *
 *  Sometimes you need to want to use a different size or weight, depending on what
 *  font has loaded:
 *    font-size: [default size];
 *    font-size: if-font('font name': [size], 'font name': [size], …);
 *  (The first line is a fallback should Kerning.js not load. This is recommended.)
 *
 *  That's it! Attributes will be applied automagically.
 *
 * Examples:
 *  Alter first 3 letters:
 *    -letter-size: 100px 20px 30px;
 *
 *  Modify letter pairs:
 *    -letter-kern: -letter-pairs('ab': 1px,
 *                                'bc': 300px,
 *                                's ': 100px);
 *
 *  Transform the first two letters:
 *    -letter-transform: -transform-group(rotate3d(0,0,1,10deg) translate3d(0,10px,0))
 *                       -transform-group(translate3d(0,-10px,0) rotate3d(0,0,1,-10deg));
 *
 *  Modify word pairs:
 *    -word-size: -word-pairs('this is': 10em);
 *
 *  Modify the first 3 words:
 *    -word-size: 10em 0.1em 0.2em;
 *
 *  Using repeat rules:
 *    -letter-color: -letter-repeat(even: #f0f0f0, odd: #cccccc);
 *    -letter-color: -letter-repeat(2n+1: #f0f0f0);
 *
 *  Using conditionals:
 *    -letter-kern: if-font('Helvetica Neue': 0 1px 1px, 'Helvetica': 0 -1px 0);
 *
 *  Using conditionals on existing properties for weight or size:
 *    font-size: 9.5em;
 *    font-size: if-font('Helvetica Neue': 10em, 'Helvetica': 9em);
 */
(function($){
	/*!
	 * jQuery based CSS parser
	 * documentation: http://youngisrael-stl.org/wordpress/2009/01/16/jquery-css-parser/
	 * Version: 1.3
	 * Copyright (c) 2011 Daniel Wachsstock
	 * MIT license
	 */
	(function() {
		// utility function, since we want to allow $('style') and $(document), so we need to look for elements in the jQuery object ($.fn.filter) and elements that are children of the jQuery object ($.fn.find)
		$.fn.findandfilter = function(selector) {
			var ret = this.filter(selector).add(this.find(selector));
			ret.prevObject = ret.prevObject.prevObject; // maintain the filter/end chain correctly (the filter and the find both push onto the chain).
			return ret;
		};

		$.fn.parsecss = function(callback, parseAttributes) {
			var parse = function(str) { $.parsecss(str, callback) }; // bind the callback
			this.findandfilter('style')
				.each(function(){
					parse(this.innerHTML);
				})
				.end()
				.findandfilter('link[type="text/css"],link[rel="stylesheet"]')
				.each(function(){
					// only get the stylesheet if it's not disabled, it won't trigger cross-site security (doesn't start with anything like http:) and it uses the appropriate media)
					if(!this.disabled && !(/^\w+:/.test($(this).attr('href'))) && $.parsecss.mediumApplies(this.media))
						$.get(this.href, parse);
				})
				.end();

			if(parseAttributes) {
				$.get(location.pathname+location.search, 'text', function(HTMLtext) {
					styleAttributes(HTMLtext, callback);
				});
			}

			return this;
		};

		$.parsecss = function(str, callback) {
			var ret = {};
			str = munge(str).replace(/@(([^;`]|`[^b]|`b[^%])*(`b%)?);?/g, function(s, rule) {
				// @rules end with ; or a block, with the semicolon not being part of the rule but the closing brace (represented by `b%) is
				processAtRule($.trim(rule), callback);
				return '';
			});

			$.each(str.split('`b%'), function(i, css) { // split on the end of a block
				css = css.split('%b`'); // css[0] is the selector; css[1] is the index in munged for the cssText
				if (css.length < 2) return; // invalid css
				css[0] = restore(css[0]);
				ret[css[0]] = $.extend(ret[css[0]] || {}, parsedeclarations(css[1]));
			});
			callback(ret);
		};
		// explanation of the above: munge(str) strips comments and encodes strings and brace-delimited blocks, so that
		// %b` corresponds to { and `b% corresponds to }
		// munge(str) replaces blocks with %b`1`b% (for example)
		//
		// str.split('`b%') splits the text by '}' (which ends every CSS statement)
		// Each so the each(munge(str... function(i,css)
		// is called with css being empty (the string after the last delimiter), an @rule, or a css statement of the form
		// selector %b`n where n is a number (the block was turned into %b`n`b% by munge). Splitting on %b` gives the selector and the
		// number corresponding to the declaration block. parsedeclarations will do restore('%b`'+n+'`b%') to get it back.

		// if anyone ever implements http://www.w3.org/TR/cssom-view/#the-media-interface, we're ready
		$.parsecss.mediumApplies = (window.media && window.media.query) || function(str) {
			if(!str) return true; // if no descriptor, everything applies
			if(str in media) return media[str];
			var style = $('<style media="'+str+'">body {position: relative; z-index: 1;}</style>').appendTo('head');
			return media[str] = [$('body').css('z-index')==1, style.remove()][0]; // the [x,y][0] is a silly hack to evaluate two expressions and return the first
		};

		$.parsecss.isValidSelector = function(str) {
			var s = $('<style>'+str+'{}</style>').appendTo('head')[0];
			// s.styleSheet is IE; it accepts illegal selectors but converts them to UNKNOWN. Standards-based (s.shee.cssRules) just reject the rule
			return [s.styleSheet ? !/UNKNOWN/i.test(s.styleSheet.cssText) : !!s.sheet.cssRules.length, $(s).remove()][0]; // the [x,y][0] is a silly hack to evaluate two expressions and return the first
		};

		$.parsecss.parseArguments = function(str) {
			if(!str) return [];
			var ret = [], mungedArguments = munge(str, true).split(/\s+/); // can't use $.map because it flattens arrays !
			for (var i = 0; i < mungedArguments.length; ++i) {
				var a = restore(mungedArguments[i]);
				try {
					ret.push(eval('('+a+')'));
				} catch(err) {
					ret.push(a);
				}
			}
			return ret;
		};

		// expose the styleAttributes function
		$.parsecss.styleAttributes = styleAttributes;

		// caches
		var media = {}; // media description strings
		var munged = {}; // strings that were removed by the parser so they don't mess up searching for specific characters

		// private functions

		function parsedeclarations(index) { // take a string from the munged array and parse it into an object of property: value pairs
			var str = munged[index].replace(/^{|}$/g, ''); // find the string and remove the surrounding braces
			str = munge(str); // make sure any internal braces or strings are escaped
			var parsed = {};
			$.each(str.split(';'), function (i, decl) {
				decl = decl.split(':');
				if(decl.length < 2) return;
				parsed[restore(decl[0])] = restore(decl.slice(1).join(':'));
			});
			return parsed;
		}

		// replace strings and brace-surrounded blocks with %s`number`s% and %b`number`b%. By successively taking out the innermost
		// blocks, we ensure that we're matching braces. No way to do this with just regular expressions. Obviously, this assumes no one
		// would use %s` in the real world.
		// Turns out this is similar to the method that Dean Edwards used for his CSS parser in IE7.js (http://code.google.com/p/ie7-js/)
		var REbraces = /{[^{}]*}/;
		var REfull = /\[[^\[\]]*\]|{[^{}]*}|\([^()]*\)|function(\s+\w+)?(\s*%b`\d+`b%){2}/; // match pairs of parentheses, brackets, and braces and function definitions.
		var REatcomment = /\/\*@((?:[^\*]|\*[^\/])*)\*\//g; // comments of the form /*@ text */ have text parsed
		// we have to combine the comments and the strings because comments can contain string delimiters and strings can contain comment delimiters
		// var REcomment = /\/\*(?:[^\*]|\*[^\/])*\*\/|<!--|-->/g; // other comments are stripped. (this is a simplification of real SGML comments (see http://htmlhelp.com/reference/wilbur/misc/comment.html) , but it's what real browsers use)
		// var REstring = /\\.|"(?:[^\\\"]|\\.|\\\n)*"|'(?:[^\\\']|\\.|\\\n)*'/g; //  match escaped characters and strings
		var REcomment_string = /(?:\/\*(?:[^\*]|\*[^\/])*\*\/)|(\\.|"(?:[^\\\"]|\\.|\\\n)*"|'(?:[^\\\']|\\.|\\\n)*')/g;
		var REmunged = /%\w`(\d+)`\w%/;
		var uid = 0; // unique id number
		function munge(str, full) {
			str = str
					.replace(REatcomment,'$1') // strip /*@ comments but leave the text (to let invalid CSS through)
					.replace(REcomment_string, function (s, string) { // strip strings and escaped characters, leaving munged markers, and strip comments
						if (!string) return '';
						var replacement = '%s`'+(++uid)+'`s%';
						munged[uid] = string.replace(/^\\/,''); // strip the backslash now
						return replacement;
					});
			// need a loop here rather than .replace since we need to replace nested braces
			var RE = full ? REfull : REbraces;
			while(match = RE.exec(str)) {
				replacement = '%b`'+(++uid)+'`b%';
				munged[uid] = match[0];
				str = str.replace(RE, replacement);
			}
			return str;
		}

		function restore(str) {
			if(str === undefined) return str;
			while(match = REmunged.exec(str)) {
				str = str.replace(REmunged, munged[match[1]]);
			}
			return $.trim(str);
		}

		function processAtRule (rule, callback) {
			var split = rule.split(/\s+/); // split on whitespace
			var type = split.shift(); // first word
			if(type=='media') {
				var css = restore(split.pop()).slice(1, -1); // last word is the rule; need to strip the outermost braces
				if($.parsecss.mediumApplies(split.join(' '))) {
					$.parsecss(css, callback);
				}
			} else if (type=='import') {
				var url = restore(split.shift());
				if($.parsecss.mediumApplies(split.join(' '))) {
					url = url.replace(/^url\(|\)$/gi, '').replace(/^["']|["']$/g, ''); // remove the url('...') wrapper
					$.get(url, function(str) { $.parsecss(str, callback) });
				}
			}
		}

		// override show and hide. $.data(el, 'showDefault') is a function that is to be used for show if no arguments are passed in (if there are arguments, they override the stored function)
		// Many of the effects call the native show/hide() with no arguments, resulting in an infinite loop.
		var _show = {show: $.fn.show, hide: $.fn.hide}; // save the originals
		$.each(['show', 'hide'], function() {
			var which = this, show = _show[which], plugin = which+'Default';
			$.fn[which] = function(){
				if(arguments.length > 0) return show.apply(this, arguments);
				return this.each(function() {
					var fn = $.data(this, plugin), $this = $(this);
					if(fn) {
						$.removeData(this, plugin); // prevent the infinite loop
						fn.call($this);
						$this.queue(function() { $this.data(plugin, fn).dequeue() }); // put the function back at the end of the animation
					} else {
						show.call($this);
					}
				});
			};
			$.fn[plugin] = function() {
				var args = $.makeArray(arguments), name = args[0];
				if($.fn[name]) { // a plugin
					args.shift();
					var fn = $.fn[name];
				} else if($.effects && $.effects[name]) { // a jQuery UI effect. They require an options object as the second argument
					if(typeof args[1] != 'object') args.splice(1, 0, {});
					fn = _show[which];
				} else { // regular show/hide
					fn = _show[which];
				}
				return this.data(plugin, function() { fn.apply(this,args) });
			};
		});

		// experimental: find unrecognized style attributes in elements by reloading the code as text
		var RESGMLcomment = /<!--([^-]|-[^-])*-->/g; // as above, a simplification of real comments. Don't put -- in your HTML comments!
		var REnotATag = /(>)[^<]*/g;
		var REtag = /<(\w+)([^>]*)>/g;

		function styleAttributes(HTMLtext, callback) {
			var ret = '', style, tags = {}; //  keep track of tags so we can identify elements unambiguously
			HTMLtext = HTMLtext.replace(RESGMLcomment, '').replace(REnotATag, '$1');
			munge(HTMLtext).replace(REtag, function(s, tag, attrs) {
				tag = tag.toLowerCase();
				if(tags[tag]) ++tags[tag]; else tags[tag] = 1;
				if(style = /\bstyle\s*=\s*(%s`\d+`s%)/i.exec(attrs)) { // style attributes must be of the form style = "a: bc" ; they must be in quotes. After munging, they are marked with numbers. Grab that number
					var id = /\bid\s*=\s*(\S+)/i.exec(attrs); // find the id if there is one.
					if (id) id = '#'+restore(id[1]).replace(/^['"]|['"]$/g,''); else id = tag + ':eq(' + (tags[tag]-1) + ')';
					ret += [id, '{', restore(style[1]).replace(/^['"]|['"]$/g,''),'}'].join('');
				}
			});
			$.parsecss(ret, callback);
		}
	})();


   /*
	* Lettering.JS 0.6.1
	*
	* Copyright 2010, Dave Rupert http://daverupert.com
	* Released under the WTFPL license
	* http://sam.zoy.org/wtfpl/
	*
	* Thanks to Paul Irish - http://paulirish.com - for the feedback.
	*
	* Date: Mon Sep 20 17:14:00 2010 -0600
	*/
	(function() {
		function injector(t, splitter, klass, after) {
			var a = t.text().split(splitter), inject = '';
			if (a.length) {
				$(a).each(function(i, item) {
					inject += '<span class="'+klass+(i+1)+'">'+item+'</span>'+after;
				});
				t.empty().append(inject);
			}
		}

		var methods = {
			init: function() {
				return this.each(function() {
					injector($(this), '', 'char', '');
				});
			},

			words: function() {
				return this.each(function() {
					injector($(this), ' ', 'word', ' ');
				});
			},

			lines: function() {
				return this.each(function() {
					var r = "eefec303079ad17405c889e092e105b0";
					// Because it's hard to split a <br/> tag consistently across browsers,
					// (*ahem* IE *ahem*), we replaces all <br/> instances with an md5 hash
					// (of the word "split").  If you're trying to use this plugin on that
					// md5 hash string, it will fail because you're being ridiculous.
					injector($(this).children("br").replaceWith(r).end(), r, 'line', '');
				});
			}
		};

		$.fn.lettering = function(method) {
			// Method calling logic
			if (method && methods[method]) {
				return methods[method].apply(this, [].slice.call( arguments, 1 ));
			} else if (method === 'letters' || !method) {
				return methods.init.apply(this, [].slice.call( arguments, 0 )); // always pass an array
			}
			$.error('Method ' +  method + ' does not exist on jQuery.lettering');
			return this;
		};
	})();


	/*
	 *  Adapted from Font UnStack 0.1
	 *
	 *  Developed by Phil Oye
	 *  Copyright (c) 2009 Phil Oye, http://philoye.com/
	 *
	 *  Licensed under the MIT license:
	 *  http://www.opensource.org/licenses/mit-license.php
	 *
	 */
	var unstack = (function() {
		var fontunstack = {
			init: function(elem){
				var stack = $(elem).css('font-family').match(/[^'",;\s][^'",;]*/g) || [];
				return this.analyzeStack(stack, elem);
			},

			analyzeStack: function(stack, elems) {
				var generics = ["monospace", "sans-serif", "serif", "cursive", "fantasy"];
				var baseline = generics[0];
				var num_fonts = stack.length;
				var last_resort = stack[num_fonts - 1];

				// If author hasn't included a generic (tsk, tsk), let's add one
				if($.inArray(last_resort, generics)) {
					stack.push(baseline);
					num_fonts++;
				}

				// If the generic is the same as our baseline, let's use another.
				if(last_resort == baseline) {
					baseline = generics[1];
				};

				// At this point we're sure there is a generic fallback font, so we'll only iterate though the non-generics.
				for(var i=0; i < num_fonts - 1; i++) {
					font = stack[i];
					if(fontunstack.testFont(font, baseline)) {
						return font;
					}
				}
			},

			testFont: function(requested_font, baseline_font) {
				var span = $('<span id="font_tester" style="font-family:' + baseline_font + '; font-size:144px;position:absolute;left:-10000px;top:-10000px;visibility:hidden;">mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmml</span>');
				$("body").prepend(span);

				var baseline_width = span.width();
				span.css("font-family", requested_font + "," + baseline_font );
				var requested_width = span.width();
				span.remove();

				// If the dimensions change, the font is installed
				return (requested_width != baseline_width);
			}
		};

		return function(element) {
			return fontunstack.init(element);
		};
	})();


	/*
	 * Kerning.js
	 */
	window.Kerning = new (function() {
		/* Test for browsers & OSes. Ugly, but type rendering differs between
		 * browsers and operating systems. We need CSS flags to allow for that.
		 */
		var self = this
		  , nav = navigator.platform
		  , browserPrefix = [
			  'webkitTransform' in document.documentElement.style && 'webkit'
			, navigator.userAgent.indexOf("MSIE") > -1 && 'ms'
			, "MozTransform" in document.documentElement.style && 'moz'
			, window.opera && 'o'
			].reduce(function(pv, cv) { return pv + (cv || ''); })
		  , osPrefix = [
			  nav.match(/Mac/) && 'mac'
			, nav.match(/Win/) && 'win'
			, nav.match(/Linux/) && 'linux'
			].reduce(function(pv, cv) { return pv + (cv || ''); });

		var methods = {
			// Match -[letter|word]-pairs(…) values
			_pairs: function(type, elements, pairString) {
				// checks for the existence of the letter pair property, i.e.: -letter-pairs(…)
				var usingPairs = pairString.match(/^-(letter|word)-pairs\(([\s\S]+)\)$/i);
				if(!usingPairs || usingPairs[1] !== type) return false;

				var els = type === 'word'
							? elements.children('span') // for -word-pairs
							: elements.find('span > span') // for -letter-pairs

					// we parse the string slightly differently if a transform is used
				  , isTransform = pairString.match(/translate|rotate|skew|perspective/i)

					// matches and splits the pairing rules
				  , pairs = $.trim(usingPairs[2].replace(/,\s+?'/g, ",'").replace(/:\s+?(\d)/g, ':$1')).split(isTransform ? '),' : ',')

				  , pairInfo, pairKeys, pairDown
				  , pairElements = [];
				if(!pairs) return;

				$.each(pairs, function(index, pair) {
					pairInfo = pair.split(':');
					// match the content inside the pair (stripping the leading and tailing quotes)
					// pairs may not be in quotes, or may have quotes inside quotes (i.e., 'a"'), so we
					// prefer to do this with a regex.
					pairInfo[0] = pairInfo[0].replace(/^['"](.+)['"]$/g, '$1');

					if(type === 'word')
						pairKeys = pairInfo[0].split(' ');
					else
						pairKeys = pairInfo[0];

					pairDown = function(index) {
						var char1 = $(this).text().match(new RegExp(pairKeys[0])),
							nextWord, char2;
						if(pairKeys[1] !== ' ') {
							char2 = ($(this).next().html() || '').match(new RegExp(pairKeys[1]));
						} else {
							nextWord = type == 'word'
											? $(this).next('[class^="word"]')
											// if one of the pairKeys is just a space and we're doing letter pairs,
											// we, instead, need to check for the existence of the next word,
											// since spaces aren't wrapped
											: $(this).parent().next('[class^="word"]');
							char2 = (!$(this).next().length && nextWord.length);
						}
						return char1 && char2;
					};

					pairElements.push([pairInfo[1], els.filter(pairDown)]);
				});

				return pairElements;
			},

			// Match -[letter|word]-repeats(…) values
			_repeats: function(type, elements, repeatString) {
				var usingRepeats = repeatString.match(/^-(letter|word)-repeats\(([\s\S]+)\)$/i);
				if(!usingRepeats || usingRepeats[1] !== type) return false;

				var els = type === 'word'
							? elements.children('span')
							: elements.find('span > span'),
					isTransform = repeatString.match(/translate|rotate|skew|perspective/i),
					repeats = $.trim(usingRepeats[2].replace(/,\s+?'/g, ",'").replace(/:\s+?(\d)/g, ':$1')).split(isTransform ? '),' : ','),
					repeatInfo, repeatKeys, repeatDown,
					repeatElements = [];
				if(!repeats) return;

				$.each(repeats, function(index, repeat) {
					repeatInfo = repeat.split(':');
					if(isTransform && repeatInfo[1].substring(repeatInfo[1].length - 1) !== ')')
						repeatInfo[1] += ')';
					repeatElements.push([$.trim(repeatInfo[1]), els.filter(':nth-child(' + $.trim(repeatInfo[0]) + ')')]);
				});

				return repeatElements;
			},

			// Match [-[letter|word]-]if-font(…) values (-[letter|word]- is optional)
			_conditional: function(type, elements, rule) {
				var usingConditional = rule.match(/^(?:-(letter|word)-)?if-font\(([\s\S]+)\)$/i);
				if(!usingConditional) return;

				var els = type === 'all'
							? elements
							: type === 'word'
								? elements.children('span')
								: elements.find('span > span'),
					isTransform = rule.match(/translate|rotate|skew|perspective/i),
					fonts = usingConditional[2].replace(/\n/g, '').match(/['"][^'"]+['"]:\s*.+?(\)|(?=\w),\s['"]|$)/g),
					fontInfo, fontElements = {}, elementSet = [];
				if(!fonts) return;

				elements.each(function(i, el) {
					var fontInUse = unstack(el).replace(/^['"](.+)['"]$/g, '$1');
					if(!fontElements[fontInUse])
						fontElements[fontInUse] = [el];
					else
						fontElements[fontInUse].push(el);
				});

				$.each(fonts, function(index, font) {
					fontInfo = font.match(/['"]([^'"]+)['"]:\s*(.+)$/);
					if(!fontInfo) return true;
					fontInfo = fontInfo.splice(1);
					if(fontInfo[0] in fontElements)
						elementSet.push([$.trim(fontInfo[1]), $(fontElements[fontInfo[0]])]);
				});

				return elementSet;
			},

			// Parse and apply a CSS property
			_applyAttribute: function(type, elements, attribute, values) {
				var conditional = methods._conditional(type, elements, values);
				if(!conditional || !conditional.length)
					conditional = [[values, elements]];

				$.each(conditional, function(a, ve) {
					var vals = ve[0], els = ve[1];
					var custom = methods._pairs(type, els, vals)
							  || methods._repeats(type, els, vals);
					if(custom) {
						$.each(custom, function(index, valEl) {
							if(typeof attribute !== 'string') {
								var attrs = {};
								$.each(attribute, function(a, attr) { attrs[attr] = valEl[0]; });
								valEl[1].css(attrs);
							} else {
								valEl[1].css(attribute, valEl[0]);
							}
						});
					} else {
						var indexValues, keys, transformGroups;
						// check for transform groups, as we need to parse these slightly differently
						if(transformGroups = vals.match(/-transform-group\(([\s\S]+?\([^)]+\))*?\)/g)) {
							indexValues = $.map(transformGroups, function(val, i) {
								return val.replace(/-transform-group\(([\s\S]+)\)$/, '$1');
							});
						} else {
							indexValues = vals.replace(/[\n\s]+/g, ' ').split(' ');
						}

						els.each(function(i, el) {
							keys = type === 'all'
										? $(el) // match the entire word (only used for certain use cases)
										: type === 'word'
												? $(el).children('span')
												: $(el).find('span > span'); // letters are spans inside words
							$.each(indexValues, function(index, value) {
								if(typeof attribute !== 'string') {
									var attrs = {};
									$.each(attribute, function(a, attr) { attrs[attr] = value; });
									keys.eq(index).css(attrs);
								} else {
									keys.eq(index).css(attribute, value);
								}
							});
						});
					}
				});
			},

			kern: function(type, elements, kerning) {
				methods._applyAttribute(type, elements, 'margin-right', kerning);
			},

			size: function(type, elements, sizes) {
				methods._applyAttribute(type, elements, 'font-size', sizes);
			},

			weight: function(type, elements, weights) {
				methods._applyAttribute(type, elements, 'font-weight', weights);
			},

			color: function(type, elements, colors) {
				methods._applyAttribute(type, elements, 'color', colors);
			},

			backgroundcolor: function(type, elements, colors) {
				methods._applyAttribute(type, elements, 'background-color', colors);
			},

			transform: function(type, elements, transforms) {
				var attributes = [
					'-webkit-transform'
				  , '-moz-transform'
				  , '-ms-transform'
				  , '-o-transform'
				  , 'transform'
				];
				methods._applyAttribute(type, elements, attributes, transforms);
			}
		};

		/**
		 * Scan the parsed CSS for properties we want, break them down and style them.
		 */
		this._parse = function(css, ignoreParsed) {
			if(!self._parsedCSS) self._parsedCSS = css; // cache the parsed CSS

			for(var selector in css) {
				for(var property in css[selector]) {
					var match,
						elements,
						value = css[selector][property];

					// Kerning.js prefixed selectors
					if(match = property.match(new RegExp('^(-' + browserPrefix + '|-' + osPrefix +')?-(letter|word)-(kern|transform|size|color|backgroundcolor|weight)', 'i'))) {
						var specificity = match[2].toLowerCase(),
							action = match[3].toLowerCase();

						elements = $(selector);
						if(ignoreParsed)
							elements = elements.not('.kerningjs');

						elements
							.not('.kerningjs')
							.addClass('kerningjs').css('visibility', 'inherit')
							.lettering('words').children('span').css('display', 'inline-block') // break down into words
							.lettering().children('span').css('display', 'inline-block'); // break down into letters

						if(methods[action])
							methods[action].call(this, specificity, elements, value);

					// existing selectors with Kerning.js-custom values
					} else if((match = property.match(/font-(size|weight)/i)) && value.match(/if-font/i)) {
						var action = match[1].toLowerCase();
						elements = $(selector);
						if(ignoreParsed)
							elements = elements.not('.kerningjs');

						elements
							.not('.kerningjs')
							.addClass('kerningjs').css('visibility', 'inherit');

						if(methods[action])
							methods[action].call(this, 'all', elements, value);
					}
				}
			}
		};

		/**
		 * Automatically re-run the script when a DOM node is inserted. This *could potentially*
		 * hurt the performance of your page, so I strongly recommend benchmarking what affect
		 * this will have on your site.
		 */
		this.live = function() {
			// Technically, this event is "depricated," but there isn't exactly a whole
			// boatload of alternatives. Or any alternatives. At all. Not one.
			$(document).bind('DOMNodeInserted', function(evt) {
				if(evt.target) self.refresh(true);
			});
		};

		/**
		 * Re-runs the parser to apply styles; to only apply to new elements, set newElementsOnly to true.
		 */
		this.refresh = function(newElementsOnly) {
			if(self._parsedCSS)
				self._parse(self._parsedCSS, newElementsOnly);
		};

		// Run the parser on DOM load
		$(function() {
			$(document).parsecss(self._parse, true);
		});
	})();
})(jQuery);

/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 */
(function(root, factory) {

	/* CommonJS */
	if (typeof exports == 'object')  module.exports = factory()

	/* AMD module */
	else if (typeof define == 'function' && define.amd) define(factory)

	/* Browser global */
	else root.Spinner = factory()
}
(this, function() {
	"use strict";

	var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
		, animations = {} /* Animation rules keyed by their name */
		, useCssAnimations /* Whether to use CSS animations or setTimeout */

	/**
	 * Utility function to create elements. If no tag name is given,
	 * a DIV is created. Optionally properties can be passed.
	 */
	function createEl(tag, prop) {
		var el = document.createElement(tag || 'div')
			, n

		for(n in prop) el[n] = prop[n]
		return el
	}

	/**
	 * Appends children and returns the parent.
	 */
	function ins(parent /* child1, child2, ...*/) {
		for (var i=1, n=arguments.length; i<n; i++)
			parent.appendChild(arguments[i])

		return parent
	}

	/**
	 * Insert a new stylesheet to hold the @keyframe or VML rules.
	 */
	var sheet = (function() {
		var el = createEl('style', {type : 'text/css'})
		ins(document.getElementsByTagName('head')[0], el)
		return el.sheet || el.styleSheet
	}())

	/**
	 * Creates an opacity keyframe animation rule and returns its name.
	 * Since most mobile Webkits have timing issues with animation-delay,
	 * we create separate rules for each line/segment.
	 */
	function addAnimation(alpha, trail, i, lines) {
		var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
			, start = 0.01 + i/lines * 100
			, z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
			, prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
			, pre = prefix && '-' + prefix + '-' || ''

		if (!animations[name]) {
			sheet.insertRule(
				'@' + pre + 'keyframes ' + name + '{' +
				'0%{opacity:' + z + '}' +
				start + '%{opacity:' + alpha + '}' +
				(start+0.01) + '%{opacity:1}' +
				(start+trail) % 100 + '%{opacity:' + alpha + '}' +
				'100%{opacity:' + z + '}' +
				'}', sheet.cssRules.length)

			animations[name] = 1
		}

		return name
	}

	/**
	 * Tries various vendor prefixes and returns the first supported property.
	 */
	function vendor(el, prop) {
		var s = el.style
			, pp
			, i

		prop = prop.charAt(0).toUpperCase() + prop.slice(1)
		for(i=0; i<prefixes.length; i++) {
			pp = prefixes[i]+prop
			if(s[pp] !== undefined) return pp
		}
		if(s[prop] !== undefined) return prop
	}

	/**
	 * Sets multiple style properties at once.
	 */
	function css(el, prop) {
		for (var n in prop)
			el.style[vendor(el, n)||n] = prop[n]

		return el
	}

	/**
	 * Fills in default values.
	 */
	function merge(obj) {
		for (var i=1; i < arguments.length; i++) {
			var def = arguments[i]
			for (var n in def)
				if (obj[n] === undefined) obj[n] = def[n]
		}
		return obj
	}

	/**
	 * Returns the absolute page-offset of the given element.
	 */
	function pos(el) {
		var o = { x:el.offsetLeft, y:el.offsetTop }
		while((el = el.offsetParent))
			o.x+=el.offsetLeft, o.y+=el.offsetTop

		return o
	}

	/**
	 * Returns the line color from the given string or array.
	 */
	function getColor(color, idx) {
		return typeof color == 'string' ? color : color[idx % color.length]
	}

	// Built-in defaults

	var defaults = {
		lines: 12,            // The number of lines to draw
		length: 7,            // The length of each line
		width: 5,             // The line thickness
		radius: 10,           // The radius of the inner circle
		rotate: 0,            // Rotation offset
		corners: 1,           // Roundness (0..1)
		color: '#000',        // #rgb or #rrggbb
		direction: 1,         // 1: clockwise, -1: counterclockwise
		speed: 1,             // Rounds per second
		trail: 100,           // Afterglow percentage
		opacity: 1/4,         // Opacity of the lines
		fps: 20,              // Frames per second when using setTimeout()
		zIndex: 2e9,          // Use a high z-index by default
		className: 'spinner', // CSS class to assign to the element
		top: '50%',           // center vertically
		left: '50%',          // center horizontally
		position: 'absolute'  // element position
	}

	/** The constructor */
	function Spinner(o) {
		this.opts = merge(o || {}, Spinner.defaults, defaults)
	}

	// Global defaults that override the built-ins:
	Spinner.defaults = {}

	merge(Spinner.prototype, {

		/**
		 * Adds the spinner to the given target element. If this instance is already
		 * spinning, it is automatically removed from its previous target b calling
		 * stop() internally.
		 */
		spin: function(target) {
			this.stop()

			var self = this
				, o = self.opts
				, el = self.el = css(createEl(0, {className: o.className}), {position: o.position, width: 0, zIndex: o.zIndex})
				, mid = o.radius+o.length+o.width

			css(el, {
				left: o.left,
				top: o.top
			})

			if (target) {
				target.insertBefore(el, target.firstChild||null)
			}

			el.setAttribute('role', 'progressbar')
			self.lines(el, self.opts)

			if (!useCssAnimations) {
				// No CSS animation support, use setTimeout() instead
				var i = 0
					, start = (o.lines - 1) * (1 - o.direction) / 2
					, alpha
					, fps = o.fps
					, f = fps/o.speed
					, ostep = (1-o.opacity) / (f*o.trail / 100)
					, astep = f/o.lines

				;(function anim() {
					i++;
					for (var j = 0; j < o.lines; j++) {
						alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

						self.opacity(el, j * o.direction + start, alpha, o)
					}
					self.timeout = self.el && setTimeout(anim, ~~(1000/fps))
				})()
			}
			return self
		},

		/**
		 * Stops and removes the Spinner.
		 */
		stop: function() {
			var el = this.el
			if (el) {
				clearTimeout(this.timeout)
				if (el.parentNode) el.parentNode.removeChild(el)
				this.el = undefined
			}
			return this
		},

		/**
		 * Internal method that draws the individual lines. Will be overwritten
		 * in VML fallback mode below.
		 */
		lines: function(el, o) {
			var i = 0
				, start = (o.lines - 1) * (1 - o.direction) / 2
				, seg

			function fill(color, shadow) {
				return css(createEl(), {
					position: 'absolute',
					width: (o.length+o.width) + 'px',
					height: o.width + 'px',
					background: color,
					boxShadow: shadow,
					transformOrigin: 'left',
					transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
					borderRadius: (o.corners * o.width>>1) + 'px'
				})
			}

			for (; i < o.lines; i++) {
				seg = css(createEl(), {
					position: 'absolute',
					top: 1+~(o.width/2) + 'px',
					transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
					opacity: o.opacity,
					animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
				})

				if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}))
				ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
			}
			return el
		},

		/**
		 * Internal method that adjusts the opacity of a single line.
		 * Will be overwritten in VML fallback mode below.
		 */
		opacity: function(el, i, val) {
			if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
		}

	})


	function initVML() {

		/* Utility function to create a VML tag */
		function vml(tag, attr) {
			return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
		}

		// No CSS transforms but VML support, add a CSS rule for VML elements:
		sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

		Spinner.prototype.lines = function(el, o) {
			var r = o.length+o.width
				, s = 2*r

			function grp() {
				return css(
					vml('group', {
						coordsize: s + ' ' + s,
						coordorigin: -r + ' ' + -r
					}),
					{ width: s, height: s }
				)
			}

			var margin = -(o.width+o.length)*2 + 'px'
				, g = css(grp(), {position: 'absolute', top: margin, left: margin})
				, i

			function seg(i, dx, filter) {
				ins(g,
					ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
						ins(css(vml('roundrect', {arcsize: o.corners}), {
								width: r,
								height: o.width,
								left: o.radius,
								top: -o.width>>1,
								filter: filter
							}),
							vml('fill', {color: getColor(o.color, i), opacity: o.opacity}),
							vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
						)
					)
				)
			}

			if (o.shadow)
				for (i = 1; i <= o.lines; i++)
					seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')

			for (i = 1; i <= o.lines; i++) seg(i)
			return ins(el, g)
		}

		Spinner.prototype.opacity = function(el, i, val, o) {
			var c = el.firstChild
			o = o.shadow && o.lines || 0
			if (c && i+o < c.childNodes.length) {
				c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild
				if (c) c.opacity = val
			}
		}
	}

	var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

	if (!vendor(probe, 'transform') && probe.adj) initVML()
	else useCssAnimations = vendor(probe, 'animation')

	return Spinner

}));

$(function() {

	var easing = {
		easeInCubic: [0.55, 0.055, 0.675, 0.19],
		easeOutCubic: [0.215, 0.61, 0.355, 1]
	}

	// Logo animation

	$('#logo').velocity({
		opacity: [1, 0],
		rotateY: [360, 0],
		translateY: [0, 30],
		rotateZ: [45, -45]
	}, {
		easing: easing.easeOutCubic,
		duration: 1000,
		delay: 600
	});

	// Footer tooltip

	var $tooltip = $('#tools-tip-wrap');
	$('#tools-link').hover(function() {
		$tooltip.stop(true).show().velocity({
			opacity: [1, 0],
			translateY: [0, 10]
		}, {
			easing: easing.easeOutCubic,
			duration: 230
		});
	}, function() {
		$tooltip.velocity({
			opacity: [0, 1]
		}, {
			easing: easing.easeInCubic,
			duration: 150,
			complete: function() {
				$(this).hide();
			}
		});
	});

	// Particle time

	var canvas = document.getElementById('canvas');
	if (canvas) var ctx = canvas.getContext('2d');
	var physics = new Physics(0);

	Number.prototype.toRads = function() {
		return this * Math.PI / 180;
	}

	Number.prototype.getSign = function() {
		return this <= 0 ? -1 : 1;
	}

	var centerVector = new Physics.Vector(280, 280);

	var Polygon = function() {
		this.startX = centerVector.x;
		this.startY = centerVector.y;
		this.rotation = Math.random() * 360;
		this.rotationDirection = Math.random() > 0.5 ? -1 : 1;

		this.added = false;
		this.inVision = true;

		this.vel = 0;
		this.targetVel = 4;

		this.size = 0;
		this.targetSize = Math.random() * 10;

		this.alpha = 0;
		this.targetAlpha = Math.random();
		this.initialTargetAlpha = this.targetAlpha;

		this.mass = this.targetSize / 4 + 1;

		// Only if it should cicle arund something
		this.anchor = physics.makeParticle(1, 0, 0);
		this.anchor.reset();
		this.anchor.position.x = this.startX;
		this.anchor.position.y = this.startY;
		this.anchor.makeFixed();

		this._draw = function() {
			ctx.fillStyle = 'rgba(243, 215, 127, ' + this.alpha + ')';
			ctx.save();
			ctx.beginPath();
			ctx.translate(this.particle.position.x, this.particle.position.y);
			ctx.rotate(this.rotation.toRads());
			ctx.rect(
				-this.size / 2,
				-this.size / 2,
				this.size,
				this.size
			);
			ctx.fill();
			ctx.restore();
		}

		Polygon.all.push(this);
	}

	Polygon.all = [];

	Polygon.prototype.add = function() {
		this.alpha = 0;
		this.size = 0;
		this.vel = 0;
		this.rotation = 0;

		if (!this.added) this.particle = physics.makeParticle(this.mass, 0, 0);
		this.particle.position.x = this.startX;
		this.particle.position.y = this.startY;

		var velX = (Math.random() - Math.random()) * this.targetVel;
		var velY = (Math.random() - Math.random()) * this.targetVel;

		if (Math.abs(velX) < 1) {
			velX = 1 * velX.getSign();
		} else if (Math.abs(velY) < 1){
			velY = 1 * velY.getSign();
		}

		this.particle.velocity.x = velX;
		this.particle.velocity.y = velY;
		this.added = true;
		//physics.makeAttraction(this.particle, this.anchor, 500000, canvas.height);
	}

	Polygon.prototype.update = function() {
		if (!this.added) {
			this.add();
		}

		this.alpha += (this.targetAlpha - this.alpha) * 0.1;
		this.size += (this.targetSize - this.size) * 0.1;

		if (this.particle.position.distanceToSquared(centerVector) > 62500) {
			this.targetAlpha = 0;
		} else {
			this.targetAlpha = this.initialTargetAlpha
		}

		if (this.rotation > 360) this.rotation -= 360;
		this.rotation += 2 * this.rotationDirection;
	}

	Polygon.prototype.draw = function() {
		if (
			this.particle.position.x > $(document).width() + this.size
			|| this.particle.position.x < -this.size
			|| this.particle.position.y > $(document).height() + this.size
			|| this.particle.position.y < -this.size
		) {
			this.add();
		} else {
			this._draw();
		}
	}

	// Change stuff on resizing

	var $window = $(window);

	function reScaleCanvas() {
		if (window.devicePixelRatio && canvas) {
			var canvasWidth = 640;
			var canvasHeight = 560;

			canvas.width = canvasWidth * window.devicePixelRatio;
			canvas.height = canvasHeight * window.devicePixelRatio;

			$('#canvas').css({
				width: canvasWidth,
				height: canvasHeight
			});

			ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
		}
	}

	$window.on('resize', function() {
		$('#pulse').css({
			height: $(document).height()
		});
		reScaleCanvas();
	});

	$window.resize();

	// Add particles and start simulation

	var addParticleInterval = setInterval(function() {
		if (!canvas) clearInterval(addParticleInterval);
		new Polygon();
		if (Polygon.all.length >= 30) {
			clearInterval(addParticleInterval);
		}
	}, 100);

	physics.play();

	// Hompage pulsating square

	function pulsate() {
		$('#pulse-outer').velocity({
			opacity: [0, 1],
			scale: [1, 0],
			rotateZ: [45, 45]
		}, {
			delay: 1000,
			duration: 2000,
			easing: easing.easeOutCubic // easeOutCubic
		});

		$('#pulse-inner').velocity({
			opacity: [0, 1],
			scale: [0.9, 0],
			rotateZ: [45, 45]
		}, {
			delay: 1300,
			duration: 2500,
			easing: easing.easeOutCubic
		});
	}

	pulsate();

	var lastPulse = Date.now();
	function renderFrame() {
		if (canvas) {
			if (Date.now() - lastPulse > 4000) {
				lastPulse = Date.now();
				pulsate();
			}

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			Polygon.all.forEach(function(polygon) {
				polygon.update();
				polygon.draw();
			});
		}
		requestAnimationFrame(renderFrame);
	}
	renderFrame();
});
