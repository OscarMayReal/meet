import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { VerifySession } from "./keystone.ts";
import { AccessToken, Room, RoomServiceClient } from 'livekit-server-sdk';
import { createScheduledMeeting, getScheduledMeetingsForUser } from "./scheduleFunctions.ts";

const app = express();

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

app.listen(3001, () => {
    console.log("Server started on port 3001");
});
    