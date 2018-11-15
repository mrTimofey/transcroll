declare module 'transcroll' {
	type easeFn = (arg: number) => number;
	type easeName = 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic' |
		'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart' | 'easeInQuint' | 'easeOutQuint' | 'easeInOutQuint';
	let transcroll: (target: Window | Element | number | string, args?: {
		el?: Window | Element,
		offset?: number,
		axis?: 'x' | 'y',
		duration?: number,
		easing?: easeName | easeFn,
		jump?: false | number,
		interrupt?: boolean
	}) => Promise<{ interrupted: boolean, jumped: boolean }>;
	export default transcroll;
	export let easings: { [name in easeName]: easeFn };
}
