import {fetchSession} from "~~/server/utils/rrm_v2/sessions";
import {and, eq, ne, sql, inArray} from "drizzle-orm";

type RRM_V2_RequestData = {
    text: string,
    code: string,
    metadata: Record<string, string>
}

/**
 * Creates a new Request in a given session.
 * @returns {number || undefined} - Request ID if successful
 * @param {number} sessionId - The ID of the session this request is for
 * @param {string} user - The user making the request
 * @param {RRM_V2_RequestData} request - The request data. (Use Sources to generate first)
 */
export async function createRequest(
    sessionId: number,
    user: string,
    request: RRM_V2_RequestData
) {
    let session = await fetchSession(sessionId)
    if (!session) {return}

    for (let key of Object.keys(request.metadata)) {
        request.metadata[key] = request.metadata[key]!.replaceAll("'","")
    }

    try {
        let newRequest = await db.insert(schema.RRM_V2_Requests).values({
            sessionId: sessionId,
            timestamp: new Date().getTime(),
            text: request.text.replaceAll("'",""),
            code: request.code.replaceAll("'",""),
            metadata: request.metadata,
            user: user.replaceAll("'",""),
        }).returning()

        if (newRequest.length > 0) {
            try {
                session.requests.push(newRequest[0]!.id)
                await db.update(schema.RRM_V2_Sessions)
                    .set({requests: session.requests})
                    .where(eq(schema.RRM_V2_Sessions.id, sessionId))
                    .returning()
                return newRequest[0]
            } catch (error) {
                console.log(error)
            }
        }
        return
    } catch (error) {
        console.log(error)
        return
    }
}

/**
 * Fetch a session by its ID or a Twitch Channel ID.
 * @param {Array<number>} requestIds - Unique ID of the session
 * @returns {Array<typeof schema.RRM_V2_Requests.$inferSelect>} - Session Info
 */
export async function fetchRequests(requestIds: Array<number>) {
    if (requestIds.length < 1) {return}

    let requests: Array<typeof schema.RRM_V2_Requests.$inferSelect> = []

    for (let id of requestIds) {
        try {
            let query = await db.select().from(schema.RRM_V2_Requests).where(eq(schema.RRM_V2_Requests.id, id))
            if (query[0]) {
                requests.push(query[0])
            }
        } catch (error) {
            console.log(error)
        }
    }
    // IDK WHY THIS ISNT WORKING BUT IT DOES IF YOU DO IT ONE BY ONE
    // try {
    //     console.log(JSON.stringify(requestIds))
    //     requests = await db.select()
    //         .from(schema.RRM_V2_Requests)
    //         .where(inArray(schema.RRM_V2_Requests.sessionId, requestIds))
    //     console.log(JSON.stringify(requests))
    // } catch (error) {
    //     console.log(error)
    // }
    return requests
}