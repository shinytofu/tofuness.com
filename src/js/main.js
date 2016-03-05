$(function() {
	var easing = {
		easeInCubic: [0.55, 0.055, 0.675, 0.19],
		easeOutCubic: [0.215, 0.61, 0.355, 1]
	};

	// Logo animation

	$('#logo').velocity({
		opacity: [1, 0],
		rotateY: [360, 0],
		translateY: [0, 30],
		rotateZ: [45, -45]
	}, {
		easing: easing.easeOutCubic,
		duration: $('#logo').data('animate') === true ? 1000 : 0,
		delay: $('#logo').data('animate') === true ? 600 : 0
	});

	// Slides
	var slidePaths = ['hearthstone', 'league', 'other'];
	var currentPath = window.location.pathname.replace('/games/', '');
	var currentIndex =  currentPath !== '/games' ? slidePaths.indexOf(currentPath) : 1;

	function setSlide(index) {
		if (index < 0 || index > $('.me-slide').length - 1) return false;

		var $slide = $('.me-slide').eq(index);
		var $dot = $('.me-slide-nav-dot').eq(index);

		currentIndex = index;

		$('.me-slide').removeClass('active');
		$slide.addClass('active');

		$('.me-slide-nav-dot').removeClass('active');
		$dot.addClass('active');

		$('#me-slide-wrap').stop().velocity({
			marginLeft: index * -$('.me-slide').eq(index).outerWidth(),
			height: $('.me-slide-content').eq(index).height()
		}, {
			easing: easing.easeOutCubic,
			duration: 300
		});

		if (window.history) {
			window.history.replaceState({
				currentSlide: currentIndex
			}, document.title, '/games/' + slidePaths[index]);
		}
	}

	Mousetrap.bind('right', function(){
		setSlide(currentIndex + 1);
	});
	Mousetrap.bind('left', function(){
		setSlide(currentIndex - 1);
	});

	$('.me-slide, .me-slide-nav-dot').on('click', function() {
		setSlide($(this).index());
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

	$('.tools-icon').imgpreload();

	// Change stuff on resizing

	var $window = $(window);

	$window.on('resize', function() {
		// Re-position slider
		setSlide(currentIndex);
	});

	$window.resize();
});
