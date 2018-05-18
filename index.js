var easings = {
	linear: function (t) { return t; },
	easeInQuad: function (t) { return t * t; },
	easeOutQuad: function (t) { return t * (2 - t); },
	easeInOutQuad: function (t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
	easeInCubic: function (t) { return t * t * t; },
	easeOutCubic: function (t) { return (--t) * t * t + 1; },
	easeInOutCubic: function (t) { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; },
	easeInQuart: function (t) { return t * t * t * t; },
	easeOutQuart: function (t) { return 1 - (--t) * t * t * t; },
	easeInOutQuart: function (t) { return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t; },
	easeInQuint: function (t) { return t * t * t * t * t; },
	easeOutQuint: function (t) { return 1 + (--t) * t * t * t * t; },
	easeInOutQuint: function (t) { return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t; }
};

/**
 * Animate scrolling.
 * @param {Element|number|string} target target DOM element, scroll position or selector string
 * @param {Element|Window} el container element. Default: window
 * @param {number} duration animation duration in ms. Default: 200
 * @param {function|string} easing easing function or function name
 * @param {number|boolean} jump jump factor or false, used to "jump" to nearer position before starting animation.
 * 		This coefficient will be multiplied to a duration to determine a reasonable positions difference.
 * 		Default: 0.5
 * 		Set to false to disable.
 * @param {boolean} interrupt immediately stop animation if user uses a mousewheel. Default: true
 * @returns {Promise<{ interrupted: boolean, jumped: boolean }>} promise resolving on animation end
 */
function transcroll(target, ref) {
	if ( ref === void 0 ) ref = {};
	var el = ref.el; if ( el === void 0 ) el = window;
	var duration = ref.duration; if ( duration === void 0 ) duration = 200;
	var easing = ref.easing; if ( easing === void 0 ) easing = easings.easeInQuad;
	var jump = ref.jump; if ( jump === void 0 ) jump = 0.5;
	var interrupt = ref.interrupt; if ( interrupt === void 0 ) interrupt = true;

	function getPosition() {
		return el === window ? window.pageYOffset : el.scrollTop;
	}
	function setPosition(v) {
		if (el === window) { window.scroll(0, v); }
		else { el.scrollTop = v; }
	}
	function maxPosition() {
		var element = el === window ? window.document.documentElement : el;
		return element.scrollHeight - element.clientHeight;
	}
	function select(selector) {
		return (el === window ? window.document : el).querySelector(selector);
	}
	function getPageOffset(element) {
		if (element === undefined) { element = el; }
		if (element === window) { return 0; }
		var top = 0,
			_el = element;
		do {
			top += _el.offsetTop;
		}
		while(_el = _el.offsetParent);
		return top;
	}
	var targetPosition = Math.min(
		typeof target === 'number' && target ||
		typeof target === 'string' && (getPageOffset(select(target)) - getPageOffset()) ||
		target instanceof Element && (getPageOffset(target) - getPageOffset()),
		maxPosition()
	);

	var data = {
		interrupted: false,
		jumped: false
	};

	if (!('requestAnimationFrame' in window)) {
		setPosition(targetPosition);
		return Promise.resolve(data);
	}

	var startPosition = getPosition(),
		positionDiff = startPosition - targetPosition,
		startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

	if (jump && Math.abs(positionDiff) / duration > jump) {
		setPosition(targetPosition + duration * jump * (positionDiff > 0 ? 1 : -1));
		startPosition = getPosition();
		data.jumped = true;
	}

	if (typeof easing === 'string') { easing = easings[easing]; }

	return new Promise(function (resolve) {
		function stop(e) {
			if (e) { data.interrupted = true; }
			el.removeEventListener('mousewheel', stop);
			resolve(data);
		}
		if (interrupt) { el.addEventListener('mousewheel', stop); }
		(function scroll() {
			if (data.interrupted) { return; }
			var now = 'now' in window.performance ? performance.now() : new Date().getTime(),
				time = Math.min(1, ((now - startTime) / duration)),
				fn = easing(time);
			setPosition(fn * (targetPosition - startPosition) + startPosition);
			if (time === 1) { stop(); }
			else { requestAnimationFrame(scroll); }
		})();
	});
}

module.exports = transcroll;
module.exports.easings = easings;
