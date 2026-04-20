import {and, eq} from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "user_ids": z.array(z.string()),
        "team_id": z.number().min(0),
        "score": z.number(),
        "reason": z.string(),
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }


    let targetTeam
    try {
        targetTeam = await db.query.Teams_V2_Teams.findFirst({
            where: (team, {eq, and}) => {
                return and(
                    eq(team.id, context.body.team_id),
                    eq(team.active, 1)
                )
            }
        })
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to fetch Team.`})
    }
    if (!targetTeam) {
        throw createError({statusCode: 400, statusMessage: `Team ID Invalid.`})
    }
    let newScore = targetTeam.score + context.body.score

    try {
        let result = await db.update(schema.Teams_V2_Teams)
            .set({score: newScore})
            .where(eq(schema.Teams_V2_Teams.id, context.body.team_id))
            .returning()

        if (result) {
            for await (const user_id of context.body.user_ids) {
                let targetUser = await db.query.Teams_V2_Users.findFirst({
                    where: (user, {eq, and}) => {
                        return and(
                            eq(user.user_id, user_id),
                            eq(user.team_id, context.body.team_id)
                        )
                    }
                })
                if (targetUser) {
                    await db.update(schema.Teams_V2_Users)
                        .set({score_contribution: targetUser.score_contribution + context.body.score})
                        .where(and(
                            eq(schema.Teams_V2_Users.user_id, user_id),
                            eq(schema.Teams_V2_Users.team_id, context.body.team_id)
                        ))
                } else {
                    console.log(`Unable to locate User with ID ${user_id} - Their score contribution will not be updated.`)
                }
            }

            await db.insert(schema.Teams_V2_Logs).values({
                "team_id": context.body.team_id,
                "action": `Adjusted [${targetTeam.id}] ${targetTeam.name}'s score by ${context.body.score} to a total of ${newScore}`,
                "user_ids": context.body.user_ids,
                "reason": context.body.reason,
                "timestamp": new Date().getTime()
            })
            return result
        }
        throw createError({statusCode: 400, statusMessage: `Failed to update Score.`})
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to update Score.`})
    }
})