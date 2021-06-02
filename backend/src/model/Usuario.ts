import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Usuario {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column({ type: 'varchar', length: 50, nullable: false })
	nome: string;

	@Column({ type: 'varchar', length: 50, nullable: false })
	nickname: string;

	@Column({ type: 'varchar', nullable: false })
	senha: string;

}
