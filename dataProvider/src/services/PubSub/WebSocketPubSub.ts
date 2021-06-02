import { CustomSocket, PubSub } from "./PubSub";
import osu from 'node-os-utils';
import WebSocket from 'ws';
import logger from "../../logger";

const { cpu, mem } = osu;

export class WebsocketPubSub extends PubSub<CustomSocket<WebSocket>> {
	private _webSocketServer: WebSocket.Server;

	constructor() {
		super('write');
		this.createChannel('cpu');
		this.createChannel('ram');

		this._webSocketServer = new WebSocket.Server({
			port: 4312
		});

		this._webSocketServer.on('connection', this.handleNewConnection.bind(this));
		this._webSocketServer.on('error', this.handleError.bind(this));

		this._webSocketServer.on('listening', () => {
			logger.log(`Servidor iniciado em`, this._webSocketServer.address());

			setInterval((server: WebsocketPubSub) => {
				if (server.listeningChannels.get('cpu').size > 0) {
					cpu.usage().then(cpu => {
						server.pub('cpu', `cpu_${cpu}`);
					});
				}

				if (server.listeningChannels.get('ram').size > 0) {
					mem.used().then(ram => {
						server.pub('ram', `ram_${ram.usedMemMb}`);
					});
				}

			}, 1000, this);
		});
	}

	protected sendMessage(socket: CustomSocket<WebSocket>, message: string) {
		socket.send(message);
	}

	private handleNewConnection(socket) {
		console.log(`Nova conexão criada`);
		socket.channels = []; // Canais aos quais o socket está conecatdo

		socket.on('message', data => {
			this.handleMessage(socket, data);
		});

		socket.on('close', () => {
			this.disconnectSocket(socket);
		});
	}

	private handleError(err) {
		if (err.code === 'EADDRINUSE') {
			logger.log('Endereço já está em uso, tentando novamente...');
			this._webSocketServer.close()
		} else {
			logger.log(err);
		}
	}
}

export const webSocketPubSub = new WebsocketPubSub();
