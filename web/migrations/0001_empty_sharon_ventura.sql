ALTER TABLE accounts MODIFY COLUMN `type` enum('3rdparty','user');
ALTER TABLE journals ADD `ledgerId` varchar(36);
ALTER TABLE journals DROP COLUMN `creatorId`;