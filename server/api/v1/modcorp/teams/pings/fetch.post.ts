export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "id": z.number().min(0)
    }))

    try {
        let targetTeam
        if (context.body.id) {
            targetTeam = await db.query.ModCorp_TeamRolePings.findMany({
                where: (ping, {eq}) => {
                    return eq(ping.team, context.body.id!)
                }
            })
        } else {
            throw createError({statusCode: 400, statusMessage: `No Team ID given.`})
        }
        if (targetTeam) {
            return targetTeam
        } else {
            throw createError({statusCode: 400, statusMessage: `No Pings found.`})
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to fetch Team Pings.`})
    }
})