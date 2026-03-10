import type {Peer} from "crossws";
import {fetchChannelInfo, fetchPermittedChannels} from "#server/utils/rrm_v2/users";
import {fetchChannelSessions} from "#server/utils/rrm_v2/sessions";

//     ▄▄▄▄▄▄
//     ██▀▀▀▀██
//     ██    ██   ▄█████▄  ▄▄█████▄   ▄████▄
//     ███████    ▀ ▄▄▄██  ██▄▄▄▄ ▀  ██▄▄▄▄██
//     ██    ██  ▄██▀▀▀██   ▀▀▀▀██▄  ██▀▀▀▀▀▀
//     ██▄▄▄▄██  ██▄▄▄███  █▄▄▄▄▄██  ▀██▄▄▄▄█
//     ▀▀▀▀▀▀▀    ▀▀▀▀ ▀▀   ▀▀▀▀▀▀     ▀▀▀▀▀
export class RRM_V2_BaseServer {
    peer: Peer
    sessionId: number | undefined
    session: typeof schema.RRM_V2_Sessions.$inferSelect | undefined

    constructor(peer: Peer, type: string = "Base") {
        this.peer = peer
        console.log(`RRM V2 ${type} Server`)
    }

    async processMessage(type: string, value: any) {
        if (type === "heartbeat") {
            let heartbeat = new Date().getTime()
            await this.sendMessage("heartbeat", {client: value.client, server: heartbeat})
            return
        }
        console.log(`Processing Message: ${type}`)
        try {
            switch (type) {
                case "getActiveSessions":
                    await this.getActiveSessions(value.channelId)
                    return true
                case "fetchChannelById":
                    await this.fetchChannel(value.channelId)
                    return true
                case "setCurrentSession":
                    await this.setCurrentSession(value.sessionId)
                    return true
                case "updateCurrentSession":
                    await this.updateCurrentSession()
                    return true
                default:
                    return false
            }
        } catch (e) {
            console.log(e)
        }
        return false
    }

    async sendMessage(type: string, value: any) {
        this.peer.send({type: type, value: JSON.stringify(value)})
    }

    async setCurrentSession(sessionId: number) {
        let newSession = await fetchSession(sessionId)
        if (newSession) {
            this.sessionId = sessionId
            this.session = newSession
            await this.sendMessage("updateCurrentSession", this.session)
            await this.updateCurrentRequests()
            return true
        } else {
            return false
        }
    }

    async updateCurrentSession() {
        if (!this.sessionId) {
            this.session = undefined
            return
        }
        this.session = await fetchSession(this.sessionId)
        await this.sendMessage("updateCurrentSession", this.session)
        await this.updateCurrentRequests()
    }

    async getActiveSessions(channelId: string) {
        let sessions = await fetchChannelSessions(channelId)
        await this.sendMessage("getActiveSessions", sessions)
        return sessions
    }

    async fetchChannel(channelId: string) {
        let channel = await fetchChannelInfo(channelId)
        await this.sendMessage("fetchChannelById", channel)
    }

    async updateCurrentRequests() {
        if (!this.sessionId) {
            this.session = undefined
            return
        }
        let requests = await fetchRequests(this.session!.requests)
        await this.sendMessage("updateCurrentRequests", requests)
    }
}

//     ▄▄▄▄▄▄                                  ▄▄▄▄
//     ██▀▀▀▀█▄                                ▀▀██
//     ██    ██   ▄█████▄  ██▄████▄   ▄████▄     ██
//     ██████▀    ▀ ▄▄▄██  ██▀   ██  ██▄▄▄▄██    ██
//     ██        ▄██▀▀▀██  ██    ██  ██▀▀▀▀▀▀    ██
//     ██        ██▄▄▄███  ██    ██  ▀██▄▄▄▄█    ██▄▄▄
//     ▀▀         ▀▀▀▀ ▀▀  ▀▀    ▀▀    ▀▀▀▀▀      ▀▀▀▀
export class RRM_V2_PanelServer extends RRM_V2_BaseServer{
    constructor(peer: Peer) {
        super(peer, "Panel")
    }

    async processMessage(type: string, value: any) {
        if (!await super.processMessage(type, value)) {
            try {
                switch (type) {
                    case "createSession":
                        await createSession(value.hostId, value.channels, value.sources)
                        return true
                    case "getPermittedChannels":
                        await this.getPermittedChannels()
                        break
                    case "updateRequestState":
                        await this.updateRequestState(value.enabled === "Unlocked")
                        break
                    case "updateSessionState":
                        await this.updateSessionState(value.open === "Open")
                        break
                    case "updatePosition":
                        await this.updatePosition(value.index)
                        break
                    case "moveRequest":
                        await this.moveRequest(value.oldIndex, value.newIndex)
                        break
                    case "removeRequest":
                        await this.removeRequest(value.index)
                        break
                    case "createRequest":
                        await this.createRequest(value.user, value.codes)
                        break
                    default:
                        return false
                }
            } catch (e) {
                console.log(e)
            }
            return false
        }
    }

