import {schema} from "#build/types/nitro-imports";

export default defineWebSocketHandler({
    open(peer) {
        peer.send({type: "connection", value: "Open"})
        console.log("Connection Opened")
    },

    async message(peer, message) {
        let msg: {type: string, value: any} = message.json()
        if (!msg.type) {
            console.log(`Unknown message: ${msg}`)
            return
        }

        console.log(`Processing Message: ${msg.type}`)
        try {
            switch (msg.type) {
                case "createSession":
                    await createSession(msg.value.hostId, msg.value.channels, msg.value.sources)
                    break
                case "test":
                    setInterval(updateSession, 5000, peer, msg.value)
                    peer.send({ type: "test", message: "Set" })
                    break
                default:
                    console.log(`Unknown type: ${msg.type}`)
                    break
            }
        } catch (e) {
            console.log(e)
        }
        return
    },

    close(peer) {
        console.log("Connection Closed")
    },
})

async function sendSessionUpdate(sessionId: number) {
    let session = await fetchSession(sessionId)
}

// class RRM_V2_Panel {
//     session: typeof schema.RRM_V2_Sessions.$inferSelect
// }