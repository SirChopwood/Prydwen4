PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Raids_V2_Users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`raid_id` integer NOT NULL,
	`team_id` integer NOT NULL,
	`class` integer NOT NULL,
	`isHero` integer DEFAULT 0 NOT NULL,
	`choices` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_Raids_V2_Users`("user_id", "raid_id", "team_id", "class", "isHero", "choices") SELECT "user_id", "raid_id", "team_id", "class", "isHero", "choices" FROM `Raids_V2_Users`;--> statement-breakpoint
DROP TABLE `Raids_V2_Users`;--> statement-breakpoint
ALTER TABLE `__new_Raids_V2_Users` RENAME TO `Raids_V2_Users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;