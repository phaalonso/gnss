import { PrnIndicesController } from "./PrnIndicesController";
import { PrnInfoModel } from "../../database/mongodb/prninfo";
import { IPrnIndices, PrnIndicesModel } from "../../database/mongodb/prnindices";

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
            .then(() => console.log('Saved prnindice'))
            .catch((err) => {
                console.log(err);
            });
    }
}