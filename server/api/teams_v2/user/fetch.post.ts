export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "user_id": z.string(),
        "team_id": z.number().min(0),
    }))

    try {
        let users = await db.query.Teams_V2_Users.findMany({
            where: (user, {eq, and}) => {
                return and(
                    eq(user.user_id, context.body.user_id),
                    eq(user.team_id, context.body.team_id)
                )
            }
        })
        if (users) {
            return users
        } else {
            throw createError({statusCode: 400, statusMessage: `No Users found.`})
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to Users of Team.`})
    }
})