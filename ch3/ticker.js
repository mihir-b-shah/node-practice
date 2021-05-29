
const events = require('events');
const process = require('process');

/*
num is the number of milliseconds this function should execute.
We do something every 50 milliseconds until num time is done.

Every 50 millis, we fire an event called 'tick'. At the very end,
we call callback, with the result as the number of tick events
fired.
*/

function ticker(num, callback){
	const emitter = new events.EventEmitter();
	const timer = function(i){
		if(i*50 < num){
			if(Date.now()%5 == 0){
				emitter.emit('error', 'date.now not divisible.');
			} else {
				emitter.emit('tick');
				setTimeout(timer, 50, 1+i);
			}
		} else {
			callback(i);
		}
	}
	process.nextTick(()=>timer(0));
	return emitter;
}

ticker(600, (res)=>console.log(res))
	.on('tick', ()=>console.log('tick'))
	.on('error', (err)=>console.error(err));
