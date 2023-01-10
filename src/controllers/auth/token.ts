import { Session } from "@prisma/client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { removeAuthCookies } from "../../util/auth";
import { AccessTkPayload, RefreshTkPayload } from "./login";

const createToken = async (req: Request, res: Response) => {
	const session = (req as { session?: Session }).session;
	if (!session || session.logoutTime) {
		return removeAuthCookies(res)
			.status(401)
			.json({ message: "Session expired" });
	}

	if (!req.user) {
		return res.status(500).json({ message: "InternalServerError" });
	}

	// added an sid when athenticating with refreshToken
	const reqUser = req.user as RefreshTkPayload;

	if (!reqUser.userId || !reqUser.role) {
		console.error("Something has went wrong, email or role is in `req.user`");
		res.status(500).json({ message: "InternalServerError" });
	}

	if (!process.env.JWT_ACCESS_SECRET) {
		console.error(new Error("No access token in environment variables"));
		return res.status(500).json({ message: "InternalServerError" });
	}

	const tokenPayload: AccessTkPayload = {
		role: reqUser.role,
		userId: reqUser.userId,
	};

	return jwt.sign(
		tokenPayload,
		process.env.JWT_ACCESS_SECRET,
		{
			algorithm: "HS256",
			expiresIn: "1h",
		},
		(err, accessToken) => {
			if (err) return res.status(500).json({ message: "InternalServerError" });

			return res
				.cookie("accessToken", accessToken, {
					expires: new Date(Date.now() + 3600 * 1000),
					secure: true,
					httpOnly: true,
				})
				.status(200)
				.send();
		}
	);
};

export default createToken;
