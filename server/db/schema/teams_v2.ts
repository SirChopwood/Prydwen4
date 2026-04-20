import {integer, sqliteTable, text} from "drizzle-orm/sqlite-core";

export const Teams_V2_Teams = sqliteTable("Teams_V2_Teams", {
    id: integer("id")
        .primaryKey({ autoIncrement: true }),

    active: integer("active")
        .notNull()
        .default(0),

    name: text("name")
        .notNull(),

    description: text("description")
        .notNull()
        .default(""),

    colour: text("colour")
        .notNull()
        .default("#ffbb00"),

    logo_url: text("logo_url")
        .notNull()
        .default(""),

    score: integer()
        .notNull()
        .default(0),

    guild: text("guild")
        .notNull(),

    channel: text("channel")
        .notNull(),

    role: text("role")
        .notNull(),
})

export const Teams_V2_Users = sqliteTable("Teams_V2_Users", {
    id: integer("id")
        .primaryKey({ autoIncrement: true }),

    user_id: text("user_id"),

    team_id: integer("team_id")
        .notNull(),

    pings_enabled: integer("pings_enabled")
        .notNull()
        .default(0),

    score_contribution: integer("score_contribution")
        .notNull()
        .default(0),
})

export const Teams_V2_Logs = sqliteTable("Teams_V2_Logs", {
    id: integer("id")
        .primaryKey({ autoIncrement: true }),

    team_id: integer("team_id")
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