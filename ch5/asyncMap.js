
/* run callback over iterable with max concurrency as concurrency */
async function mapAsync(arr, callback, concurrency){
	let start = 0;
	let results = new Array(arr.length);

	const mapHelper = async function(){
		if(start == arr.length){
			return;
		}
		let asyncRes = callback(arr[start]);
		let curr = start;

		++start;
		--concurrency;

		if(concurrency >= 0 && start < arr.length){
			await mapHelper();
		}
		
		results[curr] = await asyncRes;
		++concurrency;
		
		if(concurrency >= 0 && start < arr.length){
			await mapHelper();
		}
	};
	
	await mapHelper();
	return results;
}

function myFunc(v){
	switch(v){
		case 0:
			return Promise.resolve(3);
		case 1:
			return new Promise((resolve, reject) => {
				setTimeout(resolve, 100, 'foo');
			});
		case 2:
			return new Promise((resolve, reject) => {
				setTimeout(resolve, 400, 'foo2');
			});
		case 3:
			return 42;
		case 4:
			return new Promise((resolve, reject) => {
				setTimeout(resolve, 10, 'foo3');
			});
		default:
			return 5;
	}
}

async function main(){
	const res = await mapAsync([0, 1, 2, 3, 4], myFunc, 1);
	console.log(res);
}

main();
