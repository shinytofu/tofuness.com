$(function() {
	var canvas = document.getElementById('mesh');
	if (canvas) var ctx = canvas.getContext('2d');

	var T = 0;

	var currentMousePos = { x: 0, y: 0 };
	var $window = $(window);
	$window.on('mousemove', function(e) {
		currentMousePos.x = e.pageX;
		currentMousePos.y = e.pageY;
	});

	var Dot =  function(posX, posY, x, y) {
		this.posX = posX;
		this.posY = posY;
		this.x = x;
		this.y = y;
		this.added = false;
		this.alpha = 0;
		this.radius = 0;

		this._draw = function() {
			ctx.fillStyle = 'rgba(255, 255, 255, ' + this.alpha + ')';
			ctx.save();
			ctx.beginPath();
			ctx.translate(this.posX, this.posY);
			ctx.ellipse(
				-this.radius / 2,
				-this.radius / 2,
				this.radius,
				this.radius,
				0, 0, Math.PI * 2
			);
			ctx.fill();
			ctx.restore();
		}

		Dot.all.push(this);
	}

	Dot.prototype.add = function() {
		this.added = true;
	}

	Dot.prototype.update = function() {
		if (!this.added) this.add();

		var middle = DOTS_TOTAL / 4 - 0.5;
		var mouseX = currentMousePos.x / $window.width() * DOTS_TOTAL;
		var mouseY = currentMousePos.y / $window.height() * DOTS_TOTAL / 2 - 0.5;
		var distance = Math.sqrt(Math.pow(middle - this.x, 2) + Math.pow(middle - this.y, 2)) / 2;

		//var newVal = Math.sin((this.x * this.y / 5 + T) * 0.3) + 1;
		//this.radius = Math.sin(this.x + T) + 1 + Math.sin(this.y + T) + 1;
		this.radius = Math.sin(-distance + T) + 1.5;
		this.posY += Math.sin(-distance + T) / 2;
		this.alpha = Math.sin(-distance + T) + 2;
	}

	Dot.prototype.draw = function() {
		this._draw();
	}

	Dot.all = [];

	function reScaleCanvas() {
		if (window.devicePixelRatio && canvas) {
			var canvasWidth = $(window).width();
			var canvasHeight = $(window).height();

			canvas.width = canvasWidth * window.devicePixelRatio;
			canvas.height = canvasHeight * window.devicePixelRatio;

			$('#mesh').css({
				width: canvasWidth,
				height: canvasHeight
			});

			ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
		}
	}

	if (canvas) reScaleCanvas();

	var DOTS_TOTAL = 60;

	function initDots() {
		if (!canvas) return false;
		for (var ix = 0; ix < DOTS_TOTAL; ix++) {
			for (var iy = 0; iy < DOTS_TOTAL; iy++) {
				new Dot(
					ix / DOTS_TOTAL * canvas.height + 10,
					iy / DOTS_TOTAL * canvas.height + 10,
					ix, iy
				);
			}
		}
	}

	initDots();

	var incrementValue = 0.5;

	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		Dot.all.forEach(function(dot) {
			dot.update();
			dot.draw();
		});
		T += incrementValue;
		requestAnimationFrame(render);
	}

	if (canvas) render();
});
