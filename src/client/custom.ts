import net from "net";
import { connect } from "../database/mongodb/connection";
import { CustomData, processCustomData } from "../processData";

let socket: net.Socket;

connect().then(() => {
	socket = net.createConnection({ port: 2108 }, () => { console.log('Conectado com o servidor!');
	});

	socket.on('connect', () => {
		console.log('Conexão estabelecida');
	})

	socket.on("lookup", (
			err: Error, address: string, family: string | number, host: string ) => {
			if (err) {
				console.log("Erro ao tentar criar conexão");
				console.log(err);
			} else {
				console.log("Conexão criada");
			}
		}
	);

	socket.on("data", (data) => {
		const msgs = data.toString().split("\n");

		for (const msg of msgs) {
			const matchRec = msg.match(/^rec_(.*)_(.*)$/);

			if (matchRec && matchRec[1] && matchRec[2]) {
				//TODO Marcar que a mensagem enviada foi recebida pelo cliente
				console.log(msg);
				return;
			}

			//`sat_prn_snr_azimuth_elevation_lat_lon_time.getTime()\n`)
			const matchCustom = msg.match(
				/^sat_(.*)_(.*)_(.*)_(.*)_(.*)_(.*)_(.*)$/
			);
			//console.log(matchCustom[7]);

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
				const snr = parseFloat(matchCustom[2]) || null;
				//console.log(msg, snr);
				const customData: CustomData = {
					prn: parseInt(matchCustom[1]),
					snr: snr,
					azimuth: parseFloat(matchCustom[3]),
					elevation: parseFloat(matchCustom[4]),
					lat: parseFloat(matchCustom[5]),
					lon: parseFloat(matchCustom[6]),
					time: new Date(parseInt(matchCustom[7])),
				};

				//console.log(customData);

				processCustomData(customData);

				return;
			}

			console.log(msg);
		}
	});

	socket.on("error", (err) => {
		console.log('Erro na conexão socket')
		console.log(err);
	});

	socket.on("end", () => {
		console.log("End");
	});
}).catch(err => {
	console.log(err);
});

export default socket;
