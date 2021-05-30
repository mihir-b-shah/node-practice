
const fs = require('fs');
const path = require('path');
const process = require('process');
	
class FileNode {
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
		this.done = false;
	}

	offer(v){
		let n = new FileNode(v);
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
		if(this.empty() && !(this.done)){
			this.done = true;
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
			cb(output);
		});
	}

	const processDir = function(tq, dir){
		fs.readdir(dir, {'encoding': 'utf8', 'withFileTypes': true}, (err, data) => {
			--(tq.runCt);
			if(err){
				// just ignore errors.
			} else {
				for(const child of data){
					tq.offer({'name': path.join(dir, child.name), 'isDir': child.isDirectory()});
				}
				runTQ(tq);
			}
		});	
	};

	const processFile = function(tq, file){
		fs.readFile(file, 'utf8', (err, data)=>{
			--(tq.runCt);
			if(err){
				// just ignore errors.
			} else {
				if(data.search(kw) != -1){
					output.push(file);
				}
				runTQ(tq);
			}
		});
	};

	const processElement = function(tq, file){
		++(tq.runCt);
		if(file.isDir){
			processDir(tq, file.name);
		} else {
			processFile(tq, file.name);
		}
	};
	
	return processElement;
}

function recursiveFind(dir, keyword, cb){
	let tq = new TaskQueue();
	tq.offer({'name':'.', 'isDir':true});
	let output = [];
	tq.run(getProcessor(keyword, output, cb));
}

recursiveFind('.', 'raarig', console.log);
