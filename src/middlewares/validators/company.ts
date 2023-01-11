import db from "../../../prisma/prisma";

export async function checkCompanyAlreadyExists(inputName: string) {
	let error = null;
	try {
		const company = await db.company.findUnique({
			where: { name: inputName },
			select: null,
		});

		if (!company) {
			error = new Error("شرکت به نام مورد نظر موجود نمی باشد");
		}
	} catch (err) {
		console.error(err);
		throw new Error("خطا غیر منتظره رخ داده است");
	}

	if (error) throw error;
}
