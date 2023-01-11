import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import createError from "http-errors";
import db from "./prisma/prisma";
import { authenticateAccessToken } from "./src/middlewares/auth/passportAuth";
import configureRoutes from "./src/routes";

const app = express();

const port = process.env.PORT || "8000";

app.use(cookieParser());
app.use(
	cors({
		origin: /http:\/\/localhost:\d*/,

		credentials: true,
	})
);
app.use(express.json());
app.use(helmet({ crossOriginEmbedderPolicy: false }));
// TODO:  ADD morgan

app.get("/", authenticateAccessToken, (req, res, next) => {
	if (!req.user) {
		return next(createError(400, "AUTHENTICATION NOT WORKED"));
	}
	return res.status(200).json(req.user);
});

configureRoutes(app);

app.listen(port, async () => {
	console.log("Server is running at port " + port);

	seedDb().catch((err) => {
		console.error(err);
		db.$disconnect();
	});
});
