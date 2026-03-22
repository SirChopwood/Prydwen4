import type {Peer} from "crossws";
import {RRM_V2_OverlayServer} from "#server/utils/rrm_v2/server";

interface RRM_V2_Peer extends Peer {
    context: {
        server?: RRM_V2_OverlayServer,
        updateTimer?: NodeJS.Timeout
    }
}

export default defineWebSocketHandler({
    async upgrade(request) {
        console.log("Connection Upgrading...")
    },

    async open(peer: RRM_V2_Peer) {
        peer.context.server = new RRM_V2_OverlayServer(peer)
        console.log("Connection Opened")
        // Keep timer here to prevent issue of Durable Object closing as it scans for any Timers set in the main handler, not Classes.
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