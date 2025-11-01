"use client"
import '@livekit/components-styles';
import "@/app/app/meeting/[meetingid]/meeting.css"
import { Grid, HomeIcon, MicIcon, PhoneOffIcon, ScreenShareIcon, VideoIcon } from "lucide-react"
import { useAuth } from "keystone-lib"
import { useSearchParams, useParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { ConnectionQualityIndicator, GridLayout, LiveKitRoom, useRoomContext, useRemoteParticipants, useTracks, VideoTrack, ControlBar, TrackLoop, useTrackRefContext, PreJoin, RoomAudioRenderer, useTrackToggle } from '@livekit/components-react';
import { useToken } from "@/lib/useToken"
import { Track } from "livekit-client"
import { ParticipantTile } from "@livekit/components-react";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
export default function MeetingPage() {
    const params = useParams()
    const token = useToken({meetingid: params.meetingid!})
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!})
    const [state, setState] = useState("prejoin")
    const router = useRouter()
    const [emptyaudio, setEmptyAudio] = useState<HTMLAudioElement | null>(new Audio())
    const [joinedOnce, setJoinedOnce] = useState(false)
    useEffect(() => {
        if(state === "prejoin" && emptyaudio) {
            emptyaudio.pause()
            emptyaudio.currentTime = 0
        } else if(state === "main") {
            emptyaudio.src = "/emptymeeting.mp3"
            emptyaudio.loop = true
            // emptyaudio.play()
        }
    }, [state])
    return (
        // <Suspense fallback={<div></div>}>
            <LiveKitRoom
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
                token={null}
                onConnected={() => {playSound("/connect.wav"); setState("main")}}
                connect={false}
                onDisconnected={() => {playSound("/disconnect.wav"); setState("prejoin")}}
            >
                {state === "prejoin" ? <MeetingPreJoin roomid={params.meetingid!} joinedOnce={joinedOnce} setJoinedOnce={setJoinedOnce} token={token} /> : <MeetingMain emptyaudio={emptyaudio!} />}
            </LiveKitRoom>
        // </Suspense>
    )
}

function MeetingPreJoin({roomid, joinedOnce, setJoinedOnce, token}: {roomid: string, joinedOnce: boolean, setJoinedOnce: (joinedOnce: boolean) => void, token: any}) {
    const room = useRoomContext()
    const router = useRouter()
    const searchParams = useSearchParams()
    useEffect(() => {
        if(!token) return
        if(searchParams.get("call") === "true" && !joinedOnce) {
            room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token.token).then(() => {
                setJoinedOnce(true)
            })
        }
    }, [token, searchParams])
    const [isElectron, setIsElectron] = useState<boolean | null>(null)
    useEffect(() => {
        setIsElectron(navigator.userAgent.includes("Electron"))
    }, [])
    if (joinedOnce && searchParams.get("call") === "true") {
        if (isElectron) {
            window.close()
        } else if (isElectron === false) {
            router.push("/app")
        }
    }
    if(searchParams.get("call") === "true") return <div className="meetingpage-prejoin">
        <h1 className="meetingpage-prejoin-title">Connecting Call</h1>
    </div>
    return (
        <div className="meetingpage-prejoin">
            <VideoIcon size={25} color="var(--qu-color-foreground)" strokeWidth={1.5} />
            <h1 className="meetingpage-prejoin-title">{joinedOnce ? "Rejoin Meeting" : "Join Meeting"}</h1>
            <div className="meetingpage-prejoin-button-row">
                <Button variant="outline" onClick={() => {room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token.token).then(() => setJoinedOnce(true))}}><VideoIcon />Join</Button>
                <Button variant="outline" onClick={() => router.push("/app")}><HomeIcon />Return Home</Button>
            </div>
            {/* <PreJoin /> */}
        </div>
    )
}
    
function MeetingMain({emptyaudio}: {emptyaudio: HTMLAudioElement}) {
    const room = useRoomContext()
    const [hasHadParticipants, setHasHadParticipants] = useState(false)
    const tracks = useTracks([{source: Track.Source.Camera, withPlaceholder: true}, {source: Track.Source.ScreenShare, withPlaceholder: false}])
    const remoteParticipants = useRemoteParticipants()
    const searchParams = useSearchParams()
    const router = useRouter()
    useEffect(() => {
        if(remoteParticipants.length === 0 && searchParams.get("call") !== "true") {
            emptyaudio.play()
        } else if (remoteParticipants.length === 0 && searchParams.get("call") && hasHadParticipants) {
            room.disconnect()
        } else if (remoteParticipants.length > 0) {
            setHasHadParticipants(true)
            emptyaudio.pause()
            emptyaudio.currentTime = 0
        }
    }, [remoteParticipants, searchParams, hasHadParticipants])
    useEffect(() => {
        room.on("participantDisconnected", () => {
            playSound("/disconnect.wav")
        })
        room.on("participantConnected", () => {
            playSound("/connect.wav")
        })
        return () => {
            room.off("participantDisconnected", () => {
                playSound("/disconnect.wav")
            })
            room.off("participantConnected", () => {
                playSound("/connect.wav")
            })
        }
    }, [room])
    return (
        <div className="meetingpage-mainarea">
            <RoomAudioRenderer />
            {remoteParticipants.length === 0 && <Alert style={{
                margin: 10,
                marginBottom: 0,
                width: "calc(100vw - 20px)",
                flexShrink: 0,
                padding: 10,
                background: "var(--qu-color-background-body)",
                border: "1px solid var(--qu-color-border)",
                borderRadius: 8,
                minHeight: "62px",
            }}>
                <AlertTitle>Empty Meeting</AlertTitle>
                <AlertDescription>You are the only participant in this meeting. Enjoy the music!</AlertDescription>
            </Alert>}
            <GridLayout className={"meetingpage-body" + (remoteParticipants.length === 0 ? " meetingpage-body-empty" : "")} tracks={tracks} >
                <Participantcard/>
            </GridLayout>
            <MeetingFooter/>
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

function playSound(src: string) {
    const audio = new Audio(src)
    audio.play()
    audio.onended = () => {
        audio.remove()
    }
}

function MeetingFooter() {
    var room = useRoomContext()
    var {toggle: toggleCam, enabled: camEnabled} = useTrackToggle({source: Track.Source.Camera});
    var {toggle: toggleMic, enabled: micEnabled} = useTrackToggle({source: Track.Source.Microphone});
    var {toggle: toggleScreenShare, enabled: screenShareEnabled} = useTrackToggle({source: Track.Source.ScreenShare});
    return (
        <div className="meetingpage-footer">
            <div style={{flexGrow: 1}} />
            <MeetingFooterButton Icon={VideoIcon} onClick={() => {toggleCam()}} active={camEnabled} />
            <MeetingFooterButton Icon={MicIcon} onClick={() => {toggleMic()}} active={micEnabled} />
            <MeetingFooterButton Icon={ScreenShareIcon} onClick={() => {toggleScreenShare()}} active={screenShareEnabled} />
            <MeetingFooterButton Icon={PhoneOffIcon} onClick={() => {room.disconnect()}} />
            <div style={{flexGrow: 1}} />
        </div>
    )
}

function MeetingFooterButton({Icon, onClick, active}: {Icon: React.ElementType, onClick: () => void, active?: boolean}) {
    return (
        <div className={"meetingpage-footer-button" + (active ? " meetingpage-footer-button-active" : "")} onClick={onClick}>
            <Icon className="meetingpage-footer-button-icon" size={22} />
        </div>
    )
}