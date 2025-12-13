export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "user": z.string(),
        "sessionId": z.number(),
        "newPosition": z.number().min(0)
    }), false)
    let ownerSession = await fetchSessionById(context.body.sessionId)


    if (ownerSession) {
        let result = await db.update(schema.RRM_Session)
            .set({currentRequest: context.body.newPosition, lastUser: context.body.user})
            .where(eq(schema.RRM_Session.id, ownerSession.id))
            .returning()
        if (result && result.length > 0) {
            return result
        } else {
            throw createError({statusCode: 400, statusMessage: `Could not update session.`})
        }
    } else {
        throw createError({statusCode: 400, statusMessage: `Could not find session.`})
    }
})