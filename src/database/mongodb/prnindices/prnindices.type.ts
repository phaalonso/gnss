import { Document, Model } from "mongoose";
 
export interface IPrnIndices {
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
}

export interface IPrnIndicesDocument extends IPrnIndices, Document {}
export interface IPrnIndicesModel extends Model<IPrnIndicesDocument> {}
