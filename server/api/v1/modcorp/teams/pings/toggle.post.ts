export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "user_name": z.string(),
        "user_id": z.number(),
        "id": z.number(),
        "enabled": z.boolean()
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }




    let targetUser = await db.query.ModCorp_TeamRolePings.findFirst({
        where: (ping, {eq}) => {
            return eq(ping.user_id, context.body.user_id)
        }
    })

    let result
    try {
        if (targetUser && !context.body.enabled) {
            result = await db.delete(schema.ModCorp_TeamRolePings).where(eq(schema.ModCorp_TeamRolePings.user_id, context.body.user_id))
        } else if (!targetUser && context.body.enabled) {
            result = await db.insert(schema.ModCorp_TeamRolePings).values({
                "user_id": Number(context.body.user_id),
                "team": Number(context.body.id)
            }).returning()
        }
        if (result) {
            await db.insert(schema.ModCorp_Logs).values({
                "user_name": context.body.user_name,
                "user_id": String(context.body.user_id),
                "action": `User ${context.body.user_name} set their ping status to: ${context.body.enabled}`,
                "reason": null,
                "timestamp": new Date().toISOString()
            })
            return
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to update Ping Status.`})
    }
    throw createError({statusCode: 400, statusMessage: `Failed to update Ping Status.`})
})


