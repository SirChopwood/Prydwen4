export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "raid_id": z.number().optional()
    }))

    try {
        if (context.body.raid_id) { // Fetch specified raid
            let targetRaid = await db.query.Raids_V2_Raids.findFirst({
                where: (raid, {eq, and}) => {
                    return and(
                        eq(raid.id, context.body.raid_id!),
                        eq(raid.active, 1)
                    )
                }
            })
            if (targetRaid) {
                return targetRaid
            } else {
                throw createError({statusCode: 400, statusMessage: `Raid ID Invalid.`})
            }
        } else { // Fetch all active raids if none specified
            let targetRaids = await db.query.Raids_V2_Raids.findMany({
                where: (raid, {eq}) => {
                    return eq(raid.active, 1)
                }
            })
            if (targetRaids) {
                return targetRaids
            }
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to fetch Raid.`})
    }
})