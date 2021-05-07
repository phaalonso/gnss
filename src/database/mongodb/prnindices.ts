import { IPrnIndices } from "./prnindices/prnindices.type";
import { PrnIndicesModel } from './prnindices/prnindices.model'
import { PrnInfoModel } from "./prninfo/prninfo.model";

export class PrnIndicesMongo {
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

		return new PrnIndicesModel(data).save()
	}
}
