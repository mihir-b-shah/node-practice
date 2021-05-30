
const fs = require('fs');
const path = require('path');
const process = require('process');
	
class Node {
	constructor(v){
		this.val = v;
		this.next = null;
	}
}

class TaskQueue {
	constructor(pLim=4){
		this.front = null;
		this.back = null;
		this.runCt = 0;
		this.pLim = pLim; // parallel limit
	}

	offer(v){
		let n = new Node(v);
		if(this.back != null){
			this.back.next = n;
		}
		this.back = n;

		if(this.front == null){
			this.front = n;
		}
	}

	peek(){
		return this.front.val;
	}

	poll(){
		if(this.back == this.front){
			this.back = null;
		}
		this.front = this.front.next;
	}

	empty(){
		return this.front == null && this.back == null;
	}

	run(fn, doneCb){
		if(this.empty()){
			doneCb(); 
		}

		while(!(this.empty()) && this.runCt < this.pLim){
			var file = this.peek();
			this.poll();
			fn(this, file); 
		}
	}
}

function getProcessor(kw, output, cb){
	const runTQ = function(tq){
		tq.run(processElement, ()=>{
			cb(null, output);
		});
	}

	const processDir = function(tq, dir){
		fs.readdir(dir, (err, data) => {
			--(tq.runCt);
			if(err){
			} else {
				for(const child of data){
					tq.offer(path.join(dir, child));
				}
				runTQ(tq);
			}
		});	
	};

	const processFile = function(tq, file){
		fs.readFile(file, 'utf8', (err, data)=>{
			--(tq.runCt);
			if(err){
			} else {
				if(data.search(kw) != -1){
					console.log(file);
					output.push(file);
				}
				runTQ(tq);
			}
		});
	};

	const processElement = function(tq, file){
		++(tq.runCt);
		fs.stat(file, (err, stat)=>{
			if(err){
			} else {
				if(stat.isDirectory()){
					processDir(tq, file);
				} else {
					processFile(tq, file);	
				}
			}
		});
	};
	
	return processElement;
}

function recursiveFind(dir, keyword, cb){
	let tq = new TaskQueue();
	tq.offer(dir);
	let output = [];
	tq.run(getProcessor(keyword, output, cb));
}

recursiveFind('.','raarig',console.log);
