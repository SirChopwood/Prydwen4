export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "user_name": z.string(),
        "user_id": z.string(),
        "target": z.array(z.string()).min(1),
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

    for (const target of context.body.target) {
        await giveAward(target, context.body.user_id, context.body.user_name, achievement[0], context.body.note, context.body.tier)
    }
    return
})

async function giveAward(target_id: string, user_id: string, user_name: string, achievement: any, note: string, tier: number) {
    try {
        let newAward = await db.insert(schema.ModCorp_AwardedAchievements).values({
            "user_id": target_id,
            "achievement": achievement.id,
            "timestamp": new Date().toISOString(),
            "note": note || "",
            "tier": tier || 0,
        }).returning()
        if (newAward) {
            await db.insert(schema.ModCorp_Logs).values({
                "user_name": user_name,
                "user_id": user_id,
                "action": `Awarded achievement [${achievement.id}] ${achievement.name} to user ${newAward[0].user_id}.`,
                "reason": note || "",
                "timestamp": new Date().toISOString()
            })
            return
        } else {
            throw createError({statusCode: 400, statusMessage: `Failed to award Achievement.`})
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to award Achievement.`})
    }
}


