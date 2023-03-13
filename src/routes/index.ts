import { Express } from "express";
import { addUserRoutes } from "./user/userRoutes";
import authRoutes from "./auth/index";
import { addItemRoutes } from "./item/item";
import addSellRoutes from "./sell/sellRoutes";
export default function configureRoutes(app: Express) {
	addUserRoutes(app);
	addItemRoutes(app);
	addSellRoutes(app);

	app.use(authRoutes);
}
