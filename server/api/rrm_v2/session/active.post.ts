import {fetchActiveSessions} from "#server/utils/rrm_v2/sessions";

export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({}), false)

    let sessions = await fetchActiveSessions()
    return {sessions: sessions}
})