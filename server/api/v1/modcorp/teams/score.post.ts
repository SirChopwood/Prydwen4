import {eq} from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "user_name": z.string(),
        "user_id": z.string(),
        "id": z.number().min(0),
        "score": z.number(),
        "reason": z.string(),
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }


    let targetTeam
    try {
        targetTeam = await db.query.ModCorp_Team.findFirst({
            where: (team, {eq}) => {
                return eq(team.id, context.body.id)
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
        let result = await db.update(schema.ModCorp_Team)
            .set({score: newScore})
            .where(eq(schema.ModCorp_Team.id, context.body.id))
            .returning()
        await db.insert(schema.ModCorp_Logs).values({
            "user_name": context.body.user_name,
            "user_id": context.body.user_id,
            "action": `Adjusted [${targetTeam.id}] ${targetTeam.name}'s score by ${context.body.score} to a total of ${newScore}`,
            "reason": context.body.reason,
            "timestamp": new Date().toISOString()
        })
        return result
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to update Score.`})
    }
})