import { Express } from "express";
import newSellRoutes from "./newSell";

export default function addSellRoutes(app: Express) {
	const base = "/sell";
	app.use(base, newSellRoutes);
}
