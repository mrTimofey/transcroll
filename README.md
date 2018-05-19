# Transcroll

Animate scroll in a flexible, user-friendly, simple and modern way.

Install with `npm i transcroll`.

Usage:

```javascript
import transcroll, { easings } from './index';

// animate to an element
transcroll(document.querySelector('#whatever'));

// animate to an element by selector string
transcroll('#whatever');

// animate to position
transcroll(200);

// configuration options and default values
transcroll(whatever, {
	// scrollable container element
	el: window,
	
	// scrolling axis, 'x' or 'y'
	axis: 'y',

	// animation duration
	duration: 200,

	// transition easing function, can be a function or a string with an easings object key
	easing: easings.easeInQuad,

	// jump factor or false to disable (more information below)
	jump: 2,

	// immediately stop animation if user uses a mousewheel
	interrupt: true
});

// do something on animation end
transcroll(whatever).then(({
	// animation started after "jump" is triggered
	jumped,
	// animation was interrupted by user
	interrupted
}) => doSomething());
```

## Jump factor

`jump` argument is used to calculate a threshold value which is used to prevent animating too big distances in a
short period of time.

threshold = duration * jumpFactor

You can feel same behavior in the Telegram application when trying to scroll to the last message in a chat after
scrolling back to some old messages about 4-5 screens.