import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import {
	NextFunction as ExNextFn,
	Request as ExRequest,
	Response as ExResponse,
} from "express";
import createError, { HttpError } from "http-errors";
import { default as pssPrt, default as refreshTkPassport } from "passport";
import { Strategy as JWTStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import {
	AccessTkPayload,
	RefreshTkPayload,
} from "../../controllers/auth/login";
import db from "./../../../prisma/prisma";

// TODO:
// Write some tests for these endpoints
const localStrategy = new LocalStrategy(
	{
		usernameField: "email",
		passwordField: "password",
		session: false,
	},
	function (email, passwd, done) {
		const error = createError(401, {
			message: "Invalid Email or Password",
			stack: null,
		});

		db.user
			.findUnique({ where: { email } })
			.then(async (usr) => {
				if (!usr) {
					return done(error);
				}

				const compareRes = await bcrypt.compare(passwd, usr.password);

				if (!compareRes) return done(error);
				done(null, usr);
			})
			.catch((err) => {
				const error = createError(500, err, {});

				console.error(error);
				error.expose = false;
				done(error);
			});
	}
);

export function authenticatePasswd(
	req: ExRequest,
	res: ExResponse,
	next: ExNextFn
) {
	const { email, password } = req.body;
	if (!email || !password) {
		return res
			.status(400)
			.json(
				createError(400, "Email or password not provided", { stack: false })
			);
	}

	pssPrt.authenticate("local", handlePassportAuth(req, res, next))(
		req,
		res,
		next
	);
}

const accessTokenStrategy = new JWTStrategy(
	{
		jwtFromRequest(req) {
			const accessToken = req.cookies.accessToken;

			if (!accessToken) return null;

			return accessToken;
		},
		secretOrKey: process.env.JWT_ACCESS_SECRET,
		algorithms: ["HS256"],
	},
	(payload: AccessTkPayload, done) => {
		const error = createError.Unauthorized("Invalid accessToken");
		error.stack = undefined;
		if (!payload) {
			return done(error);
		}
		const { userId, role } = payload;

		if (!userId || !role) {
			return done(error);
		}
		done(null, { id: userId, role });
	}
);

export function authenticateAccessToken(
	req: ExRequest,
	res: ExResponse,
	next: ExNextFn
) {
	if (!req.cookies.accessToken) {
		return res
			.status(401)
			.json(createError.Unauthorized("Invalid accessToken"));
	}

	pssPrt.authenticate(
		"jwt",
		{ session: false, failureMessage: true },
		handlePassportAuth(req, res, next)
	)(req, res, next);
}

const refreshTkAuthStrategy = new JWTStrategy(
	{
		jwtFromRequest(req) {
			const refreshTk = req.cookies.refreshToken;

			if (!refreshTk) return null;

			return refreshTk;
		},
		secretOrKey: process.env.JWT_REFRESH_SECRET,
		algorithms: ["HS256"],
	},
	(payload: RefreshTkPayload, done) => {
		const error = createError.Unauthorized("Invalid accessToken");
		error.stack = undefined;
		if (!payload) {
			return done(error);
		}
		const { userId, role, sid } = payload;

		if (!userId || !role) {
			return done(error);
		}

		done(null, { userId, role, sid });
	}
);

export function authenticateRefreshToken(
	req: ExRequest,
	res: ExResponse,
	next: ExNextFn
) {
	if (!req.cookies.refreshToken) {
		return res
			.status(401)
			.json(createError.Unauthorized("Invalid refreshToken"));
	}

	refreshTkPassport.authenticate(
		"jwt",
		{ session: false, failureMessage: true },
		handlePassportAuth(req, res, next)
	)(req, res, next);
}

function handlePassportAuth(req: ExRequest, res: ExResponse, next: ExNextFn) {
	return (error: HttpError, user: User) => {
		if (!error && user) {
			req.user = user;
			next();
		}

		if (!error) return;

		if (error.status >= 500) {
			console.error(error);
			error.message = "InternalServerError";
		}

		error.stack = undefined;
		return res.status(error.status).json({ message: error.message });
	};
}

pssPrt.use(accessTokenStrategy);
pssPrt.use(localStrategy);

refreshTkPassport.use(refreshTkAuthStrategy);
export default pssPrt;
