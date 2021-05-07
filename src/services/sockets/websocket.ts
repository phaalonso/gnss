import osu from 'node-os-utils';
import { PubSub } from "./PubSub";
import WebSocket from 'ws';

const PORT = 2108;
const HOST = 'localhost';

const pubSub = new PubSub<WebSocket>('send');
pubSub.createChannel('cpu');
pubSub.createChannel('ram');

const wss = new WebSocket.Server({
	port: 4312
});

wss.on('connection', ws => {
	console.log(`Nova conexão criada`);
	
	ws.on('message', data => {
		pubSub.handleMessage(ws, data);
	});
})

let count = 0;

wss.on('error', err => {
	//@ts-ignore
	if (err.code === 'EADDRINUSE') {
		count++;

		if (count > 5) {
			process.exit(1);
		}

		console.log('Endereço já está em uso, tentando novamente...');
		setTimeout(() => {
			wss.close();
			wss.listen(PORT, HOST);
		}, 1000 * count);
	} else {
		console.log(err);
	}
});

const cpu = osu.cpu;
const ram = osu.mem;
//const drive = osu.drive;

function sendCpu() {
	cpu.usage().then(cpu => {
		console.log(cpu);
		pubSub.pub('cpu', `cpu_${cpu}`);
	}).catch(err => {
		console.log(err);
	});
}

function sendRam() {
	ram.used().then(ram => {
		pubSub.pub('ram', `ram_${ram.usedMemMb}`);
	}).catch(err => {
		console.log(err)
	});
}

//function sendDriveUsage() {
	//// Como conseguir o nome do drive?
	//drive.info().then(data => {
		//publish('drive', `drive_free_${data.freeGb}`);
		//publish('drive', `drive_used_${data.usedGb}`);

	//});
//}

wss.on('open', () => {
	console.log(`Servidor iniciado em`, wss.address());

	setInterval(sendCpu, 1000);
	setInterval(sendRam, 1000);
	//setInterval(sendDiskUsage, 1000);
});