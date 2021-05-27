import { PrnInfoModel } from "../database/mongodb/prninfo";
import { SQLite } from "../database/sqlite/DAO";

export abstract class PrnInfoControlller {
	abstract insert(
		prn: number,
		snr: number,
		azimuth: number,
		elevation: number,
		lat: number,
		lon: number,
		time: Date
	); 

	/**
	 * @description Retorna dados inseridos em prninfo agrupados em um intervalo de um minuto relativo ao parametro time
	 * @param time tempo sera relativo a esse parametro
	 */
	abstract getGroupedPrn(time: Date);

	/**
	 * @description Seleciona prn e snr de determinado prn em um periodo de um minuto relativo ao parametro time
	 * @param time tempo sera relativo a esse parametro
	 * @param prn informa de qual prn será realizado a filtragem
	 */
	abstract getByPrn(time: Date, prn: number);
}

export class PrnInfoMongo {
	insert(
		prn: number,
		snr: number,
		azimuth: number,
		elevation: number,
		lat: number,
		lon: number,
		time: Date
	) {
		return new PrnInfoModel({
			prn,
			snr,
			azi: azimuth,
			elev: elevation,
			lat,
			long: lon,
			time,
		}).save()
		.catch(err => {
			console.log(err);
		});
	}

	/**
	 * @description Retorna dados inseridos em prninfo agrupados em um intervalo de um minuto relativo ao parametro time
	 * @param time tempo sera relativo a esse parametro
	 */
	public getGroupedPrn(time: Date) {
		//console.log('Get gropuped prn');
		return PrnInfoModel.aggregate()
			.match({
				time: {
					$lte: time,
					$gt: new Date(time.getTime() - 1000 * 60),
				},
			})
			.group({
				_id: "$prn",
				total: { $sum: 1 },
			})
			.project({
				_id: false,
				prn: "$_id",
				total: true,
			})
			.exec();
	}

	/**
	 * @description Seleciona prn e snr de determinado prn em um periodo de um minuto relativo ao parametro time
	 * @param time tempo sera relativo a esse parametro
	 * @param prn informa de qual prn será realizado a filtragem
	 */
	public getByPrn(time: Date, prn: number) {
		//return this.dao.all(
		//'SELECT prn, snr FROM prninfo WHERE time BETWEEN ?-60000 AND ? AND prn = ?',
		//[time, time, prn]
		//);
		return PrnInfoModel.find({
			prn: prn,
			time: {
				$lte: time,
				$gt: new Date(time.getTime() - 1000 * 60),
			},
		});
	}
}

export class PrnInfoSqlite extends PrnInfoControlller {
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
