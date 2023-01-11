import { Request, Response } from "express";
import db from "../../../prisma/prisma";

export function createItem(req: Request, res: Response) {
	const {
		itemName,
		company,
		description,
		price,
		count,
		billNumber,
	}: {
		itemName: string;
		company: string;
		description?: string;
		price: number;
		count: number;
		billNumber: string;
	} = req.body;

	db.purchase
		.create({
			data: {
				item: {
					create: {
						name: itemName,
						company: { connect: { name: company } },
						description,
					},
				},
				inStockCount: count,
				price,
				invoiceNumber: billNumber,
				totalCount: count,
			},
			include: {
				item: true,
			},
		})
		.then((result) => res.status(200).json(result))
		.catch((err) => {
			console.error(err);
			return res.status(500).json({ message: "خطای غیر منتظره رخ داده است" });
		});
}
