export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "sessionId": z.number().optional(),
    }), false)
    return await fetchRequestsBySession(context.body.sessionId!)
})