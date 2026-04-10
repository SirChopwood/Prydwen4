import type {schema} from "#build/types/nitro-imports";
import type {User} from "#auth-utils";

//     ▄▄▄▄▄▄
//     ██▀▀▀▀██
//     ██    ██   ▄█████▄  ▄▄█████▄   ▄████▄
//     ███████    ▀ ▄▄▄██  ██▄▄▄▄ ▀  ██▄▄▄▄██
//     ██    ██  ▄██▀▀▀██   ▀▀▀▀██▄  ██▀▀▀▀▀▀
//     ██▄▄▄▄██  ██▄▄▄███  █▄▄▄▄▄██  ▀██▄▄▄▄█
//     ▀▀▀▀▀▀▀    ▀▀▀▀ ▀▀   ▀▀▀▀▀▀     ▀▀▀▀▀
export function useBaseClient() {
    return new RRM_V2_BaseClient("Base", "/api/rrm_v2/websocket/panel")
}

export class RRM_V2_BaseClient {
    ws: WebSocket | null = null
    channel: string = ""
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
    socketPath: string
    enableSessionRecall: boolean
    sessionTimer: NodeJS.Timeout | undefined

    constructor(
        type: string,
        socketPath: string,
        enableSessionRecall: boolean = false
    ) {
        this.socketPath = socketPath
        this.enableSessionRecall = enableSessionRecall
        console.log(`RRM V2 ${type} Client`)
    }

    async connectToServer(channel: string) {
        if (this.ws) {return}
        this.channel = channel
        this.ws = new WebSocket(this.socketPath)
        this.ws.addEventListener("open", async (event) => {
            await this.postConnectToServer()
        })

        this.ws.addEventListener("message", async (event) => {
            let msg: {type: string, value: any} = JSON.parse(event.data)
            if (!msg.type) {
                console.warn(`Unknown message: ${msg}`)
                return
            }
            try {
                await this.processMessage(msg.type, msg.value)
            } catch (e) {
                console.log("Error caught during message processing.")
                console.error(e)
            }
            return
        })
        this.ws.addEventListener("close", async (event) => {
            console.info("Disconnected from Server")
        })
    }

    async postConnectToServer() {
        console.info("Connected to Server")
        this.isConnected.value = true

        await this.sendMessage('getActiveSessions', {channelId: this.channel})

        this.uptimeTimer = setInterval(async () => {
            await this.updateUptime()
        }, 500)

        this.heartbeatTimer = setInterval(async () => {
            await this.sendMessage('heartbeat', {client: new Date().getTime()})
        }, 2000)

        // Forces the session list to constantly update if none is found or if the current one isnt valid anymore.
        this.sessionTimer = setInterval(async () => {
            if (this.getCurrentSession.value) {
                if (this.getCurrentSession.value.sessionState === "Open") {
                    return
                }
            }
            if (this.currentSessionId.value !== -1) {
                await this.sendMessage("setCurrentSession", {sessionId: -1})
            }
            console.log("Searching for Open Sessions...")
            await this.sendMessage('getActiveSessions', {channelId: this.channel})
        }, 10000)
    }

    async processMessage(type: string, value: any) {
        console.debug(`Processing Message: ${type}`)
        try {
            switch (type) {
                case "heartbeat":
                    let heartbeat = JSON.parse(value)
                    this.pingUpload.value = Math.abs(heartbeat.server - heartbeat.client)
                    this.pingDownload.value = Math.abs(new Date().getTime() - heartbeat.server)
                    console.debug(`Received Heartbeat (${this.pingUpload.value}ms | ${this.pingDownload.value}ms)`)
                    return true
                case "getActiveSessions":
                    console.log(value)
                    if (value) {
                        this.activeSessions.value = {}
                        for (const session of JSON.parse(value)) {
                            this.activeSessions.value[session.id] = session
                        }
                        if (this.currentSessionId.value === -1 && this.enableSessionRecall) {
                            let savedSessionId = localStorage.getItem("RRM_V2_CurrentSessionId")
                            if (savedSessionId && Number(savedSessionId) && Object.keys(this.activeSessions.value).includes(savedSessionId)) {
                                console.info(`Loading saved Session ID: ${savedSessionId} (Started: ${this.activeSessions.value[savedSessionId]!.startTime})`)
                                await this.setCurrentSession(Number(savedSessionId))
                            }
                        }
                    }
                    return true
                case "updateCurrentSession":
                    let session = JSON.parse(value)
                    console.debug(`Incoming Session: ${value}`)
                    if (value !== JSON.stringify(this.activeSessions.value[session.id])) {
                        this.activeSessions.value[session.id] = session
                        console.log(`Session Updated: ID ${session.id}`)
                    }
                    return true
                case "updateCurrentRequests":
                    let requests: Array<typeof schema.RRM_V2_Requests.$inferSelect> = JSON.parse(value)
                    console.debug(`Incoming Requests: ${value}`)
                    let reqCount = 0
                    for (let req of requests) {
                        this.currentRequests.value[String(req.id)] = req
                        reqCount++
                    }
                    console.log(`Requests Updated: ${reqCount}`)
                    return true
                default:
                    return false
            }
        } catch (e) {
            console.error(e)
        }
        return false
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

    async setCurrentSession(sessionId: number) {
        this.currentSessionId.value = sessionId
        await this.sendMessage("setCurrentSession", {sessionId: sessionId})
        if (this.enableSessionRecall) {
            localStorage.setItem("RRM_V2_CurrentSessionId", String(sessionId))
        }
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
        console.debug(`Visible Queue Length: ${queue.length}`)
        return queue
    })

