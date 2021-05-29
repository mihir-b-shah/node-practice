
// Implements a version of fgrep with callbacks, caching of files to speed up lookups

const fs = require('fs');
const path = require('path');
const express = require('express');

/******************************************************************************/

const app = express();
const cache = new Map();

function searchText(rgx, data){
	return Array.from(data.matchAll(new RegExp(rgx, 'g'), data)).join(', ');
}

function genFileSearch(rgx, fileList, renderer){
	return function searchFiles(i, outputs){
		if(i == fileList.length){
			// done processing, render result
			renderer(outputs);
		} else {
			fs.readFile(fileList[i], 'utf8', (err, data) => {
				if(err){
						
				} else {
					// adds all elements of searchText's iterable
					outputs.push(`File: ${fileList[i]}`);
					outputs.push(`\t${searchText(rgx, data)}`);
					searchFiles(1+i, outputs);
				}	
			});
		}
	}
}


function searchDir(rgx, dir, renderer){
	const dirPath = path.join(__dirname, dir);

	fs.readdir(dirPath, (err, fileList) => {
		if(err){
			
		} else {
			// note "in" loop doesn't traverse files in order.
			const fileSearcher = genFileSearch(rgx, fileList, renderer);
			fileSearcher(0, []);
		}
	});
}

app.get('/', (req, res) => {
	let regex = req.query.regex;
	let dir = req.query.dir;

	searchDir(regex, dir, (output) => {
		res.end(JSON.stringify(output));
	});
});
app.listen(5050);
