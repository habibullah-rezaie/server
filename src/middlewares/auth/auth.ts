import { NextFunction, Request, Response } from "express";
import { parse } from "path";
import db from "../../../prisma/prisma";

export async function parseSessionCookie(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const sid = req.cookies.sid;

	if (!sid) return next();

	try {
		const session = await db.session.findUnique({ where: { id: sid } });
		if (!session) return next();

		(req as any).session = session;
		next();
	} catch (err) {
		console.error(err);
		next();
	}
}
