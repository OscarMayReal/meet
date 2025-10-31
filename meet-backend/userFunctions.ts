import { PrismaClient, UserStatus } from "./generated/prisma/client.ts"

const prisma = new PrismaClient()

export async function getUserById(id: string) {
    return await prisma.user.findUnique({
        where: {
            id: id
        }
    })
}

export async function getUserByUserId(userId: string) {
    return await prisma.user.findUnique({
        where: {
            userid: userId
        }
    })
}

export async function getUserByEmail(email: string) {
    return await prisma.user.findUnique({
        where: {
            email: email
        }
    })
}

export async function getUsersByTenant(tenantId: string) {
    return await prisma.user.findMany({
        where: {
            tenant: tenantId
        }
    })
}

export function setUserStatus(userId: string, status: UserStatus) {
    return prisma.user.update({
        where: {
            userid: userId
        },
        data: {
            status: status
        }
    })
}

export async function createUser({userId, name, email, username, tenant, profile}: {userId: string, name: string, email: string, username: string, tenant: string, profile: any}) {
    return await prisma.user.create({
        data: {
            userid: userId,
            name: name,
            email: email,
            username: username,
            tenant: tenant,
            profile
        }
    })
}
