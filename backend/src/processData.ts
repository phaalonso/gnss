//import { PrnIndicesSqlite } from "./database/sqlite/prnindices";
//import { PrnInfoSqlite } from "./database/sqlite/prninfo";
//import { DBCONFIG } from "./config/database/sqlite";
//import { SQLite } from "./database/sqlite/DAO";

import { PrnIndicesController } from "./controller/PrnIndices";
import { std, mean } from "mathjs";
import { Satellite } from "gps";
import { PrnInfoControlller } from "./controller/PrnInfo";

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
const DISP = 0.5;
const MIN_QTDE = (60 / TAXA) * DISP;

export class ProcessData {
	private timeController: number;
	private prnInfo: PrnInfoControlller;
	private prnIndices: PrnIndicesController;

	constructor(prnInfoController: PrnInfoControlller, prnIndicesController: PrnIndicesController) {
		if (!prnInfoController || !prnIndicesController) {
			throw new Error('You need to pass the controllers to ProcessData');
		}

		this.prnIndices = prnIndicesController;
		this.prnInfo = prnInfoController;
	}

	public async processData(
		satellite: Satellite[],
		lat: number,
		lon: number,
		time: Date
	) {
		if (!this.timeController) {
			this.timeController = time.getMinutes();
		}

		for (const satelite of satellite) {
			await this.prnInfo.insert(
				satelite.prn,
				satelite.snr,
				satelite.azimuth,
				satelite.elevation,
				lat,
				lon,
				time
			);
		}

		if (
			time.getSeconds() == 0 &&
			time.getMinutes() != this.timeController
		) {
			process.stdout.write(`${time} Salvando prnindices\n`);
			this.timeController= time.getMinutes();

			this.processMinute(time);
		}
	}

	public async processMinute(time: Date) {
		try {
			console.log(`Prossesing prnidices from ${time.toLocaleString('pt-br')}`);
			
			const rows = await this.prnInfo.getGroupedPrn(time);

			//console.log("PrninfoGrouped", rows);
			for (const row of rows) {
				//console.log(row)
				if (row.total >= MIN_QTDE) {
					let vSnr = [];
					let vIntensidadeSinal = [];
					let intensidadeSinalQuadrado = 0;
					let intensidade = 0;

					try {
						const prnData = await this.prnInfo.getByPrn(time, row.prn);
						//console.log('Prn info by binute', prnData[0]);

						prnData.forEach((row) => {
							if (row.snr) {
								// console.log(row.prn + " -->" + row.snr);
								intensidade = Math.pow(10, row.snr / 10);
								//console.log(row.snr);
								vSnr.push(row.snr);
								vIntensidadeSinal.push(intensidade);
								intensidadeSinalQuadrado += Math.pow(
									intensidade,
									2
								);
							}
						});

						if (vSnr.length == 0) {
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
						this.prnIndices.insertProcessedData(
							dpSnr,
							s4,
							time,
							row.prn
						);
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

	async processCustomData(custom: CustomData) {
		if (!this.timeController) {
			this.timeController = custom.time.getMinutes();
		}

		await this.prnInfo.insert(
			custom.prn,
			custom.snr,
			custom.azimuth,
			custom.elevation,
			custom.lat,
			custom.lon,
			custom.time
		);

		if (custom.time && custom.time.getSeconds() == 0 && custom.time.getMinutes() != this.timeController) {
			process.stdout.write(`${custom.time} Salvando prnindices\n`);
			this.timeController = custom.time.getMinutes();
			console.log(this.timeController);

			this.processMinute(custom.time);
		}
	}
}
