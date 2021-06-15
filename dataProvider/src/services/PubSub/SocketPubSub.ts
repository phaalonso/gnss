import net from 'net';
import { PubSub, CustomSocket } from "./PubSub";
import logger from "../../logger";

const PORT = 2108;
const HOST = 'localhost';

export class SocketPubSub extends PubSub<CustomSocket<net.Socket>> {
	private _socketServer: net.Server;

	constructor() {
		super('write');
		this.createChannel('cpu');
		this.createChannel('ram');

		this._socketServer = net.createServer();

		this._socketServer.on('connection', this.handleNewConnection.bind(this));
		this._socketServer.on('error', this.handleError.bind(this));

		this._socketServer.listen(PORT, HOST, () => {
			logger.log(`Servidor iniciado em`, this._socketServer.address());
		});
	}

	protected sendMessage(socket: CustomSocket<net.Socket>, message: string) {
		socket.write(message);
	}

	private handleNewConnection(socket) {
		logger.log(`Nova conexão criada`);
		socket.channels = []; // Canais aos quais o socket está conecatdo

		socket.on('data', data => {
			this.handleMessage(socket, data);
		});

		socket.on('close', () => {
			this.disconnectSocket(socket);
		});

		socket.on('error', err => {
			logger.exception(err, 'Socket');
		})
	}

	private handleError(err) {
		if (err.code === 'EADDRINUSE') {
			logger.log('Endereço já está em uso, tentando novamente...');
			setTimeout(() => {
				this._socketServer.close();
				this._socketServer.listen(PORT, HOST);
			}, 1000);
		} else {
			logger.log(err);
		}
	}
}

export const socketPubSub = new SocketPubSub();
