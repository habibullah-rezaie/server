import { Router } from "express";
import { body } from "express-validator";
import { newQuickSell } from "../../controllers/sell/newSell";
import {
	checkItemExistance,
	checkValidItemName,
} from "../../middlewares/validators/item/item";
import { withValidation } from "../../middlewares/validators/validators";

const router = Router();

router.post(
	"/no-bill",
	withValidation(
		checkValidItemName(body("itemName")).custom(checkItemExistance()),
		body("count").exists().withMessage("تعداد ضروری است").bail().isInt(),
		body("price").exists().withMessage("قیمت ضروری است").bail().isInt()
	),
	// item: itemId
	// check Exists, check isAvailable(count) in stock
	// getAvgPrice and check if price is lower than avg
	// count:
	// price,
	newQuickSell
);

export default router;
