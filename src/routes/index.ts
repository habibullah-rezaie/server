import { Express } from "express";
import { addUserRoutes } from "./user/userRoutes";
import authRoutes from "./auth/index";
import { addItemRoutes } from "./item/item";
export default function configureRoutes(app: Express) {
	addUserRoutes(app);
	addItemRoutes(app);

	app.use(authRoutes);
}
