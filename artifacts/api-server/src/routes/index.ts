import { Router, type IRouter } from "express";
import healthRouter from "./health";
import appointmentRequestsRouter from "./appointment-requests";
import adminRouter from "./admin";
import authRouter from "./auth";
import meRouter from "./me";
import inviteRouter from "./invite";
import staffInviteRouter from "./staff-invite";
import storageRouter from "./storage";
import notificationSettingsRouter from "./notification-settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(appointmentRequestsRouter);
router.use(authRouter);
router.use(meRouter);
router.use(inviteRouter);
router.use(staffInviteRouter);
router.use(adminRouter);
router.use(notificationSettingsRouter);

export default router;
