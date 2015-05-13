$(function() {
	window.mobilecheck = function() {
		var check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	}
	var retina = window.devicePixelRatio > 1;
	var canvas = document.getElementById('mesh');
	if (!canvas) return;

	var ctx = canvas.getContext('2d');
	var T = 0;

	var currentMousePos = { x: 0, y: 0 };

	/*
	var $me = $('#mesh');
	$me.on('mousemove', function(e) {
		currentMousePos.x = e.pageX - $me.offset().left;
		currentMousePos.y = e.pageY - $me.offset().top;
	}); */

	var Dot =  function(posX, posY, x, y) {
		this.POS_X = posX;
		this.POS_Y = posY;
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
		var distance = Math.sqrt(Math.pow(middleX - this.x, 2) + Math.pow(middleY - this.y, 2)) / 2.5;
		var sinValue = Math.sin(-distance + T);

		this.radius = retina ? (sinValue + 1) / 4 : (sinValue + 1) / 2;
		this.posY = - sinValue * 4 + this.POS_Y;
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

	var DOTS_TOTAL_X = 54;
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

	var incrementValue = (window.mobilecheck()) ? 0.1 : 0.06;

	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		T += incrementValue;
		Dot.all.forEach(function(dot) {
			dot.update();
			dot.draw();
		});
		if (T >= 4 * Math.PI) {
			T = 0;
		}
		requestAnimationFrame(render);
	}
	render();
});
