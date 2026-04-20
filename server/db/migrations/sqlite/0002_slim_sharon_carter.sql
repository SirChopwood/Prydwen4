CREATE TABLE `Teams_V2_Logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_id` integer NOT NULL,
	`action` text NOT NULL,
	`reason` text,
	`user_ids` text DEFAULT '[]' NOT NULL,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Teams_V2_Teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`active` integer DEFAULT 0 NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`colour` text DEFAULT '#ffbb00' NOT NULL,
	`logo_url` text DEFAULT '' NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`guild` text NOT NULL,
	`channel` text NOT NULL,
	`role` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Teams_V2_Users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`team_id` integer NOT NULL,
	`pings_enabled` integer DEFAULT 0 NOT NULL,
	`score_contribution` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DROP TABLE `ModCorp_Banners`;--> statement-breakpoint
DROP TABLE `ModCorp_Cards`;--> statement-breakpoint
DROP TABLE `ModCorp_Team`;--> statement-breakpoint
DROP TABLE `ModCorp_TeamRolePings`;--> statement-breakpoint
DROP TABLE `ModCorp_UserCards`;--> statement-breakpoint
DROP TABLE `RRM_Group`;--> statement-breakpoint
DROP TABLE `RRM_Request`;--> statement-breakpoint
DROP TABLE `RRM_Session`;