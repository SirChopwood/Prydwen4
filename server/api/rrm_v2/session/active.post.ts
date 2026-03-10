import {fetchActiveSessions} from "#server/utils/rrm_v2/sessions";

export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        token: z.string()
    }), false)
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        createError("Token is invalid.")
    }

    let sessions = await fetchActiveSessions()
    return {sessions: sessions}
})