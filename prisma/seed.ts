import db from "./prisma";
import bcrypt from "bcrypt";

export async function seedDb() {
	const usr = await db.user.findUnique({
		where: { email: "habibullah.rezaie.8@gmail.com" },
	});

	if (!usr) {
		const hashedPasswd = await bcrypt.hash("hi123456", 8);
		const newUser = await db.user.create({
			data: {
				email: "habibullah.rezaie.8@gmail.com",
				password: hashedPasswd,
				name: "Habibullah Rezaie",
				role: "ADMIN",
			},
		});

		console.log("Created FIRST USER;", newUser);
	} else {
		console.log("Already user exists", usr);
	}

	await db.company.upsert({
		where: { name: "Habibi Ltd" },
		create: { name: "Habibi Ltd", description: "First company" },
		update: {},
	});
}
