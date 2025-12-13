export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "user_name": z.string(),
        "user_id": z.string()
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }

    try {
        let newUser = await db.insert(schema.ModCorp_UserCards).values({
            "user_id": Number(context.body.user_id)
        }).returning()
        if (newUser) {
            await db.insert(schema.ModCorp_Logs).values({
                "user_name": context.body.user_name,
                "user_id": context.body.user_id,
                "action": `Added user to card system.`,
                "reason": null,
                "timestamp": new Date().toISOString()
            })
            return newUser
        } else {
            throw createError({statusCode: 400, statusMessage: `Failed to add the user.`})
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to add the user.`})
    }
})


