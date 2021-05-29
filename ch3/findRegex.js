
const events = require('events');
const fs = require('fs');
const process = require('process');

class FindRegex extends events.EventEmitter {
	constructor(regex){
		super();
		this.regex = regex;
		this.files = []
	}

	addFile(file){
		this.files.push(file);
		return this;
	}

	find(){
		process.nextTick(()=>this.emit('find', this.files));
		for(const file of this.files){
			fs.readFile(file, 'utf8', (err, content) => {
				if(err){
					return this.emit('error', err);	
				}
				
				this.emit('fileread', file);
				
				const match = content.match(this.regex);
				if(match){
					match.forEach(elem => this.emit('found', file, elem));
				}
			});
		}
		return this;
	}
}

const regexFinder = new FindRegex(/hello \w+/g);
regexFinder
	.on('find', files => console.log(files))
	.on('found', (file, match) => console.log(`Matched "${match}" in file ${file}`))
	.on('error', err => console.error(`Error emitted ${err.message}`))
	.addFile('fileA.txt')
	.addFile('fileB.json')
	.find()
	.addFile('fileC.txt')
	.find();
