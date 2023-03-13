import { countReset } from "console";
import { Request, Response } from "express";
import db from "../../../prisma/prisma";

export async function newQuickSell(req: Request, res: Response) {
	const {
		count,
		price,
		itemName,
		lowPrice,
	}: { count: number; price: number; itemName: string; lowPrice: boolean } =
		req.body;

	const purchases = await db.purchase.findMany({
		select: { updatedAt: true, inStockCount: true, price: true, id: true },
		where: { finishDate: { equals: null } },
		orderBy: [{ registerDate: "asc" }],
	});

	const total = purchases.reduce(
		(a, b) =>
			({
				inStockCount: a.inStockCount + b.inStockCount,
				// inStockCount: a.inStockCount + b.inStockCount;
			} as typeof purchases[0])
	);

	// Make sure we have available count
	if (total.inStockCount < count) {
		const message = "موجود نمی باشد " + `(${itemName})` + " تعداد کافی محصول";
		return res
			.status(400)
			.json({ message, meta: { inStockCount: total.inStockCount } });
	}

	// Make sure the price is above avg
	let avgPrice = 0;
	for (const item of purchases) {
		avgPrice += item.inStockCount * item.price;
	}
	avgPrice /= total.inStockCount;

	if (price < avgPrice && !lowPrice) {
		const message =
			"در حد ضرر است" + ` (${itemName}) ` + "قیمت داده شده برای محصول";
		return res.status(400).json({ message, meta: { price: avgPrice } });
	}

	// TODO: change this and get user Id from req
	const user = await db.user.findFirst();

	// create a sell
	const created = await db.sell.create({
		data: {
			ItemOfSell: {
				create: {
					count,
					price,
					item: { connect: { name: itemName } },
				},
			},
			PaymentOfSell: {
				create: {
					amount: price * count,
					payment: {
						create: {
							amount: price * count,
							user: { connect: { id: user?.id } },
						},
					},
				},
			},
			user: { connect: { id: user?.id } },
		},
	});

	// Update the sell Items only if the same version
	let touched = 0;

	for (let i = 0; i < purchases.length; i++) {
		const updateResult = await db.purchase.update({
			where: { id: purchases[i].id },
			data: {},
		});
	}

	// if from different versions: delete newly created sell and relevent data
	res.json({ SUCCESS: "YES", created, counts: purchases, total });
}
