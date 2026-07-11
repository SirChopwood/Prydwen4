import {and, eq} from "drizzle-orm";
export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "raid_id": z.number(),
        "bossBar": z.strictObject({
            mode: z.enum(["None", "HP", "Puzzle"]),
            percentages: z.record(z.string(), z.number())
        }),
        "messages": z.strictObject({
            announcement: z.string().optional(),
            title: z.string().optional(),
            subtitle: z.string().optional(),
        }),
        "timer": z.strictObject({
            mode: z.enum(["None", "Encounter", "Paused"]),
            start: z.number().optional(),
            end: z.number().optional()
        })
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }

    let targetRaid = await db.query.Raids_V2_Raids.findFirst({
        where: (raid, {eq, and}) => {
            return and(
                eq(raid.id, context.body.raid_id!),
                eq(raid.active, 1)
            )
        }
    })

    try {
        if (targetRaid) {
            await db.update(schema.Raids_V2_Raids)
                .set({
                    "overlayData": {
                        bossBar: context.body.bossBar,
                        messages: context.body.messages,
                        timer: context.body.timer
                    }
                })
                .where(and(
                    eq(schema.Raids_V2_Raids.id, context.body.raid_id!),
                    eq(schema.Raids_V2_Raids.active, 1)
                ))
                .returning()
        } else {
            throw createError({statusCode: 400, statusMessage: `Could not find Raid.`})
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to update Raid Overlay.`})
    }
})


