import net from 'net';
import osu from 'node-os-utils';

const PORT = 2108;
const HOST = 'localhost';

const listeningChannels = {};

listeningChannels['cpu'] = [];
listeningChannels['ram'] = [];

const server = net.createServer();

function subscribe(channel: string, socket: net.Socket) {
	if (!listeningChannels[channel]) return;

	listeningChannels[channel].push(socket);
}

function publish(channel: string, message: string) {
	if (!listeningChannels[channel]) return;

	for (const sc of listeningChannels[channel]) {
		sc.write(message);
	}
}

server.on('connection', socket => {
	console.log(`Nova conexão criada`);
	
	socket.on('data', data => {
		const msg = data.toString();

		const matchSub = msg.match(/^sub_(.*)$/);

		if (matchSub && matchSub[1]) {
			const channel = matchSub[1];
			subscribe(channel, socket);
			return;
		}
		
		const matchPub = msg.match(/^pub_(.*)_(.*)$/);

		if (matchPub && matchPub[1]) {
			const channel = matchPub[1];
			const message = matchPub[2];

			publish(channel, message);
			return;
		}

		console.error(new Error(`Comando desconhecido ${msg}`));
	})
})

server.on('error', err => {
	if (err.name === 'EADDINUSE') {
		console.log('Endereço já está em uso, tentando novamente...');
		setTimeout(() => {
			server.close();
			server.listen(PORT, HOST);
		}, 1000);
	}

});

const cpu = osu.cpu;
const ram = osu.mem;

function sendCpu() {
	cpu.usage().then(cpu => {
		publish('cpu', `cpu_${cpu}`);
	});
}

function sendRam() {
	ram.used().then(ram => {
		publish('ram', `ram_${ram.usedMemMb}`);
	});
}

server.listen(PORT, HOST, () => {
	console.log(`Servidor iniciado em`, server.address());

	listeningChannels['cpu'] = [];
	//listeningChannels['ram'] = [];
	
	setInterval(sendCpu, 1000);
	setInterval(sendRam, 1000);
});
