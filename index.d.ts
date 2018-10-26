declare module 'transcroll' {
	let transcroll: (target: Window | Element | number | string, args?: {
		el?: Window | Element,
		offset?: number,
		axis?: 'x' | 'y',
		duration?: number,
		easing?: string | ((x: number) => number),
		jump?: false | number,
		interrupt?: boolean
	}) => Promise<{ interrupted: boolean, jumped: boolean }>;
	export default transcroll;
}