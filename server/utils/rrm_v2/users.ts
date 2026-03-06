import url from "url";
import {sql} from "drizzle-orm";
import type {H3Event} from "h3";

export type RRM_V2_TwitchChannel = {
    id: string,
    login: string,
    display_name: string,
    profile_image_url: string
}

/**
 * Fetch the channel data of a given ID or Name
 * @param {string} channelId - Twitch Channel ID
 * @param {string} channelName - Twitch Channel Login/Display Name
 * @returns {RRM_V2_TwitchChannel | undefined} - Channel Info or Undefined if unable to find.
 */
export async function fetchChannelInfo(channel: string) {
    if (!channel) {
        console.log("No id or name provided.")
        return
    }

    const tokenRequest = await fetch(url.format({
        protocol: "https",
        hostname: "id.twitch.tv",
        pathname: "/oauth2/token",
        query: {
            client_id: process.env.NUXT_OAUTH_TWITCH_CLIENT_ID as string,
            client_secret: process.env.NUXT_OAUTH_TWITCH_CLIENT_SECRET as string,
            grant_type: 'client_credentials',
        }
    }), {method: "POST"})

    if (tokenRequest.status !== 200) {
        console.log("Unable to generate Twitch token.")
        console.log(await tokenRequest.text())
        return
    }

    let tokenData = await tokenRequest.json()
    let userRequestUrl = {
        protocol: "https",
        hostname: "api.twitch.tv",
        pathname: "/helix/users",
        query: {}
    }

        if (Number.isInteger(channel)) {
            // @ts-ignore
            userRequestUrl.query.id = String(Number(channel))
        } else {
            // @ts-ignore
            userRequestUrl.query.login = channel.toLowerCase()
        }

    const userRequest = await fetch(url.format(userRequestUrl), {
        headers: {
            "Authorization": `Bearer ${tokenData.access_token}`,
            "Client-Id": process.env.NUXT_OAUTH_TWITCH_CLIENT_ID as string,
        }
    })

    if (tokenRequest.status !== 200) {
        console.log("User Request failed.")
        console.log(await userRequest.text())
        return
    }

    let data = await userRequest.json()
    let result: RRM_V2_TwitchChannel = {
        id: data.data[0].id,
        login: data.data[0].login,
        display_name: data.data[0].display_name,
        profile_image_url: data.data[0].profile_image_url,
    }
    return result
}

/**
 * Fetch all channels the channel is in a group with.
 * @param {string} channelId - Twitch Channel ID
 * @returns {{groups: Array<RRM_V2_Groups.$inferSelect>, channels: Record<string, Array<RRM_V2_TwitchChannel>>}} - Array of channels found.
 */
export async function fetchGroupChannels(
    channelId: string
) {
    let channelList: Record<string, Array<RRM_V2_TwitchChannel>> = {}
    let groups = await db.select()
        .from(schema.RRM_V2_Groups)
        .where(
            sql`(SELECT 1 FROM json_each(channels) WHERE (value = json(${channelId})))`, // Iterate through channels to see if one matches
        )
    if (!groups || groups.length < 0) {
        return {groups: groups, channels: channelList}
    }
    for (let group of groups) {
        let channels = group.channels
        for (let channel of channels) {
            let channelInfo = await fetchChannelInfo(channelId = channel)
            if (!channelInfo) {continue}
            if (Object.keys(channelList).includes(group.name)) {
                channelList[group.name]!.push(channelInfo)
            } else {
                channelList[group.name] = [channelInfo]
            }
        }
    }
    const result = {groups: groups, channels: channelList}
    return result
}

/**
 * Returns a list of usernames and ids for channels in which the user has the moderator role.
 * @param {string} channelId - Twitch Channel ID
 * @returns {Array<RRM_V2_TwitchChannel>} - Array of Channel Infos
 */
export async function fetchModeratedChannels(
    channelId: string,
    token: string
) {
    const userModsRequests = await fetch(url.format({
        protocol: "https",
        hostname: "api.twitch.tv",
        pathname: "/helix/moderation/channels",
        query: {
            user_id: String(channelId)
        }
    }), {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Client-Id": process.env.NUXT_OAUTH_TWITCH_CLIENT_ID as string,
        }
    })

    if (userModsRequests.status !== 200) {
        console.log("Unable to fetch Moderated channels.")
        console.log(await userModsRequests.text())
        return []
    }

    let modsData = await userModsRequests.json()
    let channelList: Array<RRM_V2_TwitchChannel> = []
    for (let streamer of modsData.data) {
        let channelData = await fetchChannelInfo(channelId = String(streamer.broadcaster_id))
        if (!channelData) { continue }
        channelList.push(channelData)
    }
    return channelList
}

/**
 * Fetch all channels the channel has permission to interact with, such as by being a Moderator or sharing a Group.
 * @param {string} channelId - Twitch Channel ID
 * @param {string} token - Twitch Authentication Token
 * @returns {{moderated: Array<RRM_V2_TwitchChannel>, groups: Array<RRM_V2_Groups.$inferSelect>, channels: Record<string, Array<RRM_V2_TwitchChannel>>}} - Array of moderated channels, groups the user is in and all channels they contain.
 */
export async function fetchPermittedChannels(
    channelId: string,
    token: string
) {
    let moderated = await fetchModeratedChannels(channelId, token)
    let groups = await fetchGroupChannels(channelId)
    let channels: Record<string, RRM_V2_TwitchChannel> = {}
    let modIds: Array<string> = []

    for (const channel of moderated) {
        modIds.push(channel.id)
        if (!Object.keys(channels).includes(channel.id)) {
            channels[channel.id] = channel
        }
    }

    for (const groupChannels of Object.values(groups.channels)) {
        for (const channel of groupChannels) {
            if (!Object.keys(channels).includes(channel.id)) {
                channels[channel.id] = channel
            }
        }
    }

    return {
        moderated: modIds, // Array of Modded Channel IDs
        groups: groups.groups, // Array of Groups, continaing channel IDs
        channels: channels // Record of Channel IDs to Channel Infos
    }
}