export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "team_ids": z.array(z.number().min(0))
    }))

    try {
        if (context.body.team_ids.length > 0) { // Fetch specified teams
            let results = []
            for (const team_id of context.body.team_ids) {
                let targetTeam = await db.query.Teams_V2_Teams.findFirst({
                    where: (team, {eq, and}) => {
                        return and(
                            eq(team.id, team_id),
                            eq(team.active, 1)
                        )
                    }
                })
                if (targetTeam) {
                    results.push(targetTeam)
                } else {
                    throw createError({statusCode: 400, statusMessage: `Team ID Invalid.`})
                }
            }
            return results
        } else { // Fetch all active teams if none specified
            let targetTeams = await db.query.Teams_V2_Teams.findMany({
                where: (team, {eq}) => {
                    return eq(team.active, 1)
                }
            })
            if (targetTeams) {
                return targetTeams
            }
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to fetch Teams.`})
    }
})