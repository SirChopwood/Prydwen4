CREATE TABLE `RRM_V2_Groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`desc` text DEFAULT '' NOT NULL,
	`channels` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `RRM_V2_Requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sessionId` integer NOT NULL,
	`timestamp` integer NOT NULL,
	`text` text NOT NULL,
	`user` text NOT NULL,
	`code` text NOT NULL,
	`metadata` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `RRM_V2_Sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`requests` text DEFAULT '[]' NOT NULL,
	`sessionState` text DEFAULT 'Open' NOT NULL,
	`requestState` text DEFAULT 'Locked' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`sources` text DEFAULT '["PlainText"]' NOT NULL,
	`startTime` integer NOT NULL,
	`endTime` integer,
	`lastUser` text NOT NULL,
	`channels` text DEFAULT '[]' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`notification` text DEFAULT '' NOT NULL
);
