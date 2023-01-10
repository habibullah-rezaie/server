import { Express } from "express";
import { addUserRoutes } from "./user/userRoutes";
import authRoutes from "./auth/index";
export default function configureRoutes(app: Express) {
	addUserRoutes(app);

	app.use(authRoutes);
}
