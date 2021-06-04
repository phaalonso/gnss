import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Usuario {
	constructor(nome: string, nickname: string, email: string, senha: string) {
		this.nome = nome;
		this.nickname = nickname;
		this.email = email;
		this.senha = senha;
	}

	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column({ type: 'varchar', length: 50, nullable: false })
	nome: string;

	@Column({ type: 'varchar', length: 50, nullable: false })
	nickname: string;

	@Column({ type: 'varchar', length: 100, nullable: false, unique: true })
	email: string;

	@Column({ type: 'varchar', nullable: false })
	senha: string;

}
