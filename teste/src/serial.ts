import { PrnIndicesSqlite } from "./controller/PrnIndicesSqlite";
import { PrnInfoSqlite } from "./controller/PrnInfoSqlite";
import { SQLite } from "./database/DAO";
import { DataProvider } from "./services/GnssDataStream";
import logger from "./logger";
import { CustomData } from "./services/processData";
import { WorkerPool } from "./worker/WorkerPool";

const dao = new SQLite();
const prnInfo = new PrnInfoSqlite(dao);
const prnIndices = new PrnIndicesSqlite(dao)

let dataBuffer: CustomData[] = [];

// Intervalo entre as inserções
const interval = 15000;

// Quantidade minima de inserções para executar a query
const minCounter = 60000 / interval;

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
	//const pool = new WorkerPool(os.cpus().length);
	const pool = new WorkerPool(2);

	try {
		await prnInfo.createTable();
		await prnIndices.createTable();

		const dataStream = new DataProvider();
		dataStream.setSerialInput('/dev/ttyUSB0');

		dataStream.pipeToGps();

		const qtd = logQtd();

		let counter = 0;
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
						azi: satelite.azimuth,
						elev: satelite.elevation,
						lat: lat,
						lon: lon,
						time: time,
					};

					dataBuffer.push(customData);
					// processData.processCustomData(customData);
				}

			}
		});

		setInterval(() => {
			/**
			* É executada a cada 15 segundos e processa os dados obtidos até então
			* após o processamento limpa o array de dados
			*/
			logger.log(`Adding new task to the queue! ${dataBuffer.length} objects`)
			const task_time = dataBuffer[0].time;

			pool.runTask({ data: dataBuffer }, (err, data) => {
				logger.log('Task done!');
				if (err) {
					logger.exception(err);
					return;
				}

				logger.log(data);
				counter++;

				// Garante que no determinado minuto os dados já foram processados
				if (counter >= minCounter) {
					logger.log(`Processing minute for ${time.toLocaleTimeString('pt-br')}`);
					pool.runTask({ time: task_time }, (err, data) => {
						if (err) {
							logger.exception(err);
							return;
						}

						logger.log('Processingo of minute was finished');
					});
					counter = 0;
				}
			});

			dataBuffer = [];
		}, interval);

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
