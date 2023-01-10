import { Session } from "@prisma/client";
import { Request, Response } from "express";
import db from "../../../prisma/prisma";
import { removeAuthCookies } from "../../util/auth";
import { RefreshTkPayload } from "./login";

const logout = async (req: Request, res: Response) => {
	const session = (req as { session?: Session }).session;
	const reqUser = (req as { user?: RefreshTkPayload }).user;

	if (!session || !reqUser)
		return removeAuthCookies(res)
			.status(400)
			.json({ message: "Invalid session" });

	if (session.logoutTime)
		return removeAuthCookies(res)
			.status(400)
			.json({ message: "Session Expired" });

	try {
		await db.session.update({
			where: { id: session.id },
			data: { logoutTime: new Date() },
			select: null,
		});

		return removeAuthCookies(res).status(205).send();
	} catch (err) {
		return removeAuthCookies(res)
			.status(500)
			.json({ message: "Something Went wrong" });
	}
};

export default logout;
