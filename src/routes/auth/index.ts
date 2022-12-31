import express from "express";
import login from "../../controllers/auth/login";
import createToken from "../../controllers/auth/token";
import passportAuth, {
	authenticateAccessToken,
	authenticatePasswd,
	authenticateRefreshToken,
} from "./../../middlewares/auth/passportAuth";
const router = express.Router();

router.post("/login", authenticatePasswd, login);

router.post("/token", authenticateRefreshToken, createToken);

export default router;
