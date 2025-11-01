import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
dotenv.config();

import { VerifySession } from "./keystone.ts";
import { AccessToken, Room, RoomServiceClient } from 'livekit-server-sdk';
import { createScheduledMeeting, getScheduledMeetingsForUser } from "./scheduleFunctions.ts";
import { createUser, getUserByUserId, getUsersByTenant, setUserStatus } from "./userFunctions.ts";
import { createServer } from "http";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

function CreateMeetingCode() {
    const length = 10;
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

const rsc = new RoomServiceClient(
    process.env.LIVEKIT_URL!,
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
)

app.use(cors());
app.use(express.json());

app.post("/meeting/create", async (req, res) => {
    let sessionData;
    try {
        sessionData = await VerifySession({
            appId: process.env.APP_ID!,
            keystoneUrl: process.env.KEYSTONE_URL!,
            sessionId: req.headers["authorization"]!.split(" ")[1],
            appSecret: process.env.APP_SECRET!
        });
    } catch (error) {
        console.log(error);
        res.status(401).send("Unauthorized");
    }
    const id = CreateMeetingCode();
    const identity = sessionData.user
    const room = await rsc.createRoom({
        name: id,
        maxParticipants: 8,
        metadata: JSON.stringify({
            ownedBy: identity.id,
            ownerName: identity.name,
            meetingname: req.body.name,
        })
    })
    res.send({id: room.name, name: req.body.name});
});

app.post("/meeting/join", async (req, res) => {
    console.log(req.body)
    let sessionData;
    try {
        sessionData = await VerifySession({
            appId: process.env.APP_ID!,
            keystoneUrl: process.env.KEYSTONE_URL!,
            sessionId: req.headers["authorization"]!.split(" ")[1],
            appSecret: process.env.APP_SECRET!
        });
    } catch (error) {
        console.log(error);
        res.status(401).send("Unauthorized");
    }
    const identity = sessionData.user
    const token = new AccessToken(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!, {
        identity: JSON.stringify({
            id: identity.id,
            name: identity.name,
            email: identity.email,
        }),
        ttl: "1h",
    })
    const room = await rsc.listRooms()
    const roomData = room.find((room) => room.name === req.body.id)
    if (!roomData) {
        return res.status(404).send("Room not found");
    }
    token.addGrant({
        room: roomData.name,
        roomJoin: true,
        roomAdmin: JSON.parse(roomData.metadata!).ownedBy === identity.id,
    })
    const jwt = await token.toJwt()
    res.json({id: req.body.id, name: req.body.name, token: jwt});
})

app.post("/meeting/schedule", async (req, res) => {
    let sessionData;
    try {
        sessionData = await VerifySession({
            appId: process.env.APP_ID!,
            keystoneUrl: process.env.KEYSTONE_URL!,
            sessionId: req.headers["authorization"]!.split(" ")[1],
            appSecret: process.env.APP_SECRET!
        });
    } catch (error) {
        console.log(error);
        res.status(401).send("Unauthorized");
    }
    const identity = sessionData.user
    const meeting = await createScheduledMeeting({
        name: req.body.name,
        description: req.body.description,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        invitees: req.body.invitees,
        room: req.body.room,
        limitToInvitees: req.body.limitToInvitees,
        owner: identity.id,
        tenant: identity.tenant?.id!
    })
    res.send(meeting);
})

app.get("/meeting/scheduled", async (req, res) => {
    let sessionData;
    try {
        sessionData = await VerifySession({
            appId: process.env.APP_ID!,
            keystoneUrl: process.env.KEYSTONE_URL!,
            sessionId: req.headers["authorization"]!.split(" ")[1],
            appSecret: process.env.APP_SECRET!
        });
    } catch (error) {
        console.log(error);
        res.status(401).send("Unauthorized");
    }
    const identity = sessionData.user
    const meetings = await getScheduledMeetingsForUser(identity.id)
    res.send(meetings)
})

app.get("/directory", async (req, res) => {
    let sessionData;
    try {
        sessionData = await VerifySession({
            appId: process.env.APP_ID!,
            keystoneUrl: process.env.KEYSTONE_URL!,
            sessionId: req.headers["authorization"]!.split(" ")[1],
            appSecret: process.env.APP_SECRET!
        });
    } catch (error) {
        console.log(error);
        res.status(401).send("Unauthorized");
    }
    const identity = sessionData.user
    const users = await getUsersByTenant(identity.tenant?.id!)
    res.send(users)
})

app.get("/directory/:userid", async (req, res) => {
    let sessionData;
    try {
        sessionData = await VerifySession({
            appId: process.env.APP_ID!,
            keystoneUrl: process.env.KEYSTONE_URL!,
            sessionId: req.headers["authorization"]!.split(" ")[1],
            appSecret: process.env.APP_SECRET!
        });
    } catch (error) {
        console.log(error);
        res.status(401).send("Unauthorized");
    }
    const user = await getUserByUserId(req.params.userid)
    res.json(user)
})

io.on("connection", async (socket) => {
    let sessionData;
    let user;
    try {
        sessionData = await VerifySession({
            appId: process.env.APP_ID!,
            keystoneUrl: process.env.KEYSTONE_URL!,
            sessionId: socket.handshake.auth.sessionId,
            appSecret: process.env.APP_SECRET!
        });
        user = await getUserByUserId(sessionData.user.id!);
        if (!user) {
            user = await createUser({
                userId: sessionData.user.id!,
                name: sessionData.user.name!,
                email: sessionData.user.email!,
                username: sessionData.user.username!,
                tenant: sessionData.tenant.id!,
                profile: sessionData.user
            });
        }
        socket.join("USER_" + sessionData.user.id!);
        if (user && user.status == "OFFLINE") {
            await setUserStatus(sessionData.user.id!, "ONLINE");
        }
        socket.emit("connection.auth.success", sessionData);
    } catch (error) {
        console.log(error);
        socket.emit("connection.auth.error", JSON.stringify(error));
        socket.disconnect();
    }
    socket.on("status.set", async (data) => {
        if (!user) return;
        if (data.status != "ONLINE" && data.status != "AWAY" && data.status != "BUSY" && data.status != "OFFLINE") return;
        await setUserStatus(user.userid!, data.status);
    });
    socket.on("telephony.call", async (data) => {
        if (!user) return;
        socket.to("USER_" + data.to).emit("telephony.call", {
            from: user.userid!,
            to: data.to,
            meetingid: data.meetingid,
            profile: user.profile!
        });
    })
    socket.on("telephony.decline", async (data) => {
        if (!user) return;
        socket.to("USER_" + data.from).emit("telephony.decline", {
            from: user.userid!,
            to: data.to,
            meetingid: data.meetingid,
        });
    })
    socket.on("status.get", async (callback: (status: string) => void) => {
        if (!user) return;
        const status = await getUserByUserId(user.userid!);
        callback(status?.status!);
    });
    socket.on("disconnect", async () => {
        if (!user) return;
        if (user.status == "ONLINE" || user.status == "BUSY") {
            await setUserStatus(user.userid!, "OFFLINE"); 
        }
        console.log("Client disconnected");
    });
});

server.listen(3001);