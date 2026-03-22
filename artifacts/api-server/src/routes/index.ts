import { Router, type IRouter } from "express";
import healthRouter from "./health";
import appointmentRequestsRouter from "./appointment-requests";

const router: IRouter = Router();

router.use(healthRouter);
router.use(appointmentRequestsRouter);

export default router;
