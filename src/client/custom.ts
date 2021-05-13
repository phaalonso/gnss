import net from "net";
import { PrnIndicesMongo } from "../controller/PrnIndices";
import { PrnInfoMongo } from "../controller/PrnInfo";
import { connect } from "../database/mongodb/connection";
import { CustomData, ProcessData } from "../processData";

export class Client {
	//TODO restabelecer a conexão automaticamente
	public socket: net.Socket;
	private cb: Function;
	public config: net.SocketConnectOpts = { port: 3000, host: '192.168.3.23' }
	public active = false;
	private timeout: NodeJS.Timeout;
	private processData: ProcessData;

	constructor(processData: ProcessData) { 
		if (!processData) {
			throw new Error('Client requires processData');
		}

		this.processData = processData;
		this.socket = new net.Socket();
		this.socket.on("connect", () => {
			console.log("Conexão estabelecida");
			//TODO criar buffer de mensagens
			this.socket.write('sub_custom');
		});

		this.socket.on('data', data => {
			const msgs = data.toString().split("\n");
			//console.log(msgs)

			for (const msg of msgs) {
				const matchRec = msg.match(/^rec_(.*)_(.*)$/);

				if (matchRec && matchRec[1] && matchRec[2]) {
					//TODO Marcar que a mensagem enviada foi recebida pelo cliente
					console.log(msg);
					return;
				}

				//`sat_prn_snr_azimuth_elevation_lat_lon_time\n`)
				const matchCustom = msg.match( /^sat_(.*)_(.*)_(.*)_(.*)_(.*)_(.*)_(.*)$/);
				//console.log(matchCustom[7]);

				if ( matchCustom && matchCustom[1] && matchCustom[2] && matchCustom[3] && matchCustom[4] && matchCustom[5] && matchCustom[6] && matchCustom[7]) {
					const snr = parseFloat(matchCustom[2]) || null;
					//console.log(msg, snr);
					const customData: CustomData = {
						prn: parseInt(matchCustom[1]),
						snr: parseFloat(matchCustom[2]) || null,
						azimuth: parseFloat(matchCustom[3]) || null,
						elevation: parseFloat(matchCustom[4]) || null,
						lat: parseFloat(matchCustom[5]),
						lon: parseFloat(matchCustom[6]),
						time: new Date(parseInt(matchCustom[7])),
					};

					//console.log(customData);

					this.processData.processCustomData(customData);

					return;
				}

				console.log(msg);
			}

		});

		this.socket.on("error", (err) => {
			console.log("Erro na conexão socket");
			console.log(err);
			this.active = false;
		});

		this.socket.on("end", () => {
			console.log("End");
			this.active = false;
		});
	}

	setReconnect() {
		this.timeout = setTimeout((client) => {
			client.run(client.cb);
		}, 1000 * 5, this);
	}

	run(cb?: Function): net.Socket {
		this.cb = cb;

		this.socket.on( "lookup", ( err: Error, address: string, family: string | number, host: string) => {
				if (err) {
					console.log("Erro ao tentar criar conexão");
					console.log(err);
				} else {
					console.log("Conexão criada");
				}
			}
		);

		return this.socket.connect(this.config, () => {
			this.active = true;

			if (this.timeout) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}

			if (cb)
				return cb();
			return;
		});
	}
}

if (require.main == module) {
	connect().then(() => {
		const prnInfo = new PrnInfoMongo();
		const prnIndices = new PrnIndicesMongo()
		const processData = new ProcessData(prnInfo, prnIndices);

		const client = new Client(processData);

		client.run(() => {
			console.log('Client is running');
		})
	}).catch((err) => {
		console.log(err);
	});
}
