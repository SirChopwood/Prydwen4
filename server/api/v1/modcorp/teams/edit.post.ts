export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "user_name": z.string(),
        "user_id": z.string(),
        "id": z.number().min(0),
        "name": z.string().optional(),
        "description": z.string().optional(),
        "colour": z.string().optional(),
        "logo_url": z.string().optional(),
        "discord": z.strictObject({
            "role": z.string(),
            "channel": z.string(),
            "server": z.string(),
        }).optional(),
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }

    let result: Array<object> | null = null

    try {
        if (context.body.name) {
            result = await db.update(schema.ModCorp_Team)
                .set({name: context.body.name})
                .where(eq(schema.ModCorp_Team.id, context.body.id))
                .returning()
        }
        if (context.body.description) {
            result = await db.update(schema.ModCorp_Team)
                .set({description: context.body.description})
                .where(eq(schema.ModCorp_Team.id, context.body.id))
                .returning()
        }
        if (context.body.colour) {
            result = await db.update(schema.ModCorp_Team)
                .set({colour: context.body.colour})
                .where(eq(schema.ModCorp_Team.id, context.body.id))
                .returning()
        }
        if (context.body.logo_url) {
            result = await db.update(schema.ModCorp_Team)
                .set({logo_url: context.body.logo_url})
                .where(eq(schema.ModCorp_Team.id, context.body.id))
                .returning()
        }
        if (context.body.discord) {
            result = await db.update(schema.ModCorp_Team)
                .set({discord: context.body.discord})
                .where(eq(schema.ModCorp_Team.id, context.body.id))
                .returning()
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to edit Team.`})
    }

    if (result && result.length > 0) {
        await db.insert(schema.ModCorp_Logs).values({
            "user_name": context.body.user_name,
            "user_id": context.body.user_id,
            "action": `Edited the data of team [${context.body.id}].`,
            "reason": null,
            "timestamp": new Date().toISOString()
        })
        return result
    } else {
        throw createError({statusCode: 400, statusMessage: `Could not find team or value to edit.`})
    }
})


