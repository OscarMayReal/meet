"use client"
import '@livekit/components-styles';
import "@/app/meeting/[meetingid]/meeting.css"
import { Grid, HomeIcon, VideoIcon } from "lucide-react"
import { useAuth } from "keystone-lib"
import { useParams } from "next/navigation"
import { useState } from "react"
import { ConnectionQualityIndicator, GridLayout, LiveKitRoom, useRoomContext, useRemoteParticipants, useTracks, VideoTrack, ControlBar, TrackLoop, useTrackRefContext, PreJoin, RoomAudioRenderer } from '@livekit/components-react';
import { useToken } from "@/lib/useToken"
import { Track } from "livekit-client"
import { ParticipantTile } from "@livekit/components-react";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";
export default function MeetingPage() {
    const params = useParams()
    const token = useToken({meetingid: params.meetingid})
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!})
    const [state, setState] = useState("prejoin")
    const router = useRouter()
    return (
        <LiveKitRoom
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
            token={null}
            onConnected={() => setState("main")}
            connect={false}
            onDisconnected={() => setState("prejoin")}
        >
            {state === "prejoin" ? <MeetingPreJoin roomid={params.meetingid!} token={token!} /> : <MeetingMain />}
        </LiveKitRoom>
    )
}

function MeetingPreJoin({roomid, token}: {roomid: string, token: string}) {
    const room = useRoomContext()
    const router = useRouter()
    return (
        <div className="meetingpage-prejoin">
            <VideoIcon size={25} color="var(--qu-color-foreground)" strokeWidth={1.5} />
            <h1 className="meetingpage-prejoin-title">Join Meeting</h1>
            <div className="meetingpage-prejoin-button-row">
                <Button variant="outline" onClick={() => room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token.token)}><VideoIcon />Join</Button>
                <Button variant="outline" onClick={() => router.push("/app")}><HomeIcon />Return Home</Button>
            </div>
            {/* <PreJoin /> */}
        </div>
    )
}
    
function MeetingMain() {
    const params = useParams()
    const room = useRoomContext()
    const tracks = useTracks([{source: Track.Source.Camera, withPlaceholder: true}, {source: Track.Source.ScreenShare, withPlaceholder: false}])
    return (
        <div className="meetingpage-mainarea">
            <RoomAudioRenderer />
            {/* <div className="meetingpage-header">
                <VideoIcon size={25} color="var(--qu-color-foreground)" strokeWidth={1.5} />
                <div className="meetingpage-header-title">Quntem Meet • {params.meetingid}</div>
            </div> */}
            {/* <div className="meetingpage-body"> */}
                <GridLayout className="meetingpage-body" tracks={tracks} >
                    <Participantcard/>
                </GridLayout>
            {/* </div> */}
            <div className="meetingpage-header">
                <ControlBar style={{display: "flex", justifyContent: "center", alignItems: "center", width: "100%"}} />
            </div>
        </div>
    )
}

function Participantcard() {
    const track = useTrackRefContext()
    return (
        <div className="meetingpage-body-participant">
            {track.publication?.track && !track.publication.track.isMuted ? <VideoTrack track={track.publication?.track} /> : <div>
                <Avatar className="meetingpage-body-participant-avatar">
                    <AvatarFallback className='text-2xl meetingpage-body-participant-avatar-fallback'>{JSON.parse(track.participant.identity).name.charAt(0)}{JSON.parse(track.participant.identity).name.charAt(1)}</AvatarFallback>
                </Avatar>    
            </div>}
            <div className="meetingpage-body-participant-info">
                
                {JSON.parse(track.participant.identity).name}{track.source === Track.Source.ScreenShare ? "'s Screen" : ""}
            </div>
        </div>
    )
}