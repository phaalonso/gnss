import logger from "../logger";
import { MessageBuffer } from "./MessageBuffer";
import { CustomData, ProcessData } from "./ProcessData";
import Websocket from 'ws';

export class WSClient {
	public active = false;
	private processData: ProcessData;
	private timeout: NodeJS.Timeout;
	private connectedChannels: Set<string>;
	private buffer: MessageBuffer;
    private client: Websocket;

	constructor(processData: ProcessData) {
		this.connectedChannels = new Set<string>();
		this.buffer = new MessageBuffer("\n");
		this.processData = processData;
	}

	private setupSocket() {
		this.client.on("open", () => {
			logger.log("Conexão estabelecida");

			if (this.connectedChannels.size > 0) {
				this.connectedChannels.forEach((channelName) => {
					this.writeSubcribe(channelName);
				});
			} else {
				this.listenToChannel("custom");
			}
		});

		this.client.on("message", (data) => {
			this.buffer.push(data.toString());

			while (!this.buffer.isDone()) {
				const message = this.buffer.getMessage();

				this.processMessage(message);
			}
		});

		this.client.on("error", (err) => {
			logger.exception(err, "Erro na conexão socket");
			this.active = false;
		});

		this.client.on("close", () => {
			logger.log("Conexão fechada");
			this.setReconnect();
			this.active = false;
		});
	}

	private processMessage(message: string) {
		// logger.log(message);

		const matchRec = message.match(/^rec_(.*)_(.*)$/);

		if (matchRec && matchRec[1] && matchRec[2]) {
			return;
		}

		// sat_prn_snr_azimuth_elevation_lat_lon_time\n
		const matchCustom = message.match(
			/^sat_(.*)_(.*)_(.*)_(.*)_(.*)_(.*)_(.*)$/
		);

		if (
			matchCustom &&
			matchCustom[1] &&
			matchCustom[2] &&
			matchCustom[3] &&
			matchCustom[4] &&
			matchCustom[5] &&
			matchCustom[6] &&
			matchCustom[7]
		) {
			const customData: CustomData = {
				prn: parseInt(matchCustom[1]),
				snr: parseFloat(matchCustom[2]) || null,
				azi: parseFloat(matchCustom[3]) || null,
				elev: parseFloat(matchCustom[4]) || null,
				lat: parseFloat(matchCustom[5]),
				lon: parseFloat(matchCustom[6]),
				time: new Date(parseInt(matchCustom[7])),
			};

			this.processData.sendToBuffer(customData);
			return;
		}

		logger.log(`mensagem inválida  ${message}`);

	}

	/**
	 * @param name
	 * @description helper method to subscribe to an channel
	 * @private
	 */
	private writeSubcribe(name: string) {
		logger.log(`Sending subscribe ${name}`);
		this.client.send(`sub_${name}\n`);
	}

	/**
	 * @description set the client to listen to a channel
	 * @param name
	 */
	public listenToChannel(name: string) {
		if (!this.connectedChannels.has(name)) {
			this.connectedChannels.add(name);

			this.writeSubcribe(name);
		}
	}

	private setReconnect() {
		const time = 1000 * 5;
		logger.log(`Tentando reconectar em ${time} ms`);
		this.timeout = setTimeout(
			(client) => {
				console.log("Tentando reconectar");
				client.run(client.callback);
			},
			time,
			this
		);
	}

	public run() {
		this.client = new Websocket('ws://localhost:4312');

		this.setupSocket();
	}
}
