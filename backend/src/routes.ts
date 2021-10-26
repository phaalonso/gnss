import { Prisma } from "@prisma/client";
import { errors } from "celebrate";
import { Request, Response, Router } from "express";
import { drive } from "node-os-utils";
import sessions from "./routes/sessions";
import user from "./routes/users";

const router = Router();

router.use('/user', user);
router.use('/session', sessions);

router.get('/stats', async (req, res) => {
	const data = await drive.info('/');

	console.log(data);

	return res.json(data);
})

router.use((req, res) => {
	return res.sendStatus(404);
});

router.use(errors());

router.use((error: any, req: Request, res: Response) => {
	console.log('error handler') 
	console.log('Error type', typeof error);
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		console.log(error.message);
		return res.sendStatus(409);
	}
	console.log(error);

	return res.sendStatus(400);
});

export default router;
