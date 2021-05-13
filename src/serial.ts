import { connect } from "./database/mongodb/connection";
import { GpsDataStream } from "./GpsDataStream";
import { socketPubSub } from "./services/sockets/socket";
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
		const dataStream = new GpsDataStream();
		await connect();

		socketPubSub.createChannel('custom');

		//await prnindices.createTable();
		//await prninfo.createTable();

		let time = new Date();
		let lat: number;
		let lon: number;

		// Querys rodaram sequencialmente
		//db.serialize(() => {
		dataStream.on("data", async (data) => {
			//console.log(data);
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
		//});
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
})();
