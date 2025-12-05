import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/mess-menu:
 *   get:
 *     description: Returns the combined mess menu for sector 62 and 128
 *     responses:
 *       200:
 *         description: The combined mess menu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 menu:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       Breakfast:
 *                         type: string
 *                       Lunch:
 *                         type: string
 *                       Snacks:
 *                         type: string
 *                       Dinner:
 *                         type: string
 *                       Lunch128:
 *                         type: string
 *                         nullable: true
 *       500:
 *         description: Internal server error
 */
/**
 * Retrieves the combined mess menu for sector 62 and 128.
 *
 * @returns A JSON response containing the combined mess menu
 */
export async function GET() {
	try {
		if (!process.env.N8N_URI || !process.env.N8N_128_URI) {
			throw new Error("N8N_URI or N8N_128_URI is not defined");
		}

		const [res62, res128] = await Promise.all([
			fetch(process.env.N8N_URI, { next: { revalidate: 3600 } }),
			fetch(process.env.N8N_128_URI, { next: { revalidate: 3600 } }),
		]);

		if (!res62.ok || !res128.ok) {
			throw new Error("Failed to fetch mess menu");
		}

		const data62 = await res62.json();
		const data128 = await res128.json();

		const menu62 = data62.menu;
		const menu128 = data128.menu;

		const combinedMenu: any = {};

		Object.keys(menu62).forEach((dayKey) => {
			const dayName = dayKey.split(" ")[0];
			const lunch128 = menu128[dayName]
				? menu128[dayName]
						.filter((item: string) => item && item.trim() !== "")
						.join(", ")
				: null;

			combinedMenu[dayKey] = {
				...menu62[dayKey],
				Lunch128: lunch128 || null,
			};
		});

		return NextResponse.json({ menu: combinedMenu });
	} catch (error) {
		console.error("Error fetching mess menu:", error);
		return NextResponse.json(
			{ error: "Failed to fetch mess menu" },
			{ status: 500 }
		);
	}
}
