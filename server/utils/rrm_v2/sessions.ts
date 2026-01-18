import {fetchChannelInfo, RRM_V2_TwitchChannel} from "~~/server/utils/rrm_v2/users";
import {and, eq, ne, or, sql} from "drizzle-orm";

export enum RRM_V2_SessionStatus {
    Open = "Open",
    Closed = "Closed",
    Locked = "Locked"
}

/**
 * Creates a new RRM Session
 * @param {string} hostId - Twitch ID of Host
 * @param {Array<string>} channels - Twitch IDs for all channels included
 * @param {Array<string>} sources - String Names of Sources of Requests
 * @returns {number | undefined} - Session ID if successful
 */
export async function createSession(
    hostId: string,
    channels: Array<string>,
    sources: Array<string>,
) {
    let hostInfo = await fetchChannelInfo(hostId)
    if (!hostInfo) {
        return
    }
    let channelInfo: Array<RRM_V2_TwitchChannel> = []
    for (let channel of channels) {
        let info = await fetchChannelInfo(channel)
        if (info) {
            channelInfo.push(info)
        }
    }

    try {
        let newSession = await db.insert(schema.RRM_V2_Sessions).values({
            startTime: new Date().toISOString(),
            lastUser: hostInfo.display_name,
            status: "Open",
            channels: channelInfo,
            sources: sources,
        }).returning()
        return newSession[0].id
    } catch (error) {
        console.log(error)
        return
    }
}

/**
 * Fetch a session by its ID or a Twitch Channel ID.
 * @param {number} sessionId - Unique ID of the session
 * @param {number} channelId - Twitch Channel ID
 * @returns {schema.RRM_V2_Sessions.$inferSelect || undefined} - Session Info
 */
export const fetchSession = defineCachedFunction(async (sessionId?: number, channelId?: string) => {
    if (!sessionId && !channelId) {return}

    let session: typeof schema.RRM_V2_Sessions.$inferSelect | undefined = undefined

    if (sessionId) {
        try {
            session = await db.query.RRM_V2_Sessions.findFirst({
                where: (sessions, {eq}) => {
                    return eq(sessions.id, sessionId)
                }
            })
        } catch (error) {
            console.log(error)
            return
        }
    } else if (channelId) {
        let sessionQuery = await db.select().from(schema.RRM_V2_Sessions).where(
            and(
                sql`(SELECT 1 FROM json_each(channels) WHERE (value = ${channelId}))`, // Iterate through channels to see if one matches
                ne(schema.RRM_Session.status, "Closed")
            )
        )
        if (sessionQuery && sessionQuery[0] !== null) {
            session = sessionQuery[0]
        }
    }
    return session
}, {maxAge: Number(process.env.RRM_V2_CACHE_TIMEOUT)})