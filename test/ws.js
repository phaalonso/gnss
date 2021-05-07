const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:4312');

ws.onopen = () => {
	console.log('Abrindo uma conexão');
	ws.send('sub_ram')

	ws.send('sub_cpu');
	ws.send('sub_ram');
}

ws.onmessage = ev => {
	console.log(ev.data);
}

ws.onerror = err => {
	console.log(err);
}

ws.onclose = () => {
	console.log('Closing');
}