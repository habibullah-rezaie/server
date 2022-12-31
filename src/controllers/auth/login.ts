import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const login = (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) {
		return res.status(500).json({ message: "InternalServerError" });
	}

	const { email, role, name } = req.user as User;

	if (email && role && process.env.JWT_REFRESH_SECRET) {
		return jwt.sign(
			{ email, role, name },
			process.env.JWT_REFRESH_SECRET,
			{
				algorithm: "HS256",
				expiresIn: "1d",
			},
			(err, refreshToken) => {
				if (err || !process.env.JWT_ACCESS_SECRET)
					return res.status(500).json({ message: "InternalServerError" });

				return jwt.sign(
					{ email, role, name },
					process.env.JWT_ACCESS_SECRET,
					{
						algorithm: "HS256",
						expiresIn: "1h",
					},
					(err, accessToken) => {
						if (err)
							return res.status(500).json({ message: "InternalServerError" });

						return res
							.cookie("refreshToken", refreshToken, {
								expires: new Date(Date.now() + 86400 * 1000),
								secure: true,
								httpOnly: true,
							})
							.cookie("accessToken", accessToken, {
								expires: new Date(Date.now() + 60 * 1000),
								secure: true,
								httpOnly: true,
							})
							.status(200)
							.json({ ...req.user, password: undefined });
					}
				);
			}
		);
	} else if (!process.env.JWT_REFRESH_SECRET) {
		console.error("No jwt refresh token secret in env");
		return res.status(500).json({ message: "InternalServerError" });
	}

	console.error("Something has went wrong, email or role is in `req.user`");
	res.status(500).json({ message: "InternalServerError" });
};

export default login;
