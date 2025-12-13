export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "user_name": z.string(),
        "user_id": z.string(),
        "amount": z.number().min(0),
        "reason": z.string(),
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }


    let result: Array<object> | null = null
    let total = 0

    try {
        let targetUser = await db.query.ModCorp_UserCards.findFirst({
            where: (user, {eq}) => {
                return eq(user.user_id, Number(context.body.user_id))
            }
        })
        if (!targetUser) {
            throw createError({statusCode: 400, statusMessage: `User not found.`})
        }
        total = targetUser.rolls + context.body.amount
        result = await db.update(schema.ModCorp_UserCards)
            .set({rolls: total})
            .where(eq(schema.ModCorp_UserCards.user_id, Number(context.body.user_id)))
            .returning()
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to edit User.`})
    }

    if (result && result.length > 0) {
        await db.insert(schema.ModCorp_Logs).values({
            "user_name": context.body.user_name,
            "user_id": context.body.user_id,
            "action": `${context.body.amount} rolls awarded, totalling ${total}`,
            "reason": context.body.reason,
            "timestamp": new Date().toISOString()
        })
        return result
    } else {
        throw createError({statusCode: 400, statusMessage: `Could edit User.`})
    }
})


