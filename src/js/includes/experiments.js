$(function() {
	var canvas = document.getElementById('mesh');
	if (!canvas) return;

	var ctx = canvas.getContext('2d');
	var T = 0;

	var currentMousePos = { x: 0, y: 0 };
	var $window = $(window);
	/*
	var $me = $('#mesh');
	$me.on('mousemove', function(e) {
		currentMousePos.x = e.pageX - $me.offset().left;
		currentMousePos.y = e.pageY - $me.offset().top;
	}); */

	var Dot =  function(posX, posY, x, y) {
		this.posX = posX;
		this.posY = posY;
		this.x = x;
		this.y = y;
		this.added = false;
		this.alpha = 0;
		this.targetAlpha = 1;
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

		var middleX = DOTS_TOTAL_X / 2 - 1;
		var middleY = DOTS_TOTAL_Y / 2 - 1;
		var distance = Math.sqrt(Math.pow(middleX - this.x, 2) + Math.pow(middleY - this.y, 2)) / 2;
		var sinValue = Math.sin(-distance + T);

		this.radius = (sinValue + 2) * 0.5;
		this.posY += sinValue / 2;
		this.alpha += (this.targetAlpha - this.alpha) * 0.05;
	}

	Dot.prototype.draw = function() {
		this._draw();
	}

	Dot.all = [];

	function reScaleCanvas() {
		if (window.devicePixelRatio && canvas) {
			var canvasWidth = 640;
			var canvasHeight = 320;

			canvas.width = canvasWidth * window.devicePixelRatio;
			canvas.height = canvasHeight * window.devicePixelRatio;

			$(canvas).css({
				width: canvasWidth,
				height: canvasHeight
			});

			ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
		}
	}

	reScaleCanvas();

	var DOTS_TOTAL_X = 31;
	var DOTS_TOTAL_Y = DOTS_TOTAL_X * canvas.height / canvas.width;

	function initDots() {
		for (var ix = 0; ix < DOTS_TOTAL_X; ix++) {
			for (var iy = 0; iy < DOTS_TOTAL_Y; iy++) {
				new Dot(
					ix / DOTS_TOTAL_X * $(canvas).width(),
					iy / DOTS_TOTAL_Y * $(canvas).height(),
					ix, iy
				);
			}
		}
	}

	initDots();

	var incrementValue = 0.08;

	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		T += incrementValue;
		Dot.all.forEach(function(dot) {
			dot.update();
			dot.draw();
		});
		if (T >= 2 * Math.PI) {
			T = 0;
		}
		requestAnimationFrame(render);
	}
	render();
});
