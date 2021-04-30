import { PrnIndicesRepository } from "./database/sqlite/prnindices";
import { PrnInfoRepository } from "./database/sqlite/prninfo";
import { SQLite } from "./database/sqlite/DAO";
import { DBCONFIG } from "./config/database";
import { std, mean } from "mathjs";
import gps from "./gps";

const TAXA = 0.1;
const DISP = 0.5;
const MIN_QTDE = (60 / TAXA) * DISP;

const db = new SQLite(DBCONFIG.sqlitePath);
const prnindices = new PrnIndicesRepository(db);
const prninfo = new PrnInfoRepository(db);

const aCadaMinuto = async (time: Date) => {
	try {
		const rows = await prninfo.getGroupedPrn(time);

		console.log("PrninfoGrouped", rows);
		for (const row of rows) {
			if (row.total >= MIN_QTDE) {
				let vSnr = [];
				let vIntensidadeSinal = [];
				let intensidadeSinalQuadrado = 0;
				let intensidade = 0;

				try {
					const prnData = await prninfo.getByPrn(time, row.prn);

					console.log("prnInfoMinute");
					prnData.forEach((row) => {
						if (row.snr) {
							//console.log(row.prn + " -->" + row.snr);
							intensidade = Math.pow(10, row.snr / 10);
							vSnr.push(row.snr);
							vIntensidadeSinal.push(intensidade);
							intensidadeSinalQuadrado += Math.pow(
								intensidade,
								2
							);
						}
					});

					var dpSnr = std(vSnr);
					intensidadeSinalQuadrado /= vIntensidadeSinal.length;
					var mediaIntensidadeSinalQuadrado = Math.pow(
						mean(vIntensidadeSinal),
						2
					);
					var s4 = Math.sqrt(
						(intensidadeSinalQuadrado -
							mediaIntensidadeSinalQuadrado) /
							mediaIntensidadeSinalQuadrado
					);

					console.log("S4", s4);
					prnindices.insertProcessedData(dpSnr, s4, time, row.prn);
				} catch (err) {
					console.log(err);
				}
			}
		}
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

/**
 * Types:
 *	- GSV -> Satelites([prn, elevation, azimuth, snr, status])
 *	- GSA -> Satelites(lista de prn), pdop, hdop, vdop
 *	- GGA -> time, lat, lon, alt, quality, num of satelites, hdop, geoidal, age
 *	- VTG -> speed, track
 *	- RMC -> lat, lon, speed, track, faa
 */
async function application() {
	try {
		await prnindices.createTable();
		await prninfo.createTable();

		let time = new Date();
		let controle: number;
		let lat: number;
		let lon: number;

		// Querys rodaram sequencialmente
		db.serialize(() => {
			gps.on("data", async function (data) {
				//console.log(data);
				if (data.time) {
					time = data.time;
					lat = data.lat;
					lon = data.lon;
				}

				if (data.msgNumber != undefined && data.msgNumber != "null" && data.satellites) {
					for (const satelite of data.satellites) {
						//console.log(satelite);
						await prninfo.insert(
							satelite.prn,
							satelite.snr,
							satelite.azimuth,
							satelite.elevation,
							lat,
							lon,
							time
						);
					}
				}

				if (time.getSeconds() == 0 && time.getMinutes() != controle) {
					// Executada a cada minuto
					controle = time.getMinutes();
					//console.log(`CONTROLE ${controle}`);

					//aCadaMinuto(time);
				}
			});
		});
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
}

application();

