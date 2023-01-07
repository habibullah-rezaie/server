import { Response } from "express";

export function removeAuthCookies(res: Response) {
	return res
		.cookie("refreshToken", "", {
			expires: new Date(0),
			httpOnly: true,
			secure: true,
		})
		.cookie("accessToken", "", {
			expires: new Date(0),
			httpOnly: true,
			secure: true,
		})
		.cookie("sid", "", {
			expires: new Date(0),
			httpOnly: true,
			secure: true,
		});
}