    async sendNotification(title: string, colour: string, message: string) {
        await this.sendMessage("sendNotification", {
            title: title,
            colour: colour,
            message: message
        })
    }

    async setCurrentSession(sessionId: number) {
        if (await super.setCurrentSession(sessionId)) {
            await this.sendNotification("Current Session Updated", "blue", `The current Session is now set to ID ${this.sessionId}.`)
            return true
        } else {
            return false
        }
    }

    async getPermittedChannels() {
        let session = await requireUserSession(this.peer)
        // @ts-ignore
        let channels = await fetchPermittedChannels(session.user.id, session.secure!.access_token)
        await this.sendMessage("getPermittedChannels", channels)
    }

    async createSession(hostId: string, channels: Array<string>, sources: Array<string>) {
        let newSession = await createSession(hostId, channels, sources)
        if (newSession) {
            await this.setCurrentSession(newSession)
            await this.sendNotification("Session Created", "green", `Session ID ${newSession} is now ready!`)
        }
    }

    async updateRequestState(enabled: boolean) {
        let success = await updateRequestState(this.sessionId!, enabled)
        if (success) {
            await this.updateCurrentSession()
            await this.sendNotification("Status Updated", "blue", `The queue is now ${enabled? "Unlocked" : "Locked"}.`)
        }
    }

    async updateSessionState(open: boolean) {
        let success = await updateSessionState(this.sessionId!, open)
        if (success) {
            await this.updateCurrentSession()
            await this.sendNotification("Status Updated", "blue", `The session is now ${open? "Open" : "Closed"}.`)
        }
    }

    async updatePosition(index: number) {
        let success = await updatePosition(this.sessionId!, index)
        if (success) {
            await this.updateCurrentSession()
            await this.sendNotification("Position Updated", "blue", `Session position is now at Request ${index+1}.`)
        }
    }

    async moveRequest(oldIndex: number, newIndex: number) {
        let success = await moveRequest(this.sessionId!, oldIndex, newIndex)
        if (success) {
            await this.updateCurrentSession()
            await this.sendNotification("Request Moved", "blue", `The request has been successfully moved.`)
        }
    }

    async removeRequest(index: number) {
        let success = await removeRequest(this.sessionId!, index)
        if (success) {
            await this.updateCurrentSession()
            await this.sendNotification("Request Removed", "red", `Removed the request from the queue.`)
        }
    }

    async createRequest(user: string, codes: Array<string>) {
        try {
            let res: Array<typeof schema.RRM_V2_Requests.$inferSelect> = await $fetch("/api/rrm_v2/request", {
                method: "POST",
                body: JSON.stringify({
                    "sessionId": this.sessionId,
                    "user": user,
                    "codes": codes,
                    "force": true
                })
            })
            if (res && res.length > 0) {
                await this.sendNotification("Request(s) Added", "green", `Added ${res.length} requests to the queue.`)
            }
        } catch (error) {
            console.log(error)
        }
    }
}

//       ▄▄▄▄                                  ▄▄▄▄
//      ██▀▀██                                 ▀▀██
//     ██    ██  ██▄  ▄██   ▄████▄    ██▄████    ██       ▄█████▄  ▀██  ███
//     ██    ██   ██  ██   ██▄▄▄▄██   ██▀        ██       ▀ ▄▄▄██   ██▄ ██
//     ██    ██   ▀█▄▄█▀   ██▀▀▀▀▀▀   ██         ██      ▄██▀▀▀██    ████▀
//      ██▄▄██     ████    ▀██▄▄▄▄█   ██         ██▄▄▄   ██▄▄▄███     ███
//       ▀▀▀▀       ▀▀       ▀▀▀▀▀    ▀▀          ▀▀▀▀    ▀▀▀▀ ▀▀     ██
//                                                                  ███
export class RRM_V2_OverlayServer extends RRM_V2_BaseServer {
    constructor(peer: Peer) {
        super(peer, "Panel")
    }

    async processMessage(type: string, value: any) {
        if (!await super.processMessage(type, value)) {
            try {
                switch (type) {
                    default:
                        return false
                }
            } catch (e) {
                console.log(e)
            }
            return false
        }
    }
}