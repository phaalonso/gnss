import { SQLite } from "../database/DAO";
import { IPrnInfoController } from "../../controller/IPrnInfoController";
import logger from "../../../../dataProvider/src/logger";
import { trackPromises } from "../../utils/trackPromises";
import { SignalMetrics } from "../../model/SignalMetrics";

export class PrnInfoSqlite implements IPrnInfoController {
	constructor(
		private dao: SQLite
	) { }

	async createTable() {
		logger.log('Criando prninfo');
		const sql = `
			CREATE TABLE IF NOT EXISTS prninfo (
				prn INTEGER,
				snr REAL,
				azi REAL,
				elev REAL,
				lat REAl,
				long REAL,
				time TEXT
			)
		`;

		return this.dao.run(sql);
	}

	/**
	 * @description constrói parte da mensagem de inserção, para cada valor recebido 
	 * @param data - Métricas do sinal
	 * @returns values com o formato necessário para inserção
	 */
	mapData(data: SignalMetrics[]) {
		return data.map(cd => (`(${cd.prn},${cd.snr},${cd.azi},${cd.elev},${cd.lat},${cd.lon},${cd.time.toISOString()})`)).join(',');
	}

	insert(metric: SignalMetrics) {
		const values = this.mapData([metric]);
		const query = 'INSERT INTO prninfo (prn, snr, azi, elev, lat, long, time) VALUES ' + values;

		return this.dao.run(query);
	}

	insertMany(data: SignalMetrics[]) {
		const values = this.mapData(data);
		const query = 'INSERT INTO prninfo (prn, snr, azi, elev, lat, long, time) VALUES ' + values;

		return this.dao.run(query);
	}

	/**
	 * @description Retorna dados inseridos em prninfo agrupados em um intervalo de um minuto relativo ao parametro time
	 * @param time tempo sera relativo a esse parametro
	 */
	public groupByPrn(time: Date): Promise<any> {
		const promise = this.dao.all(
			'SELECT prn, COUNT(snr) AS total FROM prninfo WHERE time BETWEEN ?-60000 AND ? GROUP BY prn',
			[time.toISOString(), time.toISOString()]
		);

		return trackPromises(promise);
	}

	/**
	 * @description Seleciona prn e snr de determinado prn em um periodo de um minuto relativo ao parametro time
	 * @param time tempo sera relativo a esse parametro
	 * @param prn informa de qual prn será realizado a filtragem
	 */
	public findByPrn(time: Date, prn: number): Promise<any> {
		const promise = this.dao.all(
			'SELECT prn, snr FROM prninfo WHERE time BETWEEN ?-60000 AND ? AND prn = ?',
			[time, time, prn]
		);

		return trackPromises(promise);
	}

	async countRows(): Promise<number> {
		const sql = "SELECT COUNT(*) AS total FROM prninfo";

		const res: any = await this.dao.get(sql);

		return res.total;
	}
}
