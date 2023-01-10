import { Router } from "express";
import { getUserInfo } from "../../controllers/user/user";
import { authenticateAccessToken } from "../../middlewares/auth/passportAuth";

const router = Router();

router.get("/user", authenticateAccessToken, getUserInfo);

export default router;
