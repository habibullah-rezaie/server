import { Session } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import db from "../../../prisma/prisma";

/**
 * Find any session which has the same id `req.cookies.sid` and store it in `req.session`
 * @param req
 * @param res
 * @param next
 * @returns
 */
export async function parseSessionCookie(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	const sid = req.cookies.sid;

	if (!sid) return next();

	try {
		const session = await db.session.findUnique({ where: { id: sid } });
		if (!session) return next();

		(req as { session?: Session }).session = session;
		next();
	} catch (err) {
		console.error(err);
		next();
	}
}
