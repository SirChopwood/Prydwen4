export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "id": z.number().min(0).optional(),
        "all": z.boolean().optional(),
    }))

    if (context.body.id) {
        try {
            let targetAchievement = await db.query.ModCorp_Achievements.findFirst({
                where: (achievement, {eq}) => {
                    return eq(achievement.id, context.body.id!)
                }
            })
            if (targetAchievement) {
                return [targetAchievement]
            } else {
                throw createError({statusCode: 400, statusMessage: `Achievement ID Invalid.`})
            }
        } catch (error) {
            console.log(error)
            throw createError({statusCode: 400, statusMessage: `Failed to fetch Achievement.`})
        }
    } else if (context.body.all) {
        try {
            let achievements = await db.select().from(schema.ModCorp_Achievements)
            return achievements
        } catch (error) {
            console.log(error)
            throw createError({statusCode: 400, statusMessage: `Failed to fetch all Achievements.`})
        }
    }

})