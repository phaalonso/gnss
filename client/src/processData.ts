//import { PrnIndicesSqlite } from "./database/sqlite/prnindices";
//import { PrnInfoSqlite } from "./database/sqlite/prninfo";
//import { DBCONFIG } from "./config/database/sqlite";
//import { SQLite } from "./database/sqlite/DAO";

import { std, mean } from "mathjs";
import { Satellite } from "gps";
import { PrnInfoController } from "./controller/PrnInfo";
import { PrnIndicesController, PrnIndicesSqlite } from "./controller/PrnIndices";
import logger from "./logger";

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
 
export interface LogQtd {
	aumentar: () => void;
	getQtd: () => number;
}

export function logQtd(): LogQtd {
	let quantidade = 0;

	return {
		aumentar: () => {
			quantidade = quantidade + 1;
		},
		getQtd: () => quantidade
	}
}

export class ProcessData {
	private timeController: number;
	private prnInfo: PrnInfoController;
	private prnIndices: PrnIndicesController;
	private qtd: LogQtd;

	constructor(prnInfoController: PrnInfoController, prnIndicesController: PrnIndicesController) {
		if (!prnInfoController || !prnIndicesController) {
			throw new Error('You need to pass the controllers to ProcessData');
		}

		this.prnIndices = prnIndicesController;
		this.prnInfo = prnInfoController;
		this.qtd = logQtd();


		setInterval(async ([prnIndices, prnInfo, qtd]: [PrnIndicesSqlite, PrnInfoController, LogQtd]) => {
			const prninfoLength = await prnInfo.infoLength();
			const prnindicesLength = await prnIndices.indicesLength();

			logger.log(`Quantidade de  dados ${qtd.getQtd()}`);
			logger.log(`Prninfo: ${prninfoLength}`);
			logger.log(`Prnindices: ${prnindicesLength}`);
		}, 1000 * 60, [prnIndicesController, prnInfoController, this.qtd]);
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
			//logger.log(`Prossesing prnidices from ${time.toLocaleString('pt-br')}`);

			const rows = await this.prnInfo.getGroupedPrn(time);

			//logger.log("PrninfoGrouped", rows);
			for (const row of rows) {
				//logger.log(row)
				if (row.total >= MIN_QTDE) {
					let vSnr = [];
					let vIntensidadeSinal = [];
					let intensidadeSinalQuadrado = 0;
					let intensidade = 0;

					try {
						const prnData = await this.prnInfo.getByPrn(time, row.prn);
						//logger.log('Prn info by binute', prnData[0]);

						prnData.forEach((row) => {
							if (row.snr) {
								// logger.log(row.prn + " -->" + row.snr);
								intensidade = Math.pow(10, row.snr / 10);
								//logger.log(row.snr);
								vSnr.push(row.snr);
								vIntensidadeSinal.push(intensidade);
								intensidadeSinalQuadrado += Math.pow(
									intensidade,
									2
								);
							}
						});

						if (vSnr.length == 0) {
							logger.log("vSnr vazio");
							return;
						}

						let dpSnr = std(vSnr);
						intensidadeSinalQuadrado /= vIntensidadeSinal.length;
						let mediaIntensidadeSinalQuadrado = Math.pow(
							mean(vIntensidadeSinal),
							2
						);
						let s4 = Math.sqrt(
							(intensidadeSinalQuadrado -
								mediaIntensidadeSinalQuadrado) /
								mediaIntensidadeSinalQuadrado
						);

						//logger.log("S4", s4);
						this.prnIndices.insertProcessedData(
							dpSnr,
							s4,
							time,
							row.prn
						);
					} catch (err) {
						logger.exception(err);
					}
				}
			}
		} catch (err) {
			logger.exception(err);
			process.exit(1);
		}
	}

	async processCustomData(custom: CustomData) {
		if (!this.timeController) {
			this.timeController = custom.time.getMinutes();
		}

		this.qtd.aumentar();

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
			this.timeController = custom.time.getMinutes();
			logger.log(this.timeController);

			this.processMinute(custom.time);
		}
	}
}
