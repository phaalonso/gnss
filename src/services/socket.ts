import net from 'net';
import osu from 'node-os-utils';
import { PubSub } from "./PubSub";

const PORT = 2108;
const HOST = 'localhost';

const pubSub = new PubSub<net.Socket>();
pubSub.createChannel('cpu');
pubSub.createChannel('ram');

const server = net.createServer();

server.on('connection', socket => {
	console.log(`Nova conexão criada`);
	
	socket.on('data', data => {
		const msg = data.toString();

		const matchSub = msg.match(/^sub_(.*)$/);

		if (matchSub && matchSub[1]) {
			const channel = matchSub[1];
			pubSub.sub(channel, socket);
			return;
		}
		
		const matchPub = msg.match(/^pub_(.*)_(.*)$/);

		if (matchPub && matchPub[1]) {
			const channel = matchPub[1];
			const message = matchPub[2];

			pubSub.pub(channel, message);
			return;
		}

		console.error(new Error(`Comando desconhecido ${msg}`));
	});
})

let count = 0;

server.on('error', err => {
	//@ts-ignore
	if (err.code === 'EADDRINUSE') {
		count++;

		if (count > 5) {
			process.exit(1);
		}

		console.log('Endereço já está em uso, tentando novamente...');
		setTimeout(() => {
			server.close();
			server.listen(PORT, HOST);
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
	});
}

function sendRam() {
	ram.used().then(ram => {
		pubSub.pub('ram', `ram_${ram.usedMemMb}`);
	});
}

//function sendDriveUsage() {
	//// Como conseguir o nome do drive?
	//drive.info().then(data => {
		//publish('drive', `drive_free_${data.freeGb}`);
		//publish('drive', `drive_used_${data.usedGb}`);

	//});
//}

server.listen(PORT, HOST, () => {
	console.log(`Servidor iniciado em`, server.address());

	setInterval(sendCpu, 1000);
	setInterval(sendRam, 1000);
	//setInterval(sendDiskUsage, 1000);
});
