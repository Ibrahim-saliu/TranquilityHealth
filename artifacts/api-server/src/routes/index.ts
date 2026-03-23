import { Router, type IRouter } from "express";
import healthRouter from "./health";
import appointmentRequestsRouter from "./appointment-requests";
import adminRouter from "./admin";
import authRouter from "./auth";
import inviteRouter from "./invite";

const router: IRouter = Router();

router.use(healthRouter);
router.use(appointmentRequestsRouter);
router.use(authRouter);
router.use(inviteRouter);
router.use(adminRouter);

export default router;
