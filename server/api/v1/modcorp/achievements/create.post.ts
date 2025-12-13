export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "user_name": z.string(),
        "user_id": z.string(),
        "name": z.string(),
        "description": z.string(),
        "file": z.string(),
        "type": z.enum(["Medal", "Ribbon", "Participation"]),
        "tiers": z.array(z.strictObject({
            name: z.string(),
            description: z.string(),
            file: z.string()
        })).optional()
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }



    try {
        let newAchievement = await db.insert(schema.ModCorp_Achievements).values({
            "name": context.body.name,
            "description": context.body.description,
            "file": context.body.file,
            "type": context.body.type,
            "tiers": context.body.tiers,
        }).returning()
        if (newAchievement) {
            await db.insert(schema.ModCorp_Logs).values({
                "user_name": context.body.user_name,
                "user_id": context.body.user_id,
                "action": `Created achievement [${newAchievement[0].id}] ${newAchievement[0].name}.`,
                "reason": null,
                "timestamp": new Date().toISOString()
            })
            return newAchievement
        } else {
            throw createError({statusCode: 400, statusMessage: `Failed to create Achievement.`})
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to create Achievement.`})
    }
})


