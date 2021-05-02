import { PrnIndicesModel } from './prnindices/prnindices.model';

export class PrnIndicesMongo {
	insertProcessedData(dpSnr: number, s4: number, time: Date, prn: number) {
		console.log('Inserindo prnindices');
		//return this.dao.run(
		//'INSERT INTO prnindices (prn, mediasnr, mediaazi, mediaelev, tinicial, tfinal, dpsnr, s4) SELECT prn, AVG(snr), AVG(azi), AVG(elev), min(time), max(time), ?, ? from prninfo where time between ?-60000 and ? and prn = ? group by prn',
		//[dpSnr, s4, time, time, prn]
		//);

		const agregate = PrnIndicesModel
			.aggregate()
			.match({
				time: {
					$lte: time,
					$gt: new Date(time.getTime() - 1000 * 60),
				},
			})
			.group({
				_id: "$prn",
				avgSnr: { $avg: "$snr" },
				avgAzi: { $avg: "$azi" },
				avgElev: { $avg: "$elev" },
				minTime: { $min: "$time" },
				maxTime: { $max: "$time" },
			});

		console.log(agregate);
	}
}