    getUptime = computed(() => {
        return this.currentSessionUptime.value
    })
}

//     ▄▄▄▄▄▄                                  ▄▄▄▄
//     ██▀▀▀▀█▄                                ▀▀██
//     ██    ██   ▄█████▄  ██▄████▄   ▄████▄     ██
//     ██████▀    ▀ ▄▄▄██  ██▀   ██  ██▄▄▄▄██    ██
//     ██        ▄██▀▀▀██  ██    ██  ██▀▀▀▀▀▀    ██
//     ██        ██▄▄▄███  ██    ██  ▀██▄▄▄▄█    ██▄▄▄
//     ▀▀         ▀▀▀▀ ▀▀  ▀▀    ▀▀    ▀▀▀▀▀      ▀▀▀▀
export function usePanelClient(modalManager: ModalManager) {
    return new RRM_V2_PanelClient(modalManager)
}

export class RRM_V2_PanelClient extends RRM_V2_BaseClient{
    modalManager: ModalManager
    user: User | null = null
    groups: Ref<Array<typeof schema.RRM_V2_Groups.$inferSelect>> = ref([]) // Groups containing Channel IDs
    moderated: Ref<Array<string>> = ref([]) // Channel IDs
    channels: Ref<Record<string, RRM_V2_TwitchChannel>> = ref({}) // converts IDs to channel info

    constructor(modalManager: ModalManager) {
        super("Panel", "/api/rrm_v2/websocket/panel", true)
        this.modalManager = modalManager
    }

    override async connectToServer(channel: string) {
        await super.connectToServer(channel)
    }

    override async postConnectToServer() {
        await super.postConnectToServer()
        await this.sendMessage('getPermittedChannels', '')
    }

    override async processMessage(type: string, value: any) {
        if (!await super.processMessage(type, value)) {
            try {
                switch (type) {
                    case "getPermittedChannels":
                        let data = JSON.parse(value)
                        this.groups.value = data.groups
                        this.moderated.value = data.moderated
                        for (const channel of Object.values(data.channels) as Array<RRM_V2_TwitchChannel>) {
                            this.channels.value[channel.id] = channel
                        }
                        return true
                    case "fetchChannel":
                        let channel = JSON.parse(value)
                        if (channel) {
                            this.channels.value[channel.id] = channel
                            this.channelFetches.splice(this.channelFetches.indexOf(channel.id), 1)
                        }
                        return true
                    case "sendNotification":
                        let notification = JSON.parse(value)
                        console.debug(`Incoming Notification: ${value}`)
                        await this.modalManager.showNotification(notification.title, notification.colour, notification.message)
                        return true
                    default:
                        console.warn(`Unknown type: ${type}`)
                        return false
                }
            } catch (e) {
                console.error(e)
            }
            return false
        } else {
            return true
        }
    }

    async getChannelById(channelId: string) {
        if (this.channels.value[channelId]) {
            return this.channels.value[channelId]
        } else {
            await this.fetchChannel(channelId)
            return
        }
    }

    async fetchChannel(channel: string) {
        if (this.channelFetches.includes(channel)) {
            return
        }
        this.channelFetches.push(channel)
        await this.sendMessage("fetchChannel", {channel: channel})
        return
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
export function useOverlayClient() {
    return new RRM_V2_OverlayClient()
}

export class RRM_V2_OverlayClient extends RRM_V2_BaseClient {
    constructor() {
        super("Overlay", "/api/rrm_v2/websocket/overlay")
    }

    override async processMessage(type: string, value: any) {
        let success = await super.processMessage(type, value)
        // Force the current session to the first found Active session
        if (type === "getActiveSessions" && success) {
            let keys = Object.keys(this.activeSessions.value)
            if (keys.length > 0) {
                await this.setCurrentSession(this.activeSessions.value[keys[0]!]!.id)
            }
        }
        return success
    }

    getCurrentRequest = computed(() => {
        if (this.getCurrentRequestQueue.value.length > 0 && this.getCurrentSession.value) {
            return this.getCurrentRequestQueue.value[this.getCurrentSession.value.position]
        }
    })

    getCurrentPosition = computed(() => {
        if (this.getCurrentSession.value) {
            return this.getCurrentSession.value?.position
        }
    })

    getRequestQueue = computed(() => {
        return this.getCurrentRequestQueue.value
    })
}