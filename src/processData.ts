//import { PrnIndicesSqlite } from "./database/sqlite/prnindices";
//import { PrnInfoSqlite } from "./database/sqlite/prninfo";
//import { DBCONFIG } from "./config/database/sqlite";
//import { SQLite } from "./database/sqlite/DAO";

import { PrnInfoMongo } from "./database/mongodb/prninfo";
import { PrnIndicesMongo } from "./database/mongodb/prnindices";
import { std, mean } from "mathjs";
import { Satellite } from "gps";

export interface CustomData {
	prn: number;
	snr: number;
	azimuth: number;
	elevation: number;
	lat: number;
	lon: number;
	time: Date;
}

const TAXA = 0.1;
const DISP = 0.5; const MIN_QTDE = (60 / TAXA) * DISP;

//const db = new SQLite(DBCONFIG.sqlitePath);
//const prnindices = new PrnIndicesSqlite(db);
//const prninfo = new PrnInfoSqlite(db);

const prnInfo = new PrnInfoMongo();
const prnIndices = new PrnIndicesMongo();

export async function aCadaMinuto(time: Date) {
	try {
		const rows = await prnInfo.getGroupedPrn(time);

		//console.log("PrninfoGrouped", rows);
		for (const row of rows) {
			if (row.total >= MIN_QTDE) {
				let vSnr = [];
				let vIntensidadeSinal = [];
				let intensidadeSinalQuadrado = 0;
				let intensidade = 0;

				try {
					const prnData = await prnInfo.getByPrn(time, row.prn);
					//console.log(prnData);

					// console.log('Prn info by binute', prnData);
					prnData.forEach((row) => {
						if (row.snr) {
							// console.log(row.prn + " -->" + row.snr);
							intensidade = Math.pow(10, row.snr / 10);
							vSnr.push(row.snr);
							vIntensidadeSinal.push(intensidade);
							intensidadeSinalQuadrado += Math.pow(
								intensidade,
								2
							);
						}
					});

					if (vSnr) {
						console.log("vSnr vazio");
						return;
					}

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

					//console.log("S4", s4);
					prnIndices.insertProcessedData(dpSnr, s4, time, row.prn);
				} catch (err) {
					console.log(err);
				}
			}
		}
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}

export async function saveSatellite(
	satellite: Satellite,
	lat: number,
	lon: number,
	time: Date
) {
	await prnInfo.insert(
		satellite.prn,
		satellite.snr,
		satellite.azimuth,
		satellite.elevation,
		lat,
		lon,
		time
	);
}

let controle: number = new Date().getMinutes();

export async function processData(
	satellite: Satellite[],
	lat: number,
	lon: number,
	time: Date
) {
	for (const satelite of satellite) {
		await prnInfo.insert(
			satelite.prn,
			satelite.snr,
			satelite.azimuth,
			satelite.elevation,
			lat,
			lon,
			time
		);
	}

	if (time.getSeconds() == 0 && time.getMinutes() != controle) {
		process.stdout.write(`${time} Salvando prnindices\n`);
		controle = time.getMinutes();

		aCadaMinuto(time);
	}
}

export async function processCustomData(custom: CustomData) {
	await prnInfo.insert(
		custom.prn,
		custom.snr,
		custom.azimuth,
		custom.elevation,
		custom.lat,
		custom.lon,
		custom.time
	);

	if (custom.time.getSeconds() == 0 && custom.time.getMinutes() != controle) {
		process.stdout.write(`${custom.time} Salvando prnindices\n`);
		controle = custom.time.getMinutes();

		aCadaMinuto(custom.time);
	}
}
