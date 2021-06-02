// import { connect } from "./database/mongodb/connection";
import { GnssDataStream } from "./GnssDataStream";
import { socketPubSub } from "./services/PubSub";
import logger from "../logger";
//import { processData } from "./processData";


/**
 * Types:
 *	- GSV -> Satelites([prn, elevation, azimuth, snr, status])
 *	- GSA -> Satelites(lista de prn), pdop, hdop, vdop
 *	- GGA -> time, lat, lon, alt, quality, num of satelites, hdop, geoidal, age
 *	- VTG -> speed, track
 *	- RMC -> lat, lon, speed, track, faa
 */
(async () => {
	try {
		const dataStream = new GnssDataStream();
		// await connect();

		socketPubSub.createChannel('custom');

		//await prnindices.createTable();
		//await prninfo.createTable();

		let time = new Date();
		let lat: number;
		let lon: number;

		// Querys rodaram sequencialmente
		//db.serialize(() => {
		dataStream.on("data", async (data) => {
			//logger.log(data);
			if (data.time) {
				time = data.time;
				lat = data.lat;
				lon = data.lon;
			}

			if (!data.msgNumber || data.msgNumber == "null" || !data.satellites || !lat || !lon) {
				return;
			} else {
				for (const satelite of data.satellites) {
-					socketPubSub.pub('custom', `sat_${satelite.prn}_${satelite.snr}_${satelite.azimuth}_${satelite.elevation}_${lat}_${lon}_${time.getTime()}\n`)
				}
				//processData(data.satellites, lat, lon, time);
			}
		});

		dataStream.on('error', (err) => {
			logger.log('Erro no GnssDataStream');
			logger.log(err);
		});
	} catch (err) {
		logger.exception(err);
		process.exit(1);
	}
})();
