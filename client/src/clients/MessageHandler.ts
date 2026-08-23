import logger from "../logger";
import { SignalMetrics } from "../model/SignalMetrics";
import { ProcessData } from "../ProcessData";
import { MessageBuffer } from "./MessageBuffer";

export class MessageHandler {
	constructor(
		private readonly processData: ProcessData,
		private readonly buffer: MessageBuffer
    ) {
    }
    
    async handle(data: Buffer) {
        this.buffer.push(data.toString());

        while (!this.buffer.isDone()) { 
			const message = this.buffer.getMessage();
            if (!message) continue;

            this.processMessage(message);
        }
    }

	private processMessage(message: string) {
		const matchRec = message.match(/^rec_(.*)_(.*)$/);

		if (matchRec?.[1] && matchRec[2]) {
			return;
		}

		// sat_prn_snr_azimuth_elevation_lat_lon_time\n
		const matchCustom = message.match(
			/^sat_(.*)_(.*)_(.*)_(.*)_(.*)_(.*)_(.*)$/
		);

		if (
			matchCustom?.[1] &&
			matchCustom[2] &&
			matchCustom[3] &&
			matchCustom[4] &&
			matchCustom[5] &&
			matchCustom[6] &&
			matchCustom[7]
		) {
			const customData: SignalMetrics = {
				prn: Number.parseInt(matchCustom[1]),
				snr: Number.parseFloat(matchCustom[2]) || null,
				azi: Number.parseFloat(matchCustom[3]) || null,
				elev: Number.parseFloat(matchCustom[4]) || null,
				lat: Number.parseFloat(matchCustom[5]),
				lon: Number.parseFloat(matchCustom[6]),
				time: new Date(Number.parseInt(matchCustom[7])),
			};

			this.processData.sendToBuffer(customData);
			return;
		}

		logger.log(`mensagem inválida  ${message}`);
	}
}