import { SQLite } from "../database/DAO";
import { PrnInfoController } from "../../core/controller/PrnInfoController";
import logger from "../../../../dataProvider/src/logger";
import { trackPromises } from "../../utils/trackPromises";
import { CustomData } from "../../core/ProcessData";

export class PrnInfoSqlite extends PrnInfoController {
	private dao: SQLite;

	/**
	 * @description Construtor com injeção do DAO Sqlite
	 */
	constructor(dao: SQLite) {
		super();
		this.dao = dao;
	}

	/**
	 * @description Cria a tabela prninfo se ela não existir
	 */
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

	insert(prn: number, snr: number, azimuth: number, elevation: number, lat: number, lon: number, time: Date) {
		const promise = this.dao.run(
			'INSERT INTO prninfo (prn, snr, azi, elev, lat, long, time) VALUES(?,?,?,?,?,?,?)',
			[prn, snr, azimuth, elevation, lat, lon, time]
		);

		//return trackPromises(promise);
		return promise;
	}

	insertMany(data: CustomData[]) {
		const placeholder = data.map(() => ('(?,?,?,?,?,?,?)')).join(',');
		const query = 'INSERT INTO prninfo (prn, snr, azi, elev, lat, long, time) VALUES ' + placeholder;

		const flatList = [];

		for (const d of data) {
			flatList.push(d.prn, d.snr, d.azi, d.elev, d.lat, d.lon, d.time.getTime());
		}

		return this.dao.run(query, flatList);
	}

	/**
	 * @description Retorna dados inseridos em prninfo agrupados em um intervalo de um minuto relativo ao parametro time
	 * @param time tempo sera relativo a esse parametro
	 */
	public getGroupedPrn(time: Date): Promise<any> {
		const promise = this.dao.all(
			'select prn, count(snr) as total from prninfo where time between ?-60000 and ? group by prn',
			[time, time]
		);

		return trackPromises(promise);
	}

	/**
	 * @description Seleciona prn e snr de determinado prn em um periodo de um minuto relativo ao parametro time
	 * @param time tempo sera relativo a esse parametro
	 * @param prn informa de qual prn será realizado a filtragem
	 */
	public getByPrn(time: Date, prn: number): Promise<any> {
		const promise = this.dao.all(
			'SELECT prn, snr FROM prninfo WHERE time BETWEEN ?-60000 AND ? AND prn = ?',
			[time, time, prn]
		);

		return trackPromises(promise);
	}

	async infoLength(): Promise<number> {
		const sql = "SELECT COUNT(*) as total FROM prninfo";

		const res: any = await this.dao.get(sql);

		return res.total;
	}
}
