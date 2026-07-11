import {and, eq} from "drizzle-orm";
export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "user_name": z.string(),
        "user_id": z.string(),
        "raid_id": z.number(),
        "class": z.number(),
        "team_id": z.number(),
        "isHero": z.boolean(),
        "choices": z.array(
            z.array(
                z.object({
                    choiceIndex: z.number(),
                    roll: z.number(),
                    success: z.boolean()
                })
            )
        )
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }

    let targetUser = await db.query.Raids_V2_Users.findFirst({
        where: (user, {eq, and}) => {
            return and(
                and(
                    eq(user.user_id, context.body.user_id),
                    eq(user.raid_id, context.body.raid_id)
                )
            )
        }
    })

    let result
    try {
        if (targetUser) {
            throw createError({statusCode: 400, statusMessage: `User already exists.`})
        } else {
            result = await db.insert(schema.Raids_V2_Users).values({
                "user_id": context.body.user_id,
                "team_id": context.body.team_id,
                "class": context.body.class,
                "isHero": context.body.isHero ? 1 : 0,
                "raid_id": context.body.raid_id,
                "choices": context.body.choices
            }).returning()
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to update User.`})
    }

    if (result) {
        await db.insert(schema.Raids_V2_Logs).values({
            "raid_id": context.body.raid_id,
            "action": `Created User ${context.body.user_name}.`,
            "user_ids": [context.body.user_id],
            "reason": `Class: ${context.body.class} Hero: ${context.body.isHero}`,
            "timestamp": new Date().getTime()
        })
        return
    }
})


