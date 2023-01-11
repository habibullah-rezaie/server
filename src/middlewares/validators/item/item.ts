import db from "../../../../prisma/prisma";

export async function checkItemAlreadyExists(inputName: string) {
	let error = null;
	try {
		const item = await db.item.findUnique({
			where: { name: inputName },
			select: null,
		});

		if (item) {
			error = new Error("محصول از قبل موجود است");
		}
	} catch (err) {
		console.error(err);
		throw new Error("خطا غیر منتظره رخ داده است");
	}

	if (error) throw error;
}
