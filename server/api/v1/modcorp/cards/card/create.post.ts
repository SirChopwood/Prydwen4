import {cardRarity} from "~~/server/utils/modcorp/cards";

export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "user_name": z.string(),
        "user_id": z.string(),

        "name": z.string(),
        "description": z.string(),
        "file": z.string(),
        "rarity": z.number().min(0).max((Object.keys(cardRarity).length-1))
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }



    try {
        let newCard = await db.insert(schema.ModCorp_Cards).values({
            "name": context.body.name,
            "description": context.body.description,
            "file": context.body.file,
            "rarity": context.body.rarity,
        }).returning()
        if (newCard) {
            await db.insert(schema.ModCorp_Logs).values({
                "user_name": context.body.user_name,
                "user_id": context.body.user_id,
                "action": `Created a new card [${newCard[0].id}] ${newCard[0].name} (${newCard[0].rarity}).`,
                "reason": null,
                "timestamp": new Date().toISOString()
            })
            return newCard
        } else {
            throw createError({statusCode: 400, statusMessage: `Failed to create a new card.`})
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to create a new card.`})
    }
})


