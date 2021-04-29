import { Schema } from "mongoose"

const { Number, Date } = Schema.Types;

const PrnIndicesSchema = new Schema({
	prn: {
		type: Number,
		required: true,
	},
	mediasnr: {
		type: Number,
		required: true,
	},
	mediaazi: {
		type: Number,
		required: true,
	},
	mediaelev: {
		type: Number,
		required: true,
	},
	tininical: {
		type: Number,
		required: true,
	},
	dpsnr: {
		type: Number,
		required: true,
	},
	s4: {
		type: Number,
		required: true,
	}
});

export default PrnIndicesSchema;
