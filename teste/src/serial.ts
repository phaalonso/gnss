import { PrnIndicesSqlite } from "./controller/PrnIndicesSqlite";
import { PrnInfoSqlite } from "./controller/PrnInfoSqlite";
import { SQLite } from "./database/DAO";
import { DataProvider } from "./services/GnssDataStream";
import logger from "./logger";
import { CustomData, ProcessData } from "./services/processData";

const dao = new SQLite();
const prnInfo = new PrnInfoSqlite(dao);
const prnIndices = new PrnIndicesSqlite(dao)
const processData = new ProcessData(prnInfo, prnIndices);

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

async function Serial() {
	try {
		await prnInfo.createTable();
		await prnIndices.createTable();

		const dataStream = new DataProvider();
		dataStream.setSerialInput('/dev/ttyUSB0');

		dataStream.pipeToGps();

		const qtd = logQtd();

		let time = new Date();
		let lat: number;
		let lon: number;

		// Inicia o log do contador, tempo em ms
		// 1000 * 60 * 5 -> 5 minutos
		setInterval((qtd) => {
			logger.log(`Quantidade de dados enviadas: ${qtd.getQtd()}`);
		}, 1000 * 60 * 30, qtd);

		dataStream.on("data", async (data) => {
			if (data.time) {
				time = data.time;
				lat = data.lat;
				lon = data.lon;
			}

			if (!data.msgNumber || data.msgNumber == "null" || !data.satellites || !lat || !lon) {
				return;
			} else {

				for (const satelite of data.satellites) {
					const customData: CustomData = {
						prn: satelite.prn,
						snr: satelite.snr,
						azimuth: satelite.azimuth,
						elevation: satelite.elevation,
						lat: lat,
						lon: lon,
						time: time,
					};

					processData.processCustomData(customData);
				}

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
}

Serial();
