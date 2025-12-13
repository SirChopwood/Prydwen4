import {eq} from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const context = await validateRequest(event, z.strictObject({
        "token": z.string(),
        "user_name": z.string(),
        "user_id": z.string(),
        "id": z.number().min(0),
        "name": z.string().optional(),
        "description": z.string().optional(),
        "file": z.string().optional(),
        "type": z.enum(["Medal", "Ribbon", "Participation"]).optional(),
        "tiers": z.array(z.strictObject({
            name: z.string(),
            description: z.string(),
            file: z.string()
        })).optional()
    }))
    if (context.body.token !== process.env.MODCORP_TOKEN) {
        throw createError({statusCode: 400, statusMessage: `Invalid token.`})
    }

    let result: Array<object> | null = null

    try {
        if (context.body.name) {
            result = await db.update(schema.ModCorp_Achievements)
                .set({name: context.body.name})
                .where(eq(schema.ModCorp_Achievements.id, context.body.id))
                .returning()
        }
        if (context.body.description) {
            result = await db.update(schema.ModCorp_Achievements)
                .set({description: context.body.description})
                .where(eq(schema.ModCorp_Achievements.id, context.body.id))
                .returning()
        }
        if (context.body.file) {
            result = await db.update(schema.ModCorp_Achievements)
                .set({file: context.body.file})
                .where(eq(schema.ModCorp_Achievements.id, context.body.id))
                .returning()
        }
        if (context.body.type) {
            result = await db.update(schema.ModCorp_Achievements)
                .set({type: context.body.type})
                .where(eq(schema.ModCorp_Achievements.id, context.body.id))
                .returning()
        }
        if (context.body.tiers) {
            result = await db.update(schema.ModCorp_Achievements)
                .set({tiers: context.body.tiers})
                .where(eq(schema.ModCorp_Achievements.id, context.body.id))
                .returning()
        }
    } catch (error) {
        console.log(error)
        throw createError({statusCode: 400, statusMessage: `Failed to edit Achievement.`})
    }

    if (result && result.length > 0) {
        await db.insert(schema.ModCorp_Logs).values({
            "user_name": context.body.user_name,
            "user_id": context.body.user_id,
            "action": `Edited the data of achievement [${context.body.id}].`,
            "reason": null,
            "timestamp": new Date().toISOString()
        })
        return result
    } else {
        throw createError({statusCode: 400, statusMessage: `Could not find achievement or value to edit.`})
    }
})


