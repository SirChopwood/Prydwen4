export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "user_id": z.string().optional(),
        "raid_id": z.number().min(0),
    }))

    try {
        let users
        if (context.body.user_id) {
             users = await db.query.Raids_V2_Users.findMany({
                where: (user, {eq, and}) => {
                    return and(
                        eq(user.user_id, context.body.user_id!),
                        eq(user.raid_id, context.body.raid_id)
                    )
                }
            })
        } else {
            users = await db.query.Raids_V2_Users.findMany({
                where: (user, {eq, and}) => {
                    return eq(user.raid_id, context.body.raid_id)
                }
            })
        }

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