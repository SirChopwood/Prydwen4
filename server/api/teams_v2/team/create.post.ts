export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        token: z.string(),
        user_name: z.string(),
        user_id: z.string(),
        name: z.string(),
        description: z.string(),
        colour: z.string(),
        logo_url: z.string().url(),
        icon_url: z.string().url(),
        guild: z.string(),
        channel: z.string(),
        role: z.string(),
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }

    try {
        let newTeam = await db.insert(schema.Teams_V2_Teams).values({
            name: context.body.name,
            description: context.body.description,
            colour: context.body.colour,
            logo_url: context.body.logo_url,
            icon_url: context.body.logo_url,
            guild: context.body.guild,
            channel: context.body.channel,
            role: context.body.role,
            active: 1
        }).returning()

        if (newTeam && newTeam.length > 0) {
            await db.insert(schema.Teams_V2_Logs).values({
                "team_id": newTeam[0]!.id,
                "action": `Created team [${newTeam[0]!.id}] ${newTeam[0]!.name}.`,
                "user_ids": [context.body.user_id],
                "reason": `Linked to Guild ${newTeam[0]!.guild}, Channel ${newTeam[0]!.channel} & Role ${newTeam[0]!.role}`,
                "timestamp": new Date().getTime()
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


