import { SocketClient } from "./clients/SocketClient";
import config from "./config/ConfigProvider";
import { IPrnIndicesController, IPrnInfoController } from "./controller";
import { ProcessData } from "./ProcessData";

export class Application {
    private client: SocketClient;
    private processData: ProcessData;

    constructor(
        private prnInfoController: IPrnInfoController,
        private prnIndicesController: IPrnIndicesController
    ) {
		const clientConfig = config.get('client');

        this.processData = new ProcessData(prnInfoController, prnIndicesController);
		this.client = new SocketClient(this.processData,  { 
			port: clientConfig.port, 
			host: clientConfig.host 
		});
    }

    async run(cb: Function) {
        return this.client.run(cb);
    }
}