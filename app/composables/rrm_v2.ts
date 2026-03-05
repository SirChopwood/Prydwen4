import type {schema} from "#build/types/nitro-imports";
import type {User} from "#auth-utils";

export function usePanelClient(modalManager: ModalManager) {
    return new RRM_V2_PanelClient(modalManager)
}

export class RRM_V2_PanelClient {
    modalManager: ModalManager
    ws: WebSocket | null = null
    user: User | null = null
    groups: Ref<Array<typeof schema.RRM_V2_Groups.$inferSelect>> = ref([]) // Groups containing Channel IDs
    moderated: Ref<Array<string>> = ref([]) // Channel IDs
    channels: Ref<Record<string, RRM_V2_TwitchChannel>> = ref({}) // converts IDs to channel info
    activeSessions: Ref<Record<string, typeof schema.RRM_V2_Sessions.$inferSelect>> = ref({})
    channelFetches: Array<string> = []
    currentSessionId: Ref<number> = ref(-1)
    currentRequests: Ref<Record<string, typeof schema.RRM_V2_Requests.$inferSelect>> = ref({})
    currentSessionUptime: Ref<number> = ref(0)
    uptimeTimer: NodeJS.Timeout | undefined
    heartbeatTimer: NodeJS.Timeout | undefined
    pingUpload: Ref<number> = ref(-1)
    pingDownload: Ref<number> = ref(-1)
    isConnected: Ref<boolean> = ref(false)

    constructor(modalManager: ModalManager) {
        this.modalManager = modalManager
        console.log("RRM V2 Panel Client")
    }

    async connectToServer() {
        if (this.ws) {return}
        this.ws = new WebSocket("/api/rrm_v2/panel")
        this.ws.addEventListener("open", async (event) => {
            console.log("Connected to Server")
            this.isConnected.value = true

            await this.sendMessage('getActiveSessions', {channelId: this.user!.id})

            this.uptimeTimer = setInterval(async () => {
                await this.updateUptime()
            }, 500)

            this.heartbeatTimer = setInterval(async () => {
                await this.sendMessage('heartbeat', {client: new Date().getTime()})
            }, 2000)
        })

        this.ws.addEventListener("message", async (event) => {
            let msg: {type: string, value: any} = JSON.parse(event.data)
            if (!msg.type) {
                console.warn(`Unknown message: ${msg}`)
                return
            }

            console.debug(`Processing Message: ${msg.type}`)
            try {
                switch (msg.type) {
                    case "heartbeat":
                        let heartbeat = JSON.parse(msg.value)
                        this.pingUpload.value = Math.abs(heartbeat.server - heartbeat.client)
                        this.pingDownload.value = Math.abs(new Date().getTime() - heartbeat.server)
                        console.debug(`Received Heartbeat (${this.pingUpload.value}ms | ${this.pingDownload.value}ms)`)
                        break
                    case "getPermittedChannels":
                        let data = JSON.parse(msg.value)
                        this.groups.value = data.groups
                        this.moderated.value = data.moderated
                        for (const channel of Object.values(data.channels) as Array<RRM_V2_TwitchChannel>) {
                            this.channels.value[channel.id] = channel
                        }
                        break
                    case "getActiveSessions":
                        if (msg.value) {
                            this.activeSessions.value = {}
                            for (const session of JSON.parse(msg.value)) {
                                this.activeSessions.value[session.id] = session
                            }
                            if (this.currentSessionId.value === -1) {
                                let savedSessionId = localStorage.getItem("RRM_V2_CurrentSessionId")
                                if (Number(savedSessionId)) {
                                    console.log(`Loading saved Session ID: ${savedSessionId}`)
                                    await this.setCurrentSession(Number(savedSessionId))
                                }
                            }
                        }
                        break
                    case "fetchChannelById":
                        let channel = JSON.parse(msg.value)
                        if (channel) {
                            this.channels.value[channel.id] = channel
                            this.channelFetches.splice(this.channelFetches.indexOf(channel.id), 1)
                        }
                        break
                    case "updateCurrentSession":
                        let session = JSON.parse(msg.value)
                        console.debug(`Incoming Session: ${msg.value}`)
                        if (msg.value !== JSON.stringify(this.activeSessions.value[session.id])) {
                            this.activeSessions.value[session.id] = session
                            console.log("Session Updated")
                        }
                        break
                    case "updateCurrentRequests":
                        let requests: Array<typeof schema.RRM_V2_Requests.$inferSelect> = JSON.parse(msg.value)
                        console.debug(`Incoming Requests: ${msg.value}`)
                        let reqCount = 0
                        for (let req of requests) {
                            this.currentRequests.value[String(req.id)] = req
                            reqCount++
                        }
                        console.log(`${reqCount} Requests Updated`)
                        break
                    case "sendNotification":
                        let notification = JSON.parse(msg.value)
                        console.debug(`Incoming Notification: ${msg.value}`)
                        await this.modalManager.showNotification(notification.title, notification.colour, notification.message)
                        break
                    default:
                        console.warn(`Unknown type: ${msg.type}`)
                        break
                }
            } catch (e) {
                console.error(e)
            }
            return
        })
        this.ws.addEventListener("close", async (event) => {
            console.log("Disconnected from Server")
        })
        this.ws.addEventListener("error", async (event) => {
            console.error(`Connection Error: ${event}`)
        })
    }

    async updateUptime() {
        if (this.getCurrentSession.value) {
            this.currentSessionUptime.value = Math.floor(new Date().getTime() - this.getCurrentSession.value.startTime) / 1000
        } else {
            this.currentSessionUptime.value = 0
        }
    }

    async disconnectFromServer() {
        this.ws!.close()
    }

    async sendMessage(type: string, value: any) {
        this.ws?.send(JSON.stringify({type: type, value: value}))
    }

    async getChannelById(channelId: string) {
        if (this.channels.value[channelId]) {
            return this.channels.value[channelId]
        } else {
            await this.fetchChannelById(channelId)
            return
        }
    }

    async fetchChannelById(channelId: string) {
        if (this.channelFetches.includes(channelId)) {
            return
        }
        this.channelFetches.push(channelId)
        await this.sendMessage("fetchChannelById", {channelId: channelId})
        return
    }

    async setCurrentSession(sessionId: number) {
        this.currentSessionId.value = sessionId
        localStorage.setItem("RRM_V2_CurrentSessionId", String(sessionId))
        await this.sendMessage("setCurrentSession", {sessionId: sessionId})
    }

    getCurrentSession = computed(() => {
        return this.activeSessions.value[String(this.currentSessionId.value)]
    })

    isCurrentSessionValid = computed(() => {
        return this.getCurrentSession.value !== undefined
    })

    getCurrentRequestQueue = computed(() => {
        let currentSession = this.getCurrentSession.value
        if (!currentSession) {return []}

        let queue = []
        let keys = Object.keys(this.currentRequests.value)
        for (let requestId of currentSession.requests) {
            if (keys.includes(String(requestId))) {
                queue.push(this.currentRequests.value[requestId])
            }
        }
        return queue
    })

    getUptime = computed(() => {
        return this.currentSessionUptime.value
    })
}