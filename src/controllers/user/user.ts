import { NextFunction, Request, Response } from "express";
import db from "../../../prisma/prisma";
import { removeAuthCookies } from "../../util/auth";
import { AccessTkPayload } from "../auth/login";

export async function getUserInfo(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const reqUser: AccessTkPayload = req.user as any;
	if (!req.user) {
		return res.status(401).json({ message: "Session Expired." });
	}

	const user = await db.user.findUnique({
		where: { id: reqUser.userId },
	});

	// Meaning that the req has an accessToken but there doesn't exist any user with the id inside token
	// So the cookies are invalid: delete them
	if (!user) {
		return;
		removeAuthCookies(res).status(401).json({ message: "Session Expired." });
	}

	// remove the password
	user.password = "";
	(req.user as any).password = undefined;
	return res.status(200).json({ user });
}
