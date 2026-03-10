import {fetchRequests} from "#server/utils/rrm_v2/requests";

export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        requestIds: z.array(z.number().positive()).min(1),
        token: z.string()
    }), false)
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        createError("Token is invalid.")
    }

    let requests = await fetchRequests(context.body.requestIds)
    return {requests: requests}
})