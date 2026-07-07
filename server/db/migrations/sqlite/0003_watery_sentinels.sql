CREATE TABLE `Raids_V2_Logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`raid_id` integer NOT NULL,
	`action` text NOT NULL,
	`reason` text,
	`user_ids` text DEFAULT '[]' NOT NULL,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Raids_V2_Raids` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text NOT NULL,
	`active` integer DEFAULT 0 NOT NULL,
	`encounterIndex` integer DEFAULT 0 NOT NULL,
	`roundIndex` integer DEFAULT 0 NOT NULL,
	`overlayData` text DEFAULT '{"bossBar":{"mode":"None","percentages":{}},"messages":{},"timer":{"mode":"None"}}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Raids_V2_Users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`raid_id` integer NOT NULL,
	`team_id` integer NOT NULL,
	`class` integer NOT NULL,
	`isHero` integer DEFAULT 0 NOT NULL,
	`choices` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
ALTER TABLE `Teams_V2_Teams` ADD `icon_url` text DEFAULT '' NOT NULL;