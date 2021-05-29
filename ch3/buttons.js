
const dialogues = ['Raar!', 'Food!', 'Am huge and hungry!', 'More food!', 'Yeeeeet'];

// inefficient to access DOM so much
function hello(dialogue){
	return function(){
		document.getElementById('output').innerText = dialogue;
	}	
}

function initClickHandler(){
	let numButtons = 1+Math.floor(dialogues.length*Math.random());
	let div = document.getElementById('mydiv');
	div.textContent = ''; // clear

	for(let i = 0; i<numButtons; ++i){
		var btn = document.createElement('BUTTON');
		btn.innerText = 'Click me!';
		btn.onclick = hello(dialogues[i]);
		div.appendChild(btn);
	}
}
