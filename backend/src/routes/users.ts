import { Router } from "express";
import UsuarioController from "../controllers/UsuarioController";
import { Usuario } from "../model/Usuario";

const user = Router();

user.post( '/', async (req, res) => {
	const { nome, nickname, email, senha } = req.body;

	const user = new Usuario(nome, nickname, email, senha);

	const result = await UsuarioController.create(user);

	return res.json(result);
});

export default user;
