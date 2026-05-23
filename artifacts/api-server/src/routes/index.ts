import { Router, type IRouter } from "express";
import healthRouter from "./health";
import whatsappRouter from "./whatsapp";
import refundClaimsRouter from "./refundClaims";

const router: IRouter = Router();

router.use(healthRouter);
router.use(whatsappRouter);
router.use(refundClaimsRouter);

export default router;
