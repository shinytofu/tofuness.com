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

	// Change stuff on resizing

	var $window = $(window);

	$window.on('resize', function() {
		$('#pulse').css({
			height: $(document).height()
		});
	});

	$window.resize();

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
			easing: easing.easeOutCubic,
			complete: pulsate
		});
	}

	if ($('#pulse')) {
		pulsate();
	}
});
