import { Role, User } from "@prisma/client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "../../../prisma/prisma";

export type RefreshTkPayload = {
	role: Role;
	userId: string;
	sid: string;
};

export type AccessTkPayload = Omit<RefreshTkPayload, "sid">;

const login = async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(500).json({ message: "InternalServerError" });
	}

	const { role, id: userId } = req.user as User;

	if (!userId || !role) {
		console.error("Something has went wrong, email or role is in `req.user`");
		res.status(500).json({ message: "InternalServerError" });
	}

	if (!process.env.JWT_REFRESH_SECRET) {
		console.error("No jwt refresh token secret in env");
		return res.status(500).json({ message: "InternalServerError" });
	}

	try {
		const session = await db.session.create({
			data: { user: { connect: { id: userId } }, loginTime: new Date() },
			select: { id: true },
		});

		const refreshTkPayload: RefreshTkPayload = {
			role,
			userId,
			sid: session.id,
		};
		return jwt.sign(
			refreshTkPayload,
			process.env.JWT_REFRESH_SECRET,
			{
				algorithm: "HS256",
				expiresIn: "1d",
			},
			(err, refreshToken) => {
				// Clean the session created previously
				if (err || !process.env.JWT_ACCESS_SECRET) {
					console.error(err);
					return db.session
						.delete({ where: { id: session.id }, select: null })
						.then(() => {
							res.status(500).json({ message: "InternalServerError" });
						});
				}

				const accessTkPayload: AccessTkPayload = {
					role,
					userId,
				};
				return jwt.sign(
					accessTkPayload,
					process.env.JWT_ACCESS_SECRET,
					{
						algorithm: "HS256",
						expiresIn: "1h",
					},
					(err, accessToken) => {
						if (err) {
							return db.session
								.delete({
									where: { id: session.id },
									select: null,
								})
								.then(() => {
									res.status(500).json({ message: "InternalServerError" });
								});
						}

						// session expires in 1 day
						const sessionExpDate = new Date(Date.now() + 86400 * 1000);
						return res
							.cookie("refreshToken", refreshToken, {
								expires: sessionExpDate,
								secure: true,
								httpOnly: true,
							})
							.cookie("accessToken", accessToken, {
								expires: new Date(Date.now() + 3600 * 1000), // expires in 1 hour
								secure: true,
								httpOnly: true,
							})
							.cookie("sid", session.id, {
								expires: sessionExpDate,
								secure: true,
								httpOnly: true,
							})
							.status(200)
							.json({ user: { ...req.user, password: undefined } });
					}
				);
			}
		);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "InternalServerError" });
	}
};

export default login;
