import {fetchSession} from "~~/server/utils/rrm_v2/sessions";
import {and, eq, ne, sql} from "drizzle-orm";
import {inArray} from "drizzle-orm/sql/expressions/conditions";

type RRM_V2_RequestData = {
    text: string,
    code: string,
    metadata: Record<string, string>
}

// MOVE TO REQUEST HANDLER ITSELF
export async function attemptRequest(
    sessionId: number,
    user: string,
    request: RRM_V2_RequestData
) {
    try {
        let existingRequests = await db.query.RRM_V2_Requests.findMany({
            where: (requests, {eq, and}) => {
                return and(eq(requests.sessionId, sessionId), eq(requests.code, request.code))
            }
        })
        if (existingRequests.length > 0) {
            return
        }
    } catch (error) {
        console.log(error)
        return
    }
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
                return newRequest[0]!.id
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
    if (requestIds.length < 0) {return}

    let session: Array<typeof schema.RRM_V2_Requests.$inferSelect> = []

    try {
        session = await db.selectDistinct()
            .from(schema.RRM_V2_Requests)
            .where(inArray(schema.RRM_V2_Requests.sessionId, requestIds))
    } catch (error) {
        console.log(error)
        return
    }

    return session
}