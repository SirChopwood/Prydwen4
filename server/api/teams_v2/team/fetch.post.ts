export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "team_id": z.number().min(0)
    }))

    try {
        let targetTeam = await db.query.Teams_V2_Teams.findFirst({
            where: (team, {eq, and}) => {
                return and(
                    eq(team.id, context.body.team_id),
                    eq(team.active, 1)
                )
            }
        })

        if (targetTeam) {
            return targetTeam
        } else {
            throw createError({statusCode: 400, statusMessage: `Team ID Invalid.`})
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to fetch Team.`})
    }
})