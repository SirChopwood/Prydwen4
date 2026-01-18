import {fetchChannelInfo, RRM_V2_TwitchChannel} from "~~/server/utils/rrm_v2/users";

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