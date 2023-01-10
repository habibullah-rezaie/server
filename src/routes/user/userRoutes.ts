import { Express } from "express";
import getRoutes from "./userGet";

export function addUserRoutes(app: Express) {
	app.use(getRoutes);
}
