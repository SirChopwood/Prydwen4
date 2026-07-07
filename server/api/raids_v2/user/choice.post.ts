import {and, eq} from "drizzle-orm";
export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "user_id": z.string(),
        "raid_id": z.number(),
        "choices": z.array(
            z.array(
                z.object({
                    choiceIndex: z.number(),
                    roll: z.number(),
                    success: z.boolean()
                })
            )
        )
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }

    let targetUser = await db.query.Raids_V2_Users.findFirst({
        where: (user, {eq, and}) => {
            return and(
                and(
                    eq(user.user_id, context.body.user_id),
                    eq(user.raid_id, context.body.raid_id)
                )
            )
        }
    })

    let result
    try {
        if (targetUser) {
            result = await db.update(schema.Raids_V2_Users)
                .set({choices: context.body.choices})
                .where(and(
                    eq(schema.Raids_V2_Users.user_id, context.body.user_id),
                    eq(schema.Raids_V2_Users.raid_id, context.body.raid_id)
                ))
                .returning()
        } else {
            throw createError({statusCode: 400, statusMessage: `User not found.`})
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to update User.`})
    }
})


