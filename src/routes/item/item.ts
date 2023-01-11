import { Express, Router } from "express";
import { body } from "express-validator";
import { createItem } from "../../controllers/item/item";
import { checkCompanyAlreadyExists } from "../../middlewares/validators/company";
import { checkItemAlreadyExists } from "../../middlewares/validators/item/item";
import { withValidation } from "../../middlewares/validators/validators";

const router = Router();

router.post(
	"/item",
	// authenticateAccessToken,
	withValidation(
		body("itemName")
			.exists()
			.withMessage("نام محصول ضروری است")
			.bail()
			.isString()
			.isLength({ max: 100, min: 3 })
			.withMessage("نام محصول باید بین ۳ تا ۱۰۰ حرف باشد")
			.bail()
			.custom(checkItemAlreadyExists),
		body("company")
			.exists()
			.withMessage("نام شرکت ضروری است")
			.bail()
			.isString()
			.isLength({ max: 100, min: 3 })
			.withMessage("نام شرکت باید بین ۳ تا ۱۰۰ حرف باشد")
			.custom(checkCompanyAlreadyExists),
		body("description").optional().isString(),
		body("billNumber")
			.exists()
			.withMessage("نمبر بل ضروری است")
			.bail()
			.isString(),
		body("price").exists().withMessage("قیمت ضروری است").bail().isInt(),
		body("count").exists().withMessage("تعداد ضروری است").bail().isInt()
	),
	createItem
);

export function addItemRoutes(app: Express) {
	app.use(router);
}
