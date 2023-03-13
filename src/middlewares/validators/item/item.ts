import { ValidationChain } from "express-validator";
import db from "../../../../prisma/prisma";

/**
 * checks if there is an item with given name
 * @param inputName given name
 * @param negate Boolean if given will check that item should not exist
 */
export function checkItemExistance(
	conf: {
		existance: boolean;
	} = {
		existance: true,
	}
) {
	const { existance } = conf;
	return async (inputName: string) => {
		let error = null;
		try {
			const item = await db.item.findUnique({
				where: { name: inputName },
				select: null,
			});

			console.log(item, existance, inputName);
			if (!existance && item) {
				error = new Error("محصول از قبل موجود است");
			} else if (existance && !item) {
				error = new Error("محصول از قبل موجود تیست");
			}
		} catch (err) {
			console.error(err);
			throw new Error("خطا غیر منتظره رخ داده است");
		}

		if (error) throw error;
	};
}

export function checkValidItemName(chain: ValidationChain): ValidationChain {
	return chain
		.exists()
		.withMessage("نام محصول ضروری است")
		.bail()
		.isString()
		.isLength({ max: 100, min: 3 })
		.withMessage("نام محصول باید بین ۳ تا ۱۰۰ حرف باشد")
		.bail();
}
