import { IPrnIndices, PrnIndicesModel } from "../database/mongodb/prnindices";
import { PrnInfoModel } from "../database/mongodb/prninfo";
import { SQLite } from "../database/sqlite/DAO";
import { Error } from 'mongoose';

export abstract class PrnIndicesController {
	abstract insertProcessedData(
		dpSnr: number,
		s4: number,
		time: Date,
		prn: number
	);
}

export class PrnIndicesMongo extends PrnIndicesController {
	async insertProcessedData(
		dpSnr: number,
		s4: number,
		time: Date,
		prn: number
	) {
		const minTime = new Date(time.getTime() - 1000 * 60);

		const [agregate] = await PrnInfoModel.aggregate([
			{
				$match: {
					time: {
						$lte: time,
						$gt: minTime,
					},
					prn,
				},
			},
			{
				$group: {
					_id: "$prn",
					avgSnr: { $avg: "$snr" },
					avgAzi: { $avg: "$azi" },
					avgElev: { $avg: "$elev" },
					minTime: { $min: "$time" },
					maxTime: { $max: "$time" },
				},
			},
		]).exec();

		const data: IPrnIndices = {
			prn,
			mediasnr: agregate.avgSnr,
			mediaazi: agregate.avgAzi,
			mediaelev: agregate.avgElev,
			minTime: minTime,
			maxTime: time,
			dpsnr: dpSnr,
			s4,
		};

		return new PrnIndicesModel(data)
			.save()
			.then(w => console.log('Saved prnindice'))
			.catch((err) => {
			    console.log(err);
			});
	}
}

export class PrnIndicesSqlite extends PrnIndicesController {
	private dao: SQLite;

	constructor(dao: SQLite) {
		super();
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
			"INSERT INTO prnindices (prn, mediasnr, mediaazi, mediaelev, tinicial, tfinal, dpsnr, s4) SELECT prn, AVG(snr), AVG(azi), AVG(elev), min(time), max(time), ?, ? from prninfo where time between ?-60000 and ? and prn = ? group by prn",
			[dpSnr, s4, time, time, prn]
		);
	}
}
