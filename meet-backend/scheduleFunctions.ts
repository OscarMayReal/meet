import { PrismaClient } from "./generated/prisma/client.ts"

const prisma = new PrismaClient()

export async function createScheduledMeeting(info: {name: string, description: string, startTime: Date, endTime: Date, invitees: string[], room: string, limitToInvitees: boolean, owner: string, tenant: string}) {
    return await prisma.scheduledMeeting.create({
        data: {
            name: info.name,
            description: info.description,
            startTime: info.startTime,
            endTime: info.endTime,
            invitees: info.invitees,
            room: info.room,
            limitToInvitees: info.limitToInvitees,
            owner: info.owner,
            tenant: info.tenant
        }
    })
}

export async function getScheduledMeetingsForUser(userId: string) {
    return await prisma.scheduledMeeting.findMany({
        where: {
            OR: [
                {
                    invitees: {
                        has: userId
                    }
                },
                {
                    owner: userId
                }
            ]
        }
    })
}

export async function getScheduledMeetingById(id: string) {
    return await prisma.scheduledMeeting.findUnique({
        where: {
            id: id
        }
    })
}

export async function deleteScheduledMeeting(id: string) {
    await prisma.scheduledMeeting.delete({
        where: {
            id: id
        }
    })
}

export async function updateScheduledMeeting(id: string, info: {name: string, description: string, startTime: Date, endTime: Date, invitees: string[], room: string, limitToInvitees: boolean, owner: string, tenant: string}) {
    return await prisma.scheduledMeeting.update({
        where: {
            id: id
        },
        data: {
            name: info.name,
            description: info.description,
            startTime: info.startTime,
            endTime: info.endTime,
            invitees: info.invitees,
            room: info.room,
            limitToInvitees: info.limitToInvitees,
            owner: info.owner,
            tenant: info.tenant
        }
    })
}