CREATE TABLE `ledgers` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`ownerId` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`createdAt` timestamp(3) NOT NULL,
	`updatedAt` timestamp(3) NOT NULL
);

CREATE TABLE `userLedgerJunction` (
	`ledgerId` varchar(36) NOT NULL,
	`userId` varchar(36) NOT NULL
);
ALTER TABLE `userLedgerJunction` ADD PRIMARY KEY(`userId`,`ledgerId`);
