import { getRepository } from "typeorm";
import { Usuario } from "../model/Usuario";
import bcrypt from 'bcrypt';

export const UsuarioController = {
	async index(): Promise<Usuario[]> {
		return new Promise((resolve, reject) => {
			const repo = getRepository(Usuario);

			repo.find()
				.then(result => resolve(result))
				.catch(err => reject(err));
		});
	},

	async findById(id: number): Promise<Usuario> {
		return new Promise((resolve, reject) => {
			const repo = getRepository(Usuario);

			repo.findOne(id)
				.then(u => resolve(u))
				.catch(err => reject(err));
		})
	},

	async create(user: Usuario): Promise<Usuario> {
		return new Promise((resolve, reject) => {
			const repo = getRepository(Usuario);

			bcrypt.hash(user.senha, 8)
				.then(senha => {
					user.senha = senha

					repo.save(user)
					.then(u => {
						delete u.senha;
						resolve(u);
					})
					.catch(err => reject(err))
				}).catch(err => reject(err))
		});
	}

}
