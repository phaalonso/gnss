import { Document, Model } from "mongoose";
import { SignalMetrics } from "../../../model/SignalMetrics";

// Possue o mesmo formato que SignalMetrics, então posso simplesmente passa-lo aqui
export interface IPrnInfoDocument extends SignalMetrics, Document {}
export interface IPrnInfoModel extends Model<IPrnInfoDocument> {}
