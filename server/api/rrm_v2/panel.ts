import type {Peer} from "crossws";
import {RRM_V2_PanelServer} from "#server/utils/rrm_v2/server";

interface RRM_V2_Peer extends Peer {
    context: {
        server?: RRM_V2_PanelServer,
        updateTimer?: NodeJS.Timeout
    }
}

export default defineWebSocketHandler({
    async upgrade(request) {
        await requireUserSession(request)
        console.log("Connection Upgrading...")
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
        await peer.context.server.processMessage(msg.type, msg.value)
    },

    async close(peer: RRM_V2_Peer) {
        console.log("Connection Closed")
    },
})