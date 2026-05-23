import { Router, type IRouter } from "express";
import healthRouter from "./health";
import whatsappRouter from "./whatsapp";
import refundClaimsRouter from "./refundClaims";
import leadsRouter from "./leads";
import pincodeRouter from "./pincode";

const router: IRouter = Router();

router.use(healthRouter);
router.use(whatsappRouter);
router.use(refundClaimsRouter);
router.use(leadsRouter);
router.use(pincodeRouter);

export default router;
