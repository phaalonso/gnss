import { ConnectOptions } from "mongoose";
import dotenv from 'dotenv';

dotenv.config()

interface Config {
	url: string;
	options: ConnectOptions;
}

export const MongoConfig: Config = {
	url: process.env.MONGOURI || '',
	options: {
		// Mongoose 5-era options (useNewUrlParser/useCreateIndex/useUnifiedTopology/useFindAndModify/keepAlive/poolSize)
		// were removed in Mongoose 6+; driver defaults apply. maxPoolSize replaces the old poolSize.
		maxPoolSize: 30,
	}
}
