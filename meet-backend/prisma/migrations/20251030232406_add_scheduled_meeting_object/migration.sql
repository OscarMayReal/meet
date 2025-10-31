-- CreateTable
CREATE TABLE "ScheduledMeeting" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "invitees" TEXT[],
    "room" TEXT,
    "limitToInvitees" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ScheduledMeeting_pkey" PRIMARY KEY ("id")
);
