export default defineOAuthTwitchEventHandler({
    config: {
        scope: ['user:read:follows', 'user:read:email', 'user:read:moderated_channels']
    },
    async onSuccess(event, {user, tokens}) {
        console.log("success")
        await setUserSession(event, {
            user: user,
            secure: tokens
        })
        return sendRedirect(event, '/rrm_v2')
    },
    async onError() {
        console.log("Fail")
    }
})