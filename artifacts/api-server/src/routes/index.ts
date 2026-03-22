import { Router, type IRouter } from "express";
import healthRouter from "./health";
import appointmentRequestsRouter from "./appointment-requests";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(appointmentRequestsRouter);
router.use(adminRouter);

export default router;
