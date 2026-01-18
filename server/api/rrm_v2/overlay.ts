import {Peer} from "crossws";

export default defineWebSocketHandler({
    open(peer) {
        peer.send({type: "connection", value: "Open"})
    },

    async message(peer, message) {
        let msg: {type: string, value: any} = message.json()
        if (!msg.type) {
            console.log(`Unknown message: ${msg}`)
            return
        }

        console.log(`Processing Message: ${msg.type}`)
        switch (msg.type) {
            case "ping":
                await pingTest(peer)
                break
            case "test":
                setInterval(updateSession, 5000, peer, msg.value)
                peer.send({ type: "test", message: "Set" })
                break
            default:
                console.log(`Unknown type: ${msg.type}`)
                break
        }
        return
    },

    close(peer) {
        peer.send({type: "connection", value: "Close"})
    },
})

async function pingTest(peer: Peer) {
    peer.send({ type: "ping", message: "pong" })
}

async function updateSession(peer: Peer, msg: any) {
    peer.send({ type: "test", message: `${msg} - ${ new Date().toUTCString() }` })
}