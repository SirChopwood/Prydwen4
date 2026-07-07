export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        token: z.string(),
        path: z.string(),
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }

    try {
        let newRaid = await db.insert(schema.Raids_V2_Raids).values({
            path: context.body.path,
            encounterIndex: 0,
            roundIndex: 0,
            active: 1
        }).returning()

        if (newRaid && newRaid.length > 0) {
            await db.insert(schema.Raids_V2_Logs).values({
                "action": `Created raid [${newRaid[0]!.id}] ${newRaid[0]!.path}.`,
                "reason": ``,
                "timestamp": new Date().getTime(),
                "user_ids": [],
                "raid_id": newRaid[0]!.id
            })
            return newRaid
        } else {
            throw createError({statusCode: 400, statusMessage: `Failed to create Raid.`})
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to create Raid.`})
    }
})


