import {integer, sqliteTable, text} from "drizzle-orm/sqlite-core";

export const Raids_V2_Users = sqliteTable("Raids_V2_Users", {
    user_id: text("user_id")
        .primaryKey(),

    raid_id: integer("raid_id")
        .notNull(),

    team_id: integer("team_id")
        .notNull(),

    class: integer("class")
        .notNull(),

    isHero: integer("isHero")
        .notNull()
        .default(0),

    choices: text({mode: "json"})
        .$type<Array<// Encounter Index
            Array<{ // Round Index
                choiceIndex: number,
                roll: number,
                success: boolean
            }>
        >>()
        .default([]) // Array of discord account IDs
        .notNull(),
})

export const Raids_V2_Raids = sqliteTable("Raids_V2_Raids", {
    id: integer("id")
        .primaryKey({ autoIncrement: true }),

    path: text("path")
        .notNull(),

    active: integer("active")
        .notNull()
        .default(0),

    encounterIndex: integer("encounterIndex")
        .notNull()
        .default(0),

    roundIndex: integer("roundIndex")
        .notNull()
        .default(0),

    overlayData: text({mode: "json"})
        .$type<{
            bossBar: {
                mode: "None" | "HP" | "Puzzle"
                percentages: Record<string, number>
            },
            messages: {
                announcement?: string,
                title?: string,
                subtitle?: string,
            }
            timer: {
                mode: "None" | "Encounter" | "Paused"
                start?: Date,
                end?: Date
            }
        }>()
        .default({
            bossBar: {
                mode: "None",
                percentages: {}
            },
            messages: {},
            timer: {
                mode: "None",
            }
        })
        .notNull()
})

export const Raids_V2_Logs = sqliteTable("Raids_V2_Logs", {
    id: integer("id")
        .primaryKey({ autoIncrement: true }),

    raid_id: integer("raid_id")
        .notNull(),

    action: text("action")
        .notNull(),

    reason: text("reason"),

    user_ids: text({mode: "json"})
        .$type<Array<string>>()
        .default([]) // Array of discord account IDs
        .notNull(),

    timestamp: integer()
        .notNull(),
})