export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "team_ids": z.array(z.number().min(0))
    }))

    let results: Record<number, number> = {}

    for await (const team_id of context.body.team_ids) {
        try {
            let targetTeam = await db.query.Teams_V2_Teams.findFirst({
                where: (team, {eq, and}) => {
                    return and(
                        eq(team.id, team_id),
                        eq(team.active, 1)
                    )
                }
            })

            if (targetTeam) {
                results[team_id] = targetTeam.score
            } else {
                throw createError({statusCode: 400, statusMessage: `Team ID Invalid.`})
            }
        } catch (error) {
            console.log(error)
            throw createError({statusCode: 400, statusMessage: `Failed to fetch Team.`})
        }
    }

    return results
})