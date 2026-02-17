CREATE TABLE `ModCorp_Achievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`file` text NOT NULL,
	`type` text DEFAULT 'Medal' NOT NULL,
	`tiers` text
);
--> statement-breakpoint
CREATE TABLE `ModCorp_AwardedAchievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`discord_user_id` text NOT NULL,
	`achievement` integer NOT NULL,
	`timestamp` text NOT NULL,
	`note` text,
	`tier` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ModCorp_Banners` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`file` text NOT NULL,
	`contents` text DEFAULT '[]' NOT NULL,
	`active` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `ModCorp_Cards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`file` text NOT NULL,
	`rarity` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ModCorp_Logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_name` text NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`reason` text,
	`timestamp` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ModCorp_Team` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`colour` text DEFAULT '#ffbb00' NOT NULL,
	`logo_url` text DEFAULT '' NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`discord` text DEFAULT '{"role":"","channel":"","server":""}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ModCorp_TeamRolePings` (
	`user_id` integer PRIMARY KEY NOT NULL,
	`team` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ModCorp_UserCards` (
	`user_id` integer PRIMARY KEY NOT NULL,
	`cards` text DEFAULT '[]' NOT NULL,
	`rolls` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `RRM_Group` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`desc` text DEFAULT '' NOT NULL,
	`channels` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `RRM_Request` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sessionId` integer NOT NULL,
	`timestamp` text NOT NULL,
	`text` text NOT NULL,
	`user` text NOT NULL,
	`code` text NOT NULL,
	`metadata` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `RRM_Session` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`requests` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'Locked' NOT NULL,
	`sources` text DEFAULT '["PlainText"]' NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text,
	`last_user` text NOT NULL,
	`owner` text NOT NULL,
	`channels` text DEFAULT '[]' NOT NULL,
	`current_request` integer DEFAULT 0 NOT NULL
);
