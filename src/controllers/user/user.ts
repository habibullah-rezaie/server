import { Request, Response } from "express";
import db from "../../../prisma/prisma";
import { removeAuthCookies } from "../../util/auth";
import { AccessTkPayload } from "../auth/login";

export async function getUserInfo(req: Request, res: Response) {
	const reqUser = req.user as AccessTkPayload | undefined;
	if (!reqUser) {
		return res.status(401).json({ message: "Session Expired." });
	}

	const user = await db.user.findUnique({
		where: { id: reqUser.userId },
	});
	delete (user as { password?: string }).password;

	// Meaning that the req has an accessToken but there doesn't exist any user with the id inside token
	// So the cookies are invalid: delete them
	if (!user) {
		return removeAuthCookies(res)
			.status(401)
			.json({ message: "Session Expired." });
	}

	// remove the password
	return res.status(200).json({ user });
}
