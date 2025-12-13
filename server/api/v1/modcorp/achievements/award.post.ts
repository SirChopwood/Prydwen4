export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "user_name": z.string(),
        "user_id": z.string(),
        "target": z.string(),
        "achievement": z.number().min(0),
        "note": z.string().optional(),
        "tier": z.number().min(0).optional(),
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }


    let achievement = await $fetch("/api/v1/modcorp/achievements/fetch", {
        method: "POST",
        body:{
            "id": context.body.achievement
        }
    })
    if (!achievement || !achievement[0]) {throw createError({statusCode: 400, statusMessage: `Achievement not found!`})}

    try {
        let newAward = await db.insert(schema.ModCorp_AwardedAchievements).values({
            "user_id": context.body.target,
            "achievement": achievement[0].id,
            "timestamp": new Date().toISOString(),
            "note": context.body.note || "",
            "tier": context.body.tier || 0,
        }).returning()
        if (newAward) {
            await db.insert(schema.ModCorp_Logs).values({
                "user_name": context.body.user_name,
                "user_id": context.body.user_id,
                "action": `Awarded achievement [${achievement[0].id}] ${achievement[0].name} to user ${newAward[0].user_id}.`,
                "reason": context.body.note || "",
                "timestamp": new Date().toISOString()
            })
            return newAward
        } else {
            throw createError({statusCode: 400, statusMessage: `Failed to award Achievement.`})
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to award Achievement.`})
    }
})


