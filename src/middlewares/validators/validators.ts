import { NextFunction, Request, Response } from "express";
import {
	ValidationChain,
	validationResult,
} from "express-validator";

export function withValidation(...validators: ValidationChain[]) {
	return [
		...validators,
		(req: Request, res: Response, next: NextFunction) => {
			const errors = validationResult(req);

			if (!errors.isEmpty()) {
				return res.status(400).json({
					message: errors.array()[0].msg,
					meta: {
						...errors.array()[0],
						value: undefined,
					},
				});
			} else {
				next();
			}
		},
	];
}

