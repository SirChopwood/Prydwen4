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
        if (!info) {
            console.log(`Could not find channel: ${channel}`)
            return
        }
    }

    try {
        let newSession = await db.insert(schema.RRM_V2_Sessions).values({
            startTime: new Date().getTime(),
            lastUser: hostInfo.display_name,
            sessionState: "Open",
            channels: channels,
            sources: sources,
        }).returning()
        if (newSession) {
            return newSession[0]!.id
        } else {
            return
        }

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
export async function fetchSession(sessionId?: number, channelId?: string) {
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
                ne(schema.RRM_V2_Sessions.sessionState, "Closed")
            )
        )
        if (sessionQuery && sessionQuery[0] !== null) {
            session = sessionQuery[0]
        }
    }
    return session
}

/**
 * Fetch all sessions that are currently open.
 * @returns {Array<typeof schema.RRM_V2_Sessions.$inferSelect>} - Currently Open Sessions
 */
export async function fetchActiveSessions() {
    let sessions: Array<typeof schema.RRM_V2_Sessions.$inferSelect> = []

    try {
        sessions = await db.query.RRM_V2_Sessions.findMany({
            where: (sessions, {eq}) => {
                return eq(sessions.sessionState, "Open")
            }
        })
    } catch (error) {
        console.log(error)
    }
    return sessions
}


/**
 * Fetch the sessions of a Twitch Channel ID or Name.
 * @param {number} channelId - Twitch Channel ID or Name
 * @returns {Array<typeof schema.RRM_V2_Sessions.$inferSelect>} - Session Info
 */
export async function fetchChannelSessions(channelId: string) {
    if (!channelId) {return []}

    let query = channelId

    // Convert Channel Names into IDs if one was given
    if (isNaN(Number(channelId))) {
        let channel = await fetchChannelInfo(channelId)
        if (channel) {
            query = channel.id
        }
    }

    let session: Array<typeof schema.RRM_V2_Sessions.$inferSelect> = []

    let sessionQuery = await db.select().from(schema.RRM_V2_Sessions).where(
        and(
            sql`(SELECT 1 FROM json_each(channels) WHERE (value = ${query}))`, // Iterate through channels to see if one matches
            ne(schema.RRM_V2_Sessions.sessionState, "Closed")
        )
    )
    if (sessionQuery && sessionQuery[0] !== null) {
        session = sessionQuery
    }
    return session
}

/**
 * Toggle if a session should allow more requests to be made.
 * @param {number} sessionId - Unique ID of the session
 * @param {boolean} enabled - If it should allow more requests
 * @returns {boolean} - If the update was successful
 */
export async function updateRequestState(sessionId: number, enabled: boolean) {
    if (!sessionId) {return false}
    let session= await fetchSession(sessionId)
    if (!session) {return false}

    try {
        await db.update(schema.RRM_V2_Sessions)
            .set({requestState: enabled ? "Unlocked" : "Locked"})
            .where(eq(schema.RRM_V2_Sessions.id, sessionId))
            .returning()
        return true
    } catch (error) {
        console.log(error)
    }
    return false
}


/**
 * Toggle if a session should allow more requests to be made.
 * @param {number} sessionId - Unique ID of the session
 * @param {boolean} open - If the session is still active
 * @returns {boolean} - If the update was successful
 */
export async function updateSessionState(sessionId: number, open: boolean) {
    if (!sessionId) {return false}
    let session= await fetchSession(sessionId)
    if (!session) {return false}

    try {
        await db.update(schema.RRM_V2_Sessions)
            .set({sessionState: open ? "Open" : "Closed"})
            .where(eq(schema.RRM_V2_Sessions.id, sessionId))
            .returning()
        return true
    } catch (error) {
        console.log(error)
    }
    return false
}

/**
 * Update the currently active request in the queue.
 * @returns {boolean} - If the update was successful
 * @param sessionId
 * @param index
 */
export async function updatePosition(sessionId: number, index: number) {
    if (!sessionId) {return false}
    let session= await fetchSession(sessionId)
    if (!session) {return false}
    try {
        await db.update(schema.RRM_V2_Sessions)
            .set({position: index})
            .where(eq(schema.RRM_V2_Sessions.id, sessionId))
            .returning()
        return true
    } catch (error) {
        console.log(error)
    }
    return false
}

/**
 * Reposition a request in the queue.
 * @returns {boolean} - If the update was successful
 * @param sessionId
 * @param fromIndex
 * @param toIndex
 */
export async function moveRequest(sessionId: number, fromIndex: number, toIndex: number) {
    if (!sessionId) {return false}
    let session= await fetchSession(sessionId)
    if (!session) {return false}

    try {
        // https://www.npmjs.com/package/array-move
        let array = session.requests
        const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;

        if (startIndex >= 0 && startIndex < array.length) {
            const endIndex = toIndex < 0 ? array.length + toIndex : toIndex;

            const [item] = array.splice(fromIndex, 1);
            array.splice(endIndex, 0, item!);
        }

        await db.update(schema.RRM_V2_Sessions)
            .set({requests: array})
            .where(eq(schema.RRM_V2_Sessions.id, sessionId))
            .returning()
        return true
    } catch (error) {
        console.log(error)
    }
    return false
}

/**
 * Removes a request from the queue.
 * @returns {boolean} - If the update was successful
 * @param sessionId
 * @param index
 */
export async function removeRequest(sessionId: number, index: number) {
    if (!sessionId) {return false}
    let session= await fetchSession(sessionId)
    if (!session) {return false}

    try {
        let array = session.requests
        array.splice(index, 1)

        await db.update(schema.RRM_V2_Sessions)
            .set({requests: array})
            .where(eq(schema.RRM_V2_Sessions.id, sessionId))
        return true
    } catch (error) {
        console.log(error)
    }
    return false
}

/**
 * Update the currently active request in the queue.
 * @returns {boolean} - If the update was successful
 * @param sessionId
 * @param channels
 * @param sources
 */
export async function updateSessionDetails(sessionId: number, channels: Array<string>, sources: Array<string>) {
    if (!sessionId) {return false}
    let session= await fetchSession(sessionId)
    if (!session) {return false}

    for (let channel of channels) {
        let info = await fetchChannelInfo(channel)
        if (!info) {
            console.log(`Could not find channel: ${channel}`)
            return
        }
    }

    try {
        await db.update(schema.RRM_V2_Sessions)
            .set({channels: channels, sources: sources})
            .where(eq(schema.RRM_V2_Sessions.id, sessionId))
            .returning()
        return true
    } catch (error) {
        console.log(error)
    }
    return false
}