import { SQLite } from "./DAO"

export class PrnInfoSqlite {
	private dao: SQLite;

	/**
	 * @description Construtor com injeção do DAO Sqlite
	 */
	constructor(dao: SQLite) {
		this.dao = dao;
	}

	/**
	 * @description Cria a tabela prninfo se ela não existir
	 */
	createTable() {
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
		return this.dao.run(
			'INSERT INTO prninfo (prn, snr, azi, elev, lat, long, time) VALUES(?,?,?,?,?,?,?)',
			[prn, snr, azimuth, elevation, lat, lon, time]
		);
	}

	/**
	 * @description Retorna dados inseridos em prninfo agrupados em um intervalo de um minuto relativo ao parametro time
	 * @param time tempo sera relativo a esse parametro
	 */
	public getGroupedPrn(time: Date): Promise<any> {
		return this.dao.all(
			'select prn, count(snr) as total from prninfo where time between ?-60000 and ? group by prn',
			[time, time]
		);
	}

	/**
	 * @description Seleciona prn e snr de determinado prn em um periodo de um minuto relativo ao parametro time
	 * @param time tempo sera relativo a esse parametro
	 * @param prn informa de qual prn será realizado a filtragem
	 */
	public getByPrn(time: Date, prn: number): Promise<any> {
		return this.dao.all(
			'SELECT prn, snr FROM prninfo WHERE time BETWEEN ?-60000 AND ? AND prn = ?',
			[time, time, prn]
		);
	}
}
