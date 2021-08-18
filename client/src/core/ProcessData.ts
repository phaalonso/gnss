import { std, mean } from "mathjs";
import { Satellite } from "gps";
import logger from "../logger";
import { IPrnInfoController } from "./controller/PrnInfoController";
import { IPrnIndicesController } from "./controller/PrnIndicesController";
import config from "../config/ConfigProvider";

export interface CustomData {
	prn: number;
	snr: number;
	azi: number;
	elev: number;
	lat: number;
	lon: number;
	time: Date;
}

const TAXA = 0.1;
const DISP = 0.5;
const MIN_QTDE = (60 / TAXA) * DISP;

export class ProcessData {
	private timeController: number;
	private buffer: CustomData[];

	private interval: number;
	private counter: number;
	private maxCounter: number;

	private logInterval: number;

	//TODO: escolher controllers de acordo com variável do ambiente a qual indica a base de dados
	constructor(
		private prnInfo: IPrnInfoController, 
		private prnIndices: IPrnIndicesController
	) {
		logger.log('Iniciando process data');
		const processConfig = config.get('process');
		this.interval = processConfig.interval;
		this.logInterval = processConfig.logInterval;

		this.counter = 0;
		this.maxCounter = 60000 / this.interval;

		logger.log(`Intervalo entre as inserções na base de dados: ${this.interval}`);
		logger.log(`Counter máximo entre as inserções: (60000 / ${this.interval}) = ${this.maxCounter}`);


		this.buffer = [];

		setInterval(this.logDatabaseSize.bind(this), this.logInterval);
		setInterval(this.processInterval.bind(this), this.interval);
		logger.log('Intervalos setados');
	}

	//TODO: Talvez seja interssante realizar os loggins em um serviço separado
	/**
	* @description realiza o log do tamanho das bases de dados.
	*/
	private async logDatabaseSize() {
		const prninfoLength = await this.prnInfo.infoLength();
		const prnindicesLength = await this.prnIndices.indicesLength();

		// logger.log(`Quantidade de  dados ${qtd}`);
		logger.log(`Prninfo: ${prninfoLength}`);
		logger.log(`Prnindices: ${prnindicesLength}`);
	}

	/**
	 * @description Método responsável por realizar o processamento dos dados após a passagem de determinado intervalo de tempo
	 */
	private async processInterval() {
		if (this.buffer.length == 0)	{
			logger.log('Buffer vazio');
			return;
		}

		const minute = this.buffer[this.buffer.length -1].time;

		const clone = [...this.buffer];

		await this.prnInfo.insertMany(clone);
		logger.log(`Prninfo: inserted ${clone.length} data`);
		this.buffer = [];
		this.counter++;

		if (this.counter >= this.maxCounter) {
			//console.log(this.counter);
			this.counter = 0;
			this.processMinute(minute);
		}
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
			await this.prnInfo.insert(satelite.prn, satelite.snr, satelite.azimuth, satelite.elevation, lat, lon, time);
		}

		if (time.getSeconds() == 0 && time.getMinutes() != this.timeController) {
			process.stdout.write(`${time} Salvando prnindices\n`);
			this.timeController= time.getMinutes();
			await this.processMinute(time);
		}
	}

	public async processMinute(time: Date) {
		try {
			console.log(time.getTime())
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
	async sendToBuffer(custom: CustomData) {
		if (!this.timeController) {
			this.timeController = custom.time.getMinutes();
		}

		this.buffer.push(custom);
	}
}
