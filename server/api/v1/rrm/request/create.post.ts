export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "user": z.string(),
        "request": z.string(),
        "session": z.number(),
        "forceAdd": z.boolean().optional(),
    }), false)

    let session = await fetchSessionById(context.body.session, true)
    if (session) {
        const request = context.body.request

        for (let sourceName of session.sources) {
            let result
            try {
                result = await Sources[String(sourceName)](request)
            } catch (e) {
                console.log(`Failed to process ${request} as ${sourceName}, with Error: ${e}`)
                continue
            }
            if (result) {
                console.log(`Processed ${request} as ${sourceName}.`)
                return await createRequest(context.body.session, context.body.user, result, true)
            } else {
                console.log(`Failed to process ${request} as ${sourceName}.`)
            }
        }
        console.log(`Request could not be validated in any sources.`)
        throw createError({statusCode: 404, statusMessage: `Request could not be validated in any of the following Sources: ${String(session.sources)}.`})
    }
})