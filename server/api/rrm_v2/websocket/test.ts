import {Peer} from "crossws";

export default defineWebSocketHandler({
    open(peer) {
        peer.send({type: "connection", value: "Open"})
        peer.context.class = new TestClass(peer)
    },

    async message(peer, message) {
        let msg: { type: string, value: any }
        try {
            msg = message.json()
        } catch (e) {
            console.log(`Unknown message: ${message.text()}`)
            return
        }
        if (!msg.type) {
            console.log(`Unknown message type: ${msg}`)
            return
        }

        console.log(`Processing Message: ${msg.type}`)
        switch (msg.type) {
            case "ping":
                await pingTest(peer)
                break
            case "test":
                setInterval(updateSession, 5000, peer, msg.value)
                peer.send({ type: "test", value: "Set" })
                break
            case "class":
                // @ts-ignore
                await peer.context.class.testFunction()
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
    peer.send({ type: "ping", value: "pong" })
}

async function updateSession(peer: Peer, msg: any) {
    peer.send({ type: "test", value: `${msg} - ${ new Date().toUTCString() }` })
}

class TestClass {
    randomNumber: number = Math.floor(Math.random() * 100)
    peer: Peer

    constructor(peer: Peer) {
        this.peer = peer
    }

    async testFunction() {
        console.log(this.randomNumber)
        this.peer.send({ type: "class", value: String(this.randomNumber) })
    }
}