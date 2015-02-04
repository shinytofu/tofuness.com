$(function() {
	var $window = $(window);

	function pulsate() {
		$('#pulse-outer').velocity({
			opacity: [0, 1],
			scale: [1.2, 0],
			rotateZ: [45, 45]
		}, {
			delay: 1000,
			duration: 2000,
			easing: [0.215, 0.61, 0.355, 1]
		});

		$('#pulse-inner').velocity({
			opacity: [0, 1],
			scale: [1.2, 0],
			rotateZ: [45, 45]
		}, {
			delay: 1300,
			duration: 2500,
			easing: [0.215, 0.61, 0.355, 1],
			complete: pulsate
		});
	}

	pulsate();
});
