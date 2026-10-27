import { NextResponse } from "next/server";
import { MESS_MENU_128_URI, MESS_MENU_62_URI } from "@/lib/constants";

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
		const menu62Uri = process.env.N8N_URI || MESS_MENU_62_URI;
		const menu128Uri = process.env.N8N_128_URI || MESS_MENU_128_URI;

		const [res62, res128] = await Promise.all([
			fetch(menu62Uri, { next: { revalidate: 3600 } }),
			fetch(menu128Uri, { next: { revalidate: 3600 } }),
		]);

		if (!res62.ok || !res128.ok) {
			throw new Error("Failed to fetch mess menu");
		}

		const data62 = await res62.json();
		const data128 = await res128.json();

		const menu62 = data62.menu;
		const menu128 = data128.menu;

		const combinedMenu: any = {};

		Object.entries(menu62).forEach(([dayKey, dayValue]) => {
			const dayName = dayKey.split(" ")[0];
			const meals = dayValue as Record<string, unknown>;

			// Extract the date from the day entry, if present
			const dateStr = (meals.date as string) || "";
			const { date: _date, ...rest } = meals;

			const lunch128 = menu128[dayName]
				? menu128[dayName]
						.filter((item: string) => item && item.trim() !== "")
						.join(", ")
				: null;

			// Normalize the key to "<Day> <dd.mm.yy>" so the view can parse it
			const normalizedKey = dateStr ? `${dayName} ${dateStr}` : dayName;

			combinedMenu[normalizedKey] = {
				...rest,
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
