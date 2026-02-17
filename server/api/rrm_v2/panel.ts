import {schema} from "#build/types/nitro-imports";
import type {Peer} from "crossws";
import {fetchChannelInfo, fetchPermittedChannels} from "~~/server/utils/rrm_v2/users";
import {
    fetchChannelSessions,
    moveRequest,
    removeRequest,
    updatePosition,
    updateRequestState, updateSessionState
} from "~~/server/utils/rrm_v2/sessions";

interface RRM_V2_Peer extends Peer {
    context: {
        server?: RRM_V2_PanelServer,
        updateTimer?: NodeJS.Timeout
    }
}

export default defineWebSocketHandler({
    async upgrade(request) {
        await requireUserSession(request)
    },

    async open(peer: RRM_V2_Peer) {
        peer.context.server = new RRM_V2_PanelServer(peer)
        console.log("Connection Opened")
        peer.context.updateTimer = setInterval(async () => {
            await peer.context.server!.updateCurrentSession()
        }, 15 * 1000)
    },

    async message(peer: RRM_V2_Peer, message) {
        let msg: {type: string, value: any} = message.json()
        if (!msg.type) {
            console.log(`Unknown message: ${msg}`)
            return
        }
        if (!peer.context.server) {
            console.log(`Server Instance Not Valid!`)
            return
        }
        let server = peer.context.server

        console.log(`Processing Message: ${msg.type}`)
        try {
            switch (msg.type) {
                case "createSession":
                    await createSession(msg.value.hostId, msg.value.channels, msg.value.sources)
                    break
                case "getPermittedChannels":
                    await server.getPermittedChannels()
                    break
                case "getActiveSessions":
                    await server.getActiveSessions(msg.value.channelId)
                    break
                case "fetchChannelById":
                    await server.fetchChannelById(msg.value.channelId)
                    break
                case "setCurrentSession":
                    await server.setCurrentSession(msg.value.sessionId)
                    break
                case "updateCurrentSession":
                    await server.updateCurrentSession()
                    break
                case "updateRequestState":
                    await server.updateRequestState(msg.value.enabled === "Unlocked")
                    break
                case "updateSessionState":
                    await server.updateSessionState(msg.value.open === "Open")
                    break
                case "updatePosition":
                    await server.updatePosition(msg.value.index)
                    break
                case "moveRequest":
                    await server.moveRequest(msg.value.oldIndex, msg.value.newIndex)
                    break
                case "removeRequest":
                    await server.removeRequest(msg.value.index)
                    break
                case "createRequest":
                    await server.createRequest(msg.value.user, msg.value.codes)
                    break
                default:
                    console.log(`Unknown type: ${msg.type}`)
                    await server.sendNotification("ERROR", "red", `Client sent unknown message type: ${msg.type}`)
                    break
            }
        } catch (e) {
            console.log(e)
        }
        return
    },

    async close(peer: RRM_V2_Peer) {
        console.log("Connection Closed")
    },
})

class RRM_V2_PanelServer {
    peer: Peer
    sessionId: number | undefined
    session: typeof schema.RRM_V2_Sessions.$inferSelect | undefined

    constructor(peer: Peer) {
        this.peer = peer
        console.log("RRM V2 Panel Server")
    }

    async sendMessage(type: string, value: any) {
        this.peer.send({type: type, value: JSON.stringify(value)})
    }

    async sendNotification(title: string, colour: string, message: string) {
        await this.sendMessage("sendNotification", {
            title: title,
            colour: colour,
            message: message
        })
    }

    async setCurrentSession(sessionId: number) {
        let newSession = await fetchSession(sessionId)
        if (newSession) {
            this.sessionId = sessionId
            this.session = newSession
            await this.sendMessage("updateCurrentSession", this.session)
            await this.sendNotification("Current Session Updated", "blue", `The current Session is now set to ID ${sessionId}.`)
            await this.updateCurrentRequests()
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

    async getPermittedChannels() {
        let session = await requireUserSession(this.peer)
        // @ts-ignore
        let channels = await fetchPermittedChannels(session.user.id, session.secure!.access_token)
        await this.sendMessage("getPermittedChannels", channels)
    }

    async getActiveSessions(channelId: string) {
        let sessions = await fetchChannelSessions(channelId)
        await this.sendMessage("getActiveSessions", sessions)
        return sessions
    }

    async fetchChannelById(channelId: string) {
        let channel = await fetchChannelInfo(channelId)
        await this.sendMessage("fetchChannelById", channel)
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

    async updateCurrentRequests() {
        if (!this.sessionId) {
            this.session = undefined
            return
        }
        let requests = await fetchRequests(this.session!.requests)
        await this.sendMessage("updateCurrentRequests", requests)
    }

    async removeRequest(index: number) {
        let success = await removeRequest(this.sessionId!, index)
        if (success) {
            await this.updateCurrentSession()
            await this.sendNotification("Request Removed", "red", `Removed the request from the queue.`)
        }
    }

    async createRequest(user: string, codes: Array<string>) {
        let res = await $fetch("/api/rrm_v2/request", {
            method: "POST",
            body: JSON.stringify({
                sessionId: this.sessionId,
                user: user,
                codes: codes
            })
        })
        if (res && res.length > 0) {
            await this.sendNotification("Request(s) Added", "green", `Added ${res.length} requests to the queue.`)
        }
    }
}