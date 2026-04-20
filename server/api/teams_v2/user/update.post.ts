import {and, eq} from "drizzle-orm";
export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "user_name": z.string(),
        "user_id": z.string(),
        "team_id": z.number(),
        "pings_enabled": z.boolean()
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }

    let targetUser = await db.query.Teams_V2_Users.findFirst({
        where: (user, {eq, and}) => {
            return and(
                eq(user.user_id, context.body.user_id),
                eq(user.team_id, context.body.team_id)
            )
        }
    })

    let result
    try {
        if (targetUser) {
            result = await db.update(schema.Teams_V2_Users)
                .set({pings_enabled: context.body.pings_enabled ? 1 : 0})
                .where(and(
                    eq(schema.Teams_V2_Users.user_id, context.body.user_id),
                    eq(schema.Teams_V2_Users.team_id, context.body.team_id)
                ))
                .returning()
        } else {
            result = await db.insert(schema.Teams_V2_Users).values({
                "user_id": context.body.user_id,
                "team_id": context.body.team_id,
                "pings_enabled": context.body.pings_enabled ? 1 : 0
            }).returning()
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to update User.`})
    }

    if (result) {
        await db.insert(schema.Teams_V2_Logs).values({
            "team_id": context.body.team_id,
            "action": `Updated User ${context.body.user_name}.`,
            "user_ids": [context.body.user_id],
            "reason": `Team: ${context.body.team_id} Pings: ${context.body.pings_enabled}`,
            "timestamp": new Date().getTime()
        })
        return
    }
})


