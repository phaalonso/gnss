import { createConnection } from "typeorm"

export const connection = {
	async create() {
		await createConnection();
	}
}
