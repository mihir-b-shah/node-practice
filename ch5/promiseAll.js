
function promiseAll(promises){
	return new Promise((resolve, reject) => {
		const num = promises.length;
		let ctr = 0;
		const results = new Array(num);

		for(let i = 0; i<num; ++i){
			if(promises[i] instanceof Promise){
				promises[i].then((result) => {
					++ctr;
					results[i] = result;	

					if(ctr == num){
						// we're done
						resolve(results);
					}
				}).catch(err => {
					// done too		
					reject(err);
				});
			} else {
				++ctr;
				results[i] = promises[i];
		
				if(ctr == num){
					resolve(results);
				}
			}
		}
	});
}
