import { std, mean } from "mathjs";
import { Satellite } from "gps";
import logger from "./logger";
import { IPrnInfoController } from "./controller/IPrnInfoController";
import { IPrnIndicesController } from "./controller/IPrnIndicesController";
import config from "./config/ConfigProvider";
import { SignalMetrics } from "./model/SignalMetrics";

const TAXA = 0.1;
const DISP = 0.5;
const MIN_QTDE = (60 / TAXA) * DISP;

export class ProcessData {
	private timeController: number;
	private buffer: SignalMetrics[];

	private interval: number;
	private counter: number;
	private maxCounter: number;

	private logInterval: number;

	constructor(
		private prnInfoController: IPrnInfoController,
		private prnIndicesController: IPrnIndicesController
	) {
		const processConfig = config.get('process');

		logger.log('Iniciando ProcessData');

		this.interval = processConfig.interval;
		this.logInterval = processConfig.logInterval;

		this.buffer = [];
		this.counter = 0;
		this.maxCounter = 60000 / this.interval;

		logger.log(`Intervalo entre as inserções na base de dados: ${this.interval / 1000} segundos`);
		logger.log(`Counter máximo entre as inserções: (60000 / ${this.interval}) = ${this.maxCounter}`);

		this.setupDBSizeLog(this.logInterval);
		this.setupProcess(this.interval);
	}

	/**
	 * @param interval interval in ms to log the database size
	 */
	private setupDBSizeLog(interval: number): NodeJS.Timeout {
		async function logDbSize() {
			const prninfoLength = await this.prnInfoController.countRows();
			const prnindicesLength = await this.prnIndicesController.indicesLength();

			// logger.log(`Quantidade de  dados ${qtd}`);
			logger.log(`Prninfo: ${prninfoLength}`);
			logger.log(`Prnindices: ${prnindicesLength}`);
		}

		return setInterval(
			logDbSize.bind(this), 
			interval
		);
	}

	private setupProcess(interval: number): NodeJS.Timeout {
		async function processInterval() {
			if (this.buffer.length == 0) {
				logger.log('Buffer vazio');
				return;
			}

			const minute = this.buffer[this.buffer.length - 1].time;

			const clone = [...this.buffer];

			await this.prnInfoController.insertMany(clone);
			logger.log(`Prninfo: inserted ${clone.length} data`);
			this.buffer = [];
			this.counter++;

			if (this.counter >= this.maxCounter) {
				//console.log(this.counter);
				this.counter = 0;
				this.processMinute(minute);
			}
		}

		return setInterval(
			processInterval.bind(this),
			interval
		);
	}

	/**
	 * @description função utilizada para inserir dados no DB assim que estes forem recebidos
	 * @deprecated
	 */
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
			await this.prnInfoController.insert({
				prn: satelite.prn,
				snr: satelite.snr, 
				azi: satelite.azimuth, 
				elev: satelite.elevation, 
				lat, 
				lon, 
				time
			});
		}

		if (this.passouUmMinuto(time)) {
			logger.log(`${time} Salvando prnindices\n`);
			this.timeController = time.getMinutes();
			await this.processMinute(time);
		}
	}

	public passouUmMinuto(time: Date): boolean {
		return time.getSeconds() == 0 && time.getMinutes() != this.timeController;
	}

	public async processMinute(time: Date) {
		try {
			logger.log(`Salvando prnindices relacioando a ${time.toISOString()}!`)

			const rows = await this.prnInfoController.groupByPrn(time);

			//logger.log("PrninfoGrouped", rows);
			for (const row of rows) {
				//logger.log(row)
				if (row.total >= MIN_QTDE) {
					let vSnr = [];
					let vIntensidadeSinal = [];
					let intensidadeSinalQuadrado = 0;
					let intensidade = 0;

					try {
						const prnData = await this.prnInfoController.findByPrn(time, row.prn);
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
						this.prnIndicesController.insertProcessedData(
							dpSnr,
							s4,
							time,
							row.prn
						);
					} catch (err) {
						console.log(err);
						logger.exception(err);
					}
				}
			}
		} catch (err) {
			logger.exception(err);
			process.exit(1);
		}
	}

	/**
	 * @description Função responsável por enfilerar os dados no buffer, antes que sejam processados
	 */
	async sendToBuffer(custom: SignalMetrics) {
		if (!this.timeController) {
			this.timeController = custom.time.getMinutes();
		}

		this.buffer.push(custom);
	}
}
