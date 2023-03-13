import { Express, Router } from "express";
import { body, param } from "express-validator";
import { addItemToStock, createItem } from "../../controllers/item/item";
import { checkCompanyAlreadyExists } from "../../middlewares/validators/company";
import {
	checkItemExistance,
	checkValidItemName,
} from "../../middlewares/validators/item/item";
import { withValidation } from "../../middlewares/validators/validators";

const router = Router();

router.post(
	"/",
	// authenticateAccessToken,
	withValidation(
		checkValidItemName(body("itemName")).custom(
			checkItemExistance({ existance: false })
		),
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

router.post(
	"/:itemName",
	// authenticateAccessToken,
	withValidation(
		checkValidItemName(param("itemName")).custom(checkItemExistance()),
		body("billNumber")
			.exists()
			.withMessage("نمبر بل ضروری است")
			.bail()
			.isString(),
		body("price").exists().withMessage("قیمت ضروری است").bail().isInt(),
		body("count").exists().withMessage("تعداد ضروری است").bail().isInt()
	),
	addItemToStock
);

export function addItemRoutes(app: Express) {
	app.use("/item", router);
}
