import express from "express";
import login from "../../controllers/auth/login";
import createToken from "../../controllers/auth/token";
import { getUserInfo } from "../../controllers/user/user";
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

router.get("/user", authenticateAccessToken, getUserInfo);

export default router;
