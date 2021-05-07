import net from 'net';
import osu from 'node-os-utils';
import { PubSub, CustomSocket } from "./PubSub";

const PORT = 2108;
const HOST = 'localhost';

const { cpu, mem } = osu;

class SocketPubSub extends PubSub<CustomSocket<net.Socket>> {
	private _socketServer: net.Server;

	constructor() {
		super('write');
		this.createChannel('cpu');
		this.createChannel('ram');

		this._socketServer = net.createServer();

		this._socketServer.on('connection', this.handleNewConnection.bind(this));
		this._socketServer.on('error', this.handleError.bind(this));

		this._socketServer.listen(PORT, HOST, () => {
			console.log(`Servidor iniciado em`, this._socketServer.address());

			// setInterval((server: SocketPubSub) => {
			//     if (server.listeningChannels.get('cpu').size > 0) {
			// 		cpu.usage().then(cpu => {
			// 			// console.log(cpu);
			// 			server.pub('cpu', `cpu_${cpu}`);
			// 		});
			// 	}
			//
			//     if (server.listeningChannels.get('ram').size > 0) {
			// 		mem.used().then(ram => {
			// 			server.pub('ram', `ram_${ram.usedMemMb}`);
			// 		});
			// 	}
			//
			// }, 1000, this);
		});
	}

	protected sendMessage(socket: CustomSocket<net.Socket>, message: string) {
		socket.write(message);
	}

	private handleNewConnection(socket) {
		console.log(`Nova conexão criada`);
		socket.channels = []; // Canais aos quais o socket está conecatdo

		socket.on('data', data => {
			this.handleMessage(socket, data);
		});

		socket.on('close', () => {
			this.disconnectSocket(socket);
		});
	}

	private handleError(err) {
		if (err.code === 'EADDRINUSE') {
			console.log('Endereço já está em uso, tentando novamente...');
			setTimeout(() => {
				this._socketServer.close();
				this._socketServer.listen(PORT, HOST);
			}, 1000);
		} else {
			console.log(err);
		}
	}
}

const server = new SocketPubSub();