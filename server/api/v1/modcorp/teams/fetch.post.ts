export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "id": z.number().min(0).optional(),
        "name": z.string().optional(),
    }))

    try {
        let targetTeam
        if (context.body.id) {
            targetTeam = await db.query.ModCorp_Team.findFirst({
                where: (team, {eq}) => {
                    return eq(team.id, context.body.id!)
                }
            })
        } else if (context.body.name) {
            targetTeam = await db.query.ModCorp_Team.findFirst({
                where: (team, {eq}) => {
                    return eq(team.name, context.body.name!)
                }
            })
        } else {
            throw createError({statusCode: 400, statusMessage: `No Team ID or Name given.`})
        }
        if (targetTeam) {
            return targetTeam
        } else {
            throw createError({statusCode: 400, statusMessage: `Team ID or Name Invalid.`})
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to fetch Team.`})
    }
})