import {createRequest} from "#server/utils/rrm_v2/requests";

export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        sessionId: z.number(),
        user: z.string(),
        codes: z.array(z.string()).min(1)
    }), false)

    let results = []
    let session = await fetchSession(context.body.sessionId)
    if (session) {
        for (let request of context.body.codes) {
            for (let sourceName of session.sources) {
                let result
                try {
                    result = await Sources[String(sourceName)]!(request)
                } catch (e) {
                    console.log(`Failed to process ${request} as ${sourceName}, with Error: ${e}`)
                    continue
                }
                if (result) {
                    console.log(`Processed ${request} as ${sourceName}.`)
                    let success = await createRequest(context.body.sessionId, context.body.user, result)
                    if (success) {
                        results.push(success)
                        break
                    }
                } else {
                    console.log(`Failed to process ${request} as ${sourceName}.`)
                }
            }
            console.log(`Request ${request} could not be validated in any sources.`)
        }
        return results
    }
})