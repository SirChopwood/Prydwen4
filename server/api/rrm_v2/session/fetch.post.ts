import {fetchSession} from "#imports";

export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        sessionIds: z.array(z.number().positive()).min(1),
    }), false)

    let sessions: Array<typeof schema.RRM_V2_Sessions.$inferSelect> = []
    for (let sessionId of context.body.sessionIds) {
        let newSession = await fetchSession(sessionId)
        if (newSession) {
            sessions.push()
        }
    }
    return {sessions: sessions}
})