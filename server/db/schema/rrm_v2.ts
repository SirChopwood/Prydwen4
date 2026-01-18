import { integer, sqliteTable, text, primaryKey,  } from 'drizzle-orm/sqlite-core';
import {RRM_V2_TwitchChannel} from "~~/server/utils/rrm_v2/users";

// RAMI REQUEST MANAGER V2
export const RRM_V2_Sessions = sqliteTable("RRM_V2_Sessions", {
    id: integer()
        .primaryKey({ autoIncrement: true }),

    requests: text({mode: "json"})
        .$type<Array<number>>()
        .default([]) // Array of RRM_Request ids
        .notNull(),

    status: text({enum: ["Open", "Closed", "Locked"]})
        .default("Open")
        .notNull(),

    sources: text({mode: "json"})
        .$type<Array<String>>()
        .default(["PlainText"])
        .notNull(),

    startTime: text()
        .notNull(),

    endTime: text(),

    lastUser: text()
        .notNull(),

    channels: text({mode: "json"})
        .$type<Array<RRM_V2_TwitchChannel>>()
        .default([]) // Twitch Account Infos
        .notNull(),

    position: integer()
        .default(0)
        .notNull(),

    notification: text()
        .default("")
        .notNull(),
});

export const RRM_V2_Requests = sqliteTable("RRM_V2_Requests", {
    id: integer()
        .primaryKey({ autoIncrement: true }),

    sessionId: integer()
        .notNull(),

    timestamp: text()
        .notNull(),

    text: text()
        .notNull(),

    user: text()
        .notNull(),

    code: text()
        .notNull(),

    metadata: text({mode: "json"})
        .notNull(),
});

export const RRM_V2_Groups = sqliteTable("RRM_V2_Groups", {
    id: integer()
        .primaryKey({ autoIncrement: true }),

    name: text()
        .notNull(),

    desc: text()
        .notNull()
        .default(""),

    channels: text({mode: "json"})
        .$type<Array<string>>()
        .default([]) // Array of twitch account IDs
        .notNull(),
});