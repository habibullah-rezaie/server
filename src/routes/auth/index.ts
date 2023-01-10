import express from "express";
import login from "../../controllers/auth/login";
import logout from "../../controllers/auth/logout";
import createToken from "../../controllers/auth/token";
import { parseSessionCookie } from "../../middlewares/auth/auth";
import {
	authenticateAccessToken,
	authenticatePasswd,
	authenticateRefreshToken,
} from "./../../middlewares/auth/passportAuth";
const router = express.Router();

router.post("/login", authenticatePasswd, login);

router.post(
	"/token",
	parseSessionCookie,
	authenticateRefreshToken,
	createToken
);

router.delete("/logout", parseSessionCookie, authenticateAccessToken, logout);

export default router;
