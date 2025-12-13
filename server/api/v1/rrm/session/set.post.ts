export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "sessionId": z.number().nullable(),
    }), true)
    await useStorage().setItem<number|null>(`${context.userSession.user?.id}-selectedSession`, context.body.sessionId)
    return `Session ID Set to ${context.body.sessionId}`
})