import { Router, type IRouter } from "express";
import healthRouter from "./health";
import whatsappRouter from "./whatsapp";
import refundClaimsRouter from "./refundClaims";
import leadsRouter from "./leads";

const router: IRouter = Router();

router.use(healthRouter);
router.use(whatsappRouter);
router.use(refundClaimsRouter);
router.use(leadsRouter);

export default router;
