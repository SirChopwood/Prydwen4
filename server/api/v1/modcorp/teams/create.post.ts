export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "user_name": z.string(),
        "user_id": z.string(),
        "name": z.string(),
        "description": z.string(),
        "colour": z.string(),
        "logo_url": z.string(),
        "discord": z.strictObject({
            "role": z.string(),
            "channel": z.string(),
            "server": z.string(),
        })
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }

    try {
        let newTeam = await db.insert(schema.ModCorp_Team).values({
            "name": context.body.name,
            "description": context.body.description,
            "colour": context.body.colour,
            "logo_url": context.body.logo_url,
            "discord": context.body.discord,
        }).returning()
        if (newTeam) {
            await db.insert(schema.ModCorp_Logs).values({
                "user_name": context.body.user_name,
                "user_id": context.body.user_id,
                "action": `Created team [${newTeam[0].id}] ${newTeam[0].name}.`,
                "reason": null,
                "timestamp": new Date().toISOString()
            })
            return newTeam
        } else {
            throw createError({statusCode: 400, statusMessage: `Failed to create Team.`})
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to create Team.`})
    }
})


