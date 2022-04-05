import { config } from "./config";
import { GNSSService } from "./services/GNSSProvider";
import logger from "./logger";
import { WebsocketPubSub } from "./messaging/WebSocketPubSub";
// import { SocketPubSub } from "./messaging/SocketPubSub";

/**
 * Types:
 *	- GSV -> Satelites([prn, elevation, azimuth, snr, status])
 *	- GSA -> Satelites(lista de prn), pdop, hdop, vdop
 *	- GGA -> time, lat, lon, alt, quality, num of satelites, hdop, geoidal, age
 *	- VTG -> speed, track
 *	- RMC -> lat, lon, speed, track, faa
 */

function logQtd() {
	let quantidade = 0;

	return {
		aumentar: () => {
			quantidade = quantidade + 1;
		},
		getQtd: () => quantidade
	}
}

async function start() {
		const gnssService = new GNSSService();

		const socketConf = config.socket;
		// const messagingService = new SocketPubSub(config.socket);
		const messagingService = new WebsocketPubSub();

		const qtd = logQtd();

		messagingService.createChannel('custom');

		let time = new Date(); 
		let lat: number; 
		let lon: number;

		// Inicia o log do contador, tempo em ms
		// 1000 * 60 * 5 -> 5 minutos
		setInterval((qtd) => {
			logger.log(`Quantidade de dados enviadas: ${qtd.getQtd()}`);
		}, config.log.qtdEnvioInterval, qtd);

		gnssService.serialInput('/dev/ttyUSB0');
		gnssService.parse();

		gnssService.on("data", async (data) => {
			if (data.time) {
				time = data.time;
				lat = data.lat;
				lon = data.lon;
			}

			if (!data.msgNumber || data.msgNumber == "null" || !data.satellites || !lat || !lon) {
				return;
			} else {
				for (const satelite of data.satellites) {
					messagingService.pub('custom', `sat_${satelite.prn}_${satelite.snr}_${satelite.azimuth}_${satelite.elevation}_${lat}_${lon}_${time.getTime()}\n`);
					qtd.aumentar();
				}
			}
		});

		gnssService.on('error', (err) => {
			logger.log('Erro no GnssDataStream');
			logger.log(err);
		});
}

start().catch(err => {
	logger.exception(err);
	process.exit(1);
});
