import {createApp} from "vue";
import NotificationItem from "~/components/rrm_v2/modals/notification-item.vue";

export function useModalManager() {
    return new Modal_Manager();
}

export type ModalManager = InstanceType<typeof Modal_Manager>

class Modal_Manager {
    private modalAppList: Record<string, any> = {}
    private modalNodeList: Record<string, HTMLDivElement> = {}
    private background: HTMLElement | null = null
    private contents: HTMLElement | null = null
    private notificationContainer: HTMLElement | null = null
    private notificationAppList: Record<string, any> = {}
    private notificationNodeList: Record<string, HTMLDivElement> = {}

    constructor() {
    }

    async onMounted () {
        this.background = document.getElementById("ModalBackground")
        this.contents = document.getElementById("ModalContents")
        this.notificationContainer = document.getElementById("NotificationContainer")
    }

    async showModal(name: string, component: Component, context: any = {}) {
        if (!this.contents || !this.background){return}
        console.log(`Opening Modal: ${name}`)
        context.name = name
        context.modalManager = this
        this.modalNodeList[name] = this.contents.appendChild(document.createElement("div"))
        this.modalAppList[name] = createApp(component, context)
        this.modalAppList[name].mount(this.modalNodeList[name])
        this.background.style.opacity = "100%"
        this.background.style.pointerEvents = "auto"
        this.background.style.display = "block"
        this.contents.style.pointerEvents = "auto"
        return this.modalAppList[name]
    }

    async hideModal(name: string) {
        if (!this.contents || !this.background){return}
        console.log(`Closing Modal: ${name}`)
        this.modalAppList[name].unmount()
        delete this.modalAppList[name]
        delete this.modalNodeList[name]
        if (Object.keys(this.modalAppList).length === 0) {
            this.background.style.opacity = "0"
            this.background.style.display = "none"
            this.background.style.pointerEvents = "none"
        }
    }

    async showNotification(title: string, colour: string, message: string) {
        if (!this.notificationContainer){return}
        let uid = crypto.randomUUID()
        console.log(`Adding Notification: ${uid}`)
        let context = {
            uid: uid,
            title: title,
            colour: colour,
            message: message,
            modalManager: this
        }
        this.notificationNodeList[uid] = this.notificationContainer.appendChild(document.createElement("div"))
        this.notificationAppList[uid] = createApp(NotificationItem, context)
        this.notificationAppList[uid].mount(this.notificationNodeList[uid])
        return uid
    }

    async hideNotification(uid: string) {
        if (!this.notificationContainer){return}
        console.log(`Removing Notification: ${uid}`)
        this.notificationAppList[uid].unmount()
        delete this.notificationAppList[uid]
        delete this.notificationNodeList[uid]
    }
}
