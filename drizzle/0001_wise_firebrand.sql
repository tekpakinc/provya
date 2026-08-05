CREATE TABLE `entitlements` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`plan` text DEFAULT 'free' NOT NULL,
	`provider` text,
	`purchase_id` text,
	`purchased_at` integer
);
