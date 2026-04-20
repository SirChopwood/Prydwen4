import { integer, sqliteTable, text, primaryKey,  } from 'drizzle-orm/sqlite-core';

// MODCORP BOT
export const ModCorp_Logs = sqliteTable("ModCorp_Logs", {
    id: integer("id")
        .primaryKey({ autoIncrement: true }),

    user_name: text("user_name")
        .notNull(),

    user_id: text("user_id")
        .notNull(),

    action: text("action")
        .notNull(),

    reason: text("reason"),

    timestamp: text("timestamp")
        .notNull(),
})

// MODCORP BOT - ACHIEVEMENTS MODULE
export const ModCorp_Achievements = sqliteTable("ModCorp_Achievements", {
    id: integer("id")
        .primaryKey({ autoIncrement: true }),

    name: text("name")
        .notNull(),

    description: text("description")
        .notNull(),

    file: text("file")
        .notNull(),

    type: text("type", {enum: ["Medal", "Ribbon", "Participation"]})
    .default("Medal")
    .notNull(),

    tiers: text("tiers", {mode: "json"})
        .$type<Array<{name: string, description: string, file: string}>>()
})

export const ModCorp_AwardedAchievements = sqliteTable("ModCorp_AwardedAchievements", {
    id: integer("id")
        .primaryKey({ autoIncrement: true }),

    user_id: text("discord_user_id")
        .notNull(),

    achievement: integer("achievement")
        .notNull(),

    timestamp: text("timestamp")
        .notNull(),

    note: text("note"),

    tier: integer("tier")
        .notNull()
        .default(0)
})