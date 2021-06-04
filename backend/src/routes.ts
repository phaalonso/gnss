import { Router } from "express";
import sessions from "./routes/sessions";
import user from "./routes/users";

const router = Router();

router.use('/user', user);
router.use('/sessions', sessions);

export default router;
