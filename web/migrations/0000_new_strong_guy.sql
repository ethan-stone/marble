CREATE TABLE `ledgers` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`name` text
);

CREATE TABLE `userLedgerJunction` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`ledgerId` varchar(36),
	`userId` varchar(36)
);

CREATE UNIQUE INDEX userId_ledgerId_idx ON userLedgerJunction (`userId`,`ledgerId`);