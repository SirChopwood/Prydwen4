import {and, eq} from "drizzle-orm";
export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "raid_id": z.number(),
        "encounterIndex": z.number(),
        "roundIndex": z.number(),
        "active": z.boolean(),
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

    let result
    try {
        if (targetRaid) {
            result = await db.update(schema.Raids_V2_Raids)
                .set({
                    "encounterIndex": context.body.encounterIndex,
                    "roundIndex": context.body.roundIndex,
                    "active": context.body.active ? 1 : 0,
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
        throw createError({statusCode: 400, statusMessage: `Failed to update Raid.`})
    }

    if (result) {
        await db.insert(schema.Raids_V2_Logs).values({
            "raid_id": context.body.raid_id,
            "action": `Updated Raid ${context.body.raid_id}.`,
            "user_ids": [],
            "reason": `EncounterIndex: ${context.body.encounterIndex} RoundIndex: ${context.body.roundIndex} Active: ${context.body.active}`,
            "timestamp": new Date().getTime()
        })
        return
    }
})


