-- Remove existing group conversations before removing group-only columns.
-- ConversationMember and Message rows are removed automatically by ON DELETE CASCADE.
DELETE FROM "Conversation"
WHERE "type" = 'GROUP';

-- The chat is now DM-only.
ALTER TABLE "Conversation" DROP COLUMN "type";
DROP TYPE IF EXISTS "ConversationType";

-- Keep membership rows when a user hides/deletes a conversation.
-- This preserves the other participant identity and avoids "User undefined".
ALTER TABLE "ConversationMember"
ADD COLUMN "hiddenAt" TIMESTAMP(3),
ADD COLUMN "lastReadMessageId" INTEGER;

CREATE INDEX "ConversationMember_userId_hiddenAt_idx"
ON "ConversationMember"("userId", "hiddenAt");
