export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "user_name": z.string(),
        "user_id": z.string(),

        "name": z.string(),
        "description": z.string(),
        "file": z.string(),
        "contents": z.array(z.number().min(0)),
        "active": z.boolean()
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }



    try {
        let newBanner = await db.insert(schema.ModCorp_Banners).values({
            "name": context.body.name,
            "description": context.body.description,
            "file": context.body.file,
            "contents": context.body.contents,
            "active": context.body.active
        }).returning()
        if (newBanner) {
            await db.insert(schema.ModCorp_Logs).values({
                "user_name": context.body.user_name,
                "user_id": context.body.user_id,
                "action": `Created a new banner [${newBanner[0].id}] ${newBanner[0].name}.`,
                "reason": null,
                "timestamp": new Date().toISOString()
            })
            return newBanner
        } else {
            throw createError({statusCode: 400, statusMessage: `Failed to create a new banner.`})
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to create a new card.`})
    }
})


