import { Router } from "express";
import bicycleRoutes from "../modules/bicycles/bicycle.routes";
import brandRoutes from "../modules/brands/brand.routes";
import bicycleDetailRoutes from "../modules/bicycle-details/bicycle-detail.routes";
import orderRoutes from "../modules/orders/order.routes";
import customerRoutes from "../modules/customers/customer.routes";

const router = Router();

router.use("/bicycles", bicycleRoutes);
router.use("/brands", brandRoutes);
router.use("/bicycle-details", bicycleDetailRoutes);
router.use("/customers", customerRoutes);
router.use("/orders", orderRoutes);

export default router;