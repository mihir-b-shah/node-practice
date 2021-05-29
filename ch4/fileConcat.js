
/*
Excercise 4.1 - implement file concatenation, in 
the order specified.

Uses the limited concurrency paradigm (without task queues,
since there is no risk of exponential growth)
*/

const fs = require('fs');
const process = require('process');

class FileMap {
	constructor(n){
		this.map = new Array(n);
		this.ct = 0;
		this.readCt = 0;
		this.curr = 0;
	}
	
	patchFile(i, data){
		this.map[i] = data;
	}

	done(){
		return this.ct == this.map.length;
	}

	join(){
		return this.map.join('');
	}
}

function getFileReader(fileMap, fileList, parallelCt, doneCb){
	const receiveFileData = function(err, data, num){
		--(fileMap.readCt); 									// a read has completed
		if(!err){
			fileMap.patchFile(num, data); 			// patch the file id num with data
		}
		++(fileMap.ct);												// we have completed one more file
		if(fileMap.done()){
			doneCb(err);												// done, propagate errors, if any
		} else {
			readFiles();												// if there are files left, continue
		}
	};
	
	getFileReceiver = function(curr){
		return function(err, data){
			receiveFileData(err, data, curr);
		};
	}

	const readFiles = function(){
		while(fileMap.curr < fileList.length && fileMap.readCt < parallelCt){
			++(fileMap.readCt);									// start a read operation
			fs.readFile(fileList[fileMap.curr], 'utf8', getFileReceiver(fileMap.curr));
			++(fileMap.curr);										// advance to the next file.
		}
	};

	return readFiles;
}

function concatFiles(destFile, cb, parallelCt, ...srcFiles){
	let fileMap = new FileMap(srcFiles.length);
	getFileReader(fileMap, srcFiles, parallelCt, ()=>{
			fs.writeFile(destFile, fileMap.join(), (err)=>cb(err));
	})();
}

concatFiles('ABCDE.txt', ()=>console.log('done!'), 2, 'A.txt', 'B.txt', 'C.txt', 'D.txt', 'E.txt');
