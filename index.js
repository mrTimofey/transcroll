export const easings = {
	linear: t => t,
	easeInQuad: t => t * t,
	easeOutQuad: t => t * (2 - t),
	easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
	easeInCubic: t => t * t * t,
	easeOutCubic: t => (--t) * t * t + 1,
	easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
	easeInQuart: t => t * t * t * t,
	easeOutQuart: t => 1 - (--t) * t * t * t,
	easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
	easeInQuint: t => t * t * t * t * t,
	easeOutQuint: t => 1 + (--t) * t * t * t * t,
	easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
};

/**
 * Animate scrolling.
 * @param {Element|number|string} target target DOM element, scroll position or selector string
 * @param {Element|Window} el container element. Default: window
 * @param {string} axis 'x' or 'y' axis
 * @param {number} duration animation duration in ms. Default: 200
 * @param {function|string} easing easing function or function name
 * @param {number|boolean} jump jump factor or false, used to "jump" to nearer position before starting animation.
 * 		This coefficient will be multiplied to a duration to determine a reasonable positions difference.
 * 		Default: 0.5
 * 		Set to false to disable.
 * @param {boolean} interrupt immediately stop animation if user uses a mousewheel. Default: true
 * @returns {Promise<{ interrupted: boolean, jumped: boolean }>} promise resolving on animation end
 */
export default (target, { el = window, axis = 'y', duration = 200, easing = easings.easeInQuad, jump = 0.5, interrupt = true } = {}) => {
	function getPosition() {
		return el === window ? window.pageYOffset : el.scrollTop;
	}
	function setPosition(v) {
		if (el === window) window.scroll(0, v);
		else el.scrollTop = v;
	}
	function maxPosition() {
		const element = el === window ? window.document.documentElement : el;
		return element.scrollHeight - element.clientHeight;
	}
	function select(selector) {
		return (el === window ? window.document : el).querySelector(selector);
	}
	function getPageOffset(element) {
		if (element === undefined) element = el;
		if (element === window) return 0;
		let top = 0,
			_el = element;
		do {
			top += _el.offsetTop;
		}
		while(_el = _el.offsetParent);
		return top;
	}
	const targetPosition = Math.min(
		typeof target === 'number' && target ||
		typeof target === 'string' && (getPageOffset(select(target)) - getPageOffset()) ||
		target instanceof Element && (getPageOffset(target) - getPageOffset()),
		maxPosition()
	);

	const data = {
		interrupted: false,
		jumped: false
	};

	if (!('requestAnimationFrame' in window)) {
		setPosition(targetPosition);
		return Promise.resolve(data);
	}

	let startPosition = getPosition(),
		positionDiff = startPosition - targetPosition,
		startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

	if (jump && Math.abs(positionDiff) / duration > jump) {
		setPosition(targetPosition + duration * jump * (positionDiff > 0 ? 1 : -1));
		startPosition = getPosition();
		data.jumped = true;
	}

	if (typeof easing === 'string') easing = easings[easing];

	return new Promise(resolve => {
		function stop(e) {
			if (e) data.interrupted = true;
			el.removeEventListener('mousewheel', stop);
			resolve(data);
		}
		if (interrupt) el.addEventListener('mousewheel', stop);
		(function scroll() {
			if (data.interrupted) return;
			const now = 'now' in window.performance ? performance.now() : new Date().getTime(),
				time = Math.min(1, ((now - startTime) / duration)),
				fn = easing(time);
			setPosition(fn * (targetPosition - startPosition) + startPosition);
			if (time === 1) stop();
			else requestAnimationFrame(scroll);
		})();
	});
};