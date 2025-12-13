export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "user_id": z.string()
    }))

    try {
        let awards = await db.query.ModCorp_AwardedAchievements.findMany({
            where: (award, {eq}) => {
                return eq(award.user_id, context.body.user_id!)
            }
        })
        if (awards) {
            let achievements: Record<string, object> = {}

            for (const award of awards) {
                let achievement = await $fetch("/api/v1/modcorp/achievements/fetch", {
                    method: "POST",
                    body:{
                        "id": award.achievement
                    }
                })
                if (!achievement || !achievement[0]) {continue}
                achievements[String(achievement[0].id)] = achievement[0]
            }
            return {awards: awards, achievements: achievements}
        } else {
            return setResponseStatus(event, 400, "User Discord ID Invalid.")
        }
    } catch (error) {
        console.log(error)
        return setResponseStatus(event, 500, "Failed to fetch user's achievements.")
    }
})

