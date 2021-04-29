import { SQLite } from "./DAO"

export class PrnIndicesSqlite {
	private dao: SQLite;

	constructor(dao: SQLite) {
		this.dao = dao;
	}

	createTable() {
		const sql = `
			CREATE TABLE if not exists prnindices (
				prn INTEGER,
				mediasnr REAL,
				mediaazi REAL,
				mediaelev REAL,
				tinicial TEXT,
				tfinal TEXT,
				dpsnr REAL,
				s4 REAL
			)
		`;

		return this.dao.run(sql);
	}

	insertProcessedData(dpSnr: number, s4: number, time: Date, prn: number) {
		return this.dao.run(
			'INSERT INTO prnindices (prn, mediasnr, mediaazi, mediaelev, tinicial, tfinal, dpsnr, s4) SELECT prn, AVG(snr), AVG(azi), AVG(elev), min(time), max(time), ?, ? from prninfo where time between ?-60000 and ? and prn = ? group by prn',
			[dpSnr, s4, time, time, prn]
		);
	}
}
