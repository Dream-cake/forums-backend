import { Logger } from '@overnightjs/logger';
import { Connection, createConnection, getRepository, Repository } from 'typeorm';
import { TypeORMModels } from '../Interfaces';
import { HelloWorldModel } from '../Models';

/**
 * @description This serves as an interface for our Database.
 * @author Zoro
 */
export class TypeORMController {
	private handler: Connection;
	private ready: boolean = false;

	public models: TypeORMModels;

	public async createConnection() {
		try {
			this.handler = await createConnection({
				type: 'postgres',
				host: '127.0.0.1', // @TODO: Don't assume the postgres server is on the same machine. read this value from the environment variables instead.
				username: 'postgres',
				database: 'postgres',
				port: 5432,
				entities: [HelloWorldModel] // Don't change this unelss you know what you're doing
			});
		} catch (e) {
			Logger.Err(e, true);
			process.exit(1);
		}

		await this.handler.synchronize();

		this.models = {
			helloWorld: getRepository(HelloWorldModel)
		};

		Object.freeze(this.models); // At this point we've added all of our models. we shouldn't want to add anymore.

		this.ready = true;
	}

	public get connection() {
		return this.handler;
	}

	public getModel<T>(model: string): Repository<T> {
		if (!this.ready) throw new Error('The connection is not ready yet!');
		return this.models[model];
	}
}
