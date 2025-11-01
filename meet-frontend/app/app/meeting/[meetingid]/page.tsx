"use client"
import '@livekit/components-styles';
import "@/app/app/meeting/[meetingid]/meeting.css"
import { Grid, HomeIcon, InfoIcon, MessageSquareIcon, MicIcon, PanelRightIcon, PhoneOffIcon, ScreenShareIcon, SendHorizonalIcon, UsersIcon, VideoIcon, XIcon } from "lucide-react"
import { useAuth } from "keystone-lib"
import { useSearchParams, useParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { ConnectionQualityIndicator, GridLayout, LiveKitRoom, useRoomContext, useRemoteParticipants, useTracks, VideoTrack, ControlBar, TrackLoop, useTrackRefContext, PreJoin, RoomAudioRenderer, useTrackToggle, ChatIcon, useChat, Chat, useLocalParticipant } from '@livekit/components-react';
import { useToken } from "@/lib/useToken"
import { ChatMessage, Track } from "livekit-client"
import { ParticipantTile } from "@livekit/components-react";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Settings } from '@/components/createMeeting';
import { Input } from '@/components/ui/input';
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
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [sidebarPage, setSidebarPage] = useState("chat")
    const chat = useChat()
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
            <div className={"meetingpage-body-row" + (remoteParticipants.length === 0 ? " meetingpage-body-row-empty" : "")}>
                <GridLayout className={"meetingpage-body" + (remoteParticipants.length === 0 ? " meetingpage-body-empty" : "")} tracks={tracks} >
                    <Participantcard/>
                </GridLayout>
                <Sidebar chat={chat} sidebarOpen={sidebarOpen} sidebarPage={sidebarPage} setSidebarPage={setSidebarPage} setSidebarOpen={setSidebarOpen}/>
            </div>
            <MeetingFooter sidebarOpen={sidebarOpen} sidebarPage={sidebarPage} setSidebarPage={setSidebarPage} setSidebarOpen={setSidebarOpen}/>
        </div>
    )
}

function Sidebar({chat, sidebarOpen, sidebarPage, setSidebarPage, setSidebarOpen}: {chat: any, sidebarOpen: boolean, sidebarPage: string, setSidebarPage: (sidebarPage: string) => void, setSidebarOpen: (sidebarOpen: boolean) => void}) {
    if(!sidebarOpen) return null
    return (
        <div className="meetingpage-sidebar">
            <SidebarHeader Icon={sidebarPage === "chat" ? MessageSquareIcon : sidebarPage === "info" ? InfoIcon : sidebarPage === "users" ? UsersIcon : VideoIcon} title={sidebarPage === "chat" ? "Chat" : sidebarPage === "info" ? "Info" : sidebarPage === "users" ? "Users" : "General"} setSidebarOpen={setSidebarOpen}/>
            {sidebarPage === "chat" && <ChatSidebar chat={chat}/>}
        </div>
    )
}

function ChatSidebar({chat}: {chat: any}) {
    const [message, setMessage] = useState("")
    return (
        <div className="meetingpage-sidebar-mainarea">
            <div className="flex flex-col gap-2 flex-grow overflow-y-auto p-3 pb-0">
                {chat.chatMessages.map((message: ChatMessage, index: number) => {
                    return <ChatMessage message={message} messages={chat.chatMessages} index={index}/>
                })}
            </div>
            <div className='flex flex-row items-center gap-3 p-3'>
                <Input value={message} onKeyDown={(e) => {
                    if(e.key === "Enter") {
                        chat.send(message)
                        setMessage("")
                    }
                }} placeholder='Send a message...' onChange={(e) => setMessage(e.target.value)} />
                <Button onClick={() => {
                    chat.send(message)
                    setMessage("")
                }} variant="outline"><SendHorizonalIcon /></Button>
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

function playSound(src: string) {
    const audio = new Audio(src)
    audio.play()
    audio.onended = () => {
        audio.remove()
    }
}

function ChatMessage({message, messages, index}: {message: ChatMessage, messages: ChatMessage[], index: number}) {
    const room = useRoomContext()
    var isSelf = JSON.parse(message.from?.identity || "{}").id === JSON.parse(room.localParticipant.identity || "{}").id
    return (
        <div className={"meetingpage-sidebar-message" + (isSelf ? " meetingpage-sidebar-message-self" : "")}>
            {isSelf || JSON.parse(messages[index - 1]?.from?.identity || "{}").id === JSON.parse(message?.from?.identity || "{}").id ? null : <div className="meetingpage-sidebar-message-author">{JSON.parse(message.from?.identity || "{}").name}</div>}
            <div className="meetingpage-sidebar-message-content">
                {message.message}
            </div>
        </div>
    )
}

function MeetingFooter({sidebarOpen, sidebarPage, setSidebarPage, setSidebarOpen}: {sidebarOpen: boolean, sidebarPage: string, setSidebarPage: (sidebarPage: string) => void, setSidebarOpen: (sidebarOpen: boolean) => void}) {
    const params = useParams()
    var room = useRoomContext()
    var {toggle: toggleCam, enabled: camEnabled} = useTrackToggle({source: Track.Source.Camera});
    var {toggle: toggleMic, enabled: micEnabled} = useTrackToggle({source: Track.Source.Microphone});
    var {toggle: toggleScreenShare, enabled: screenShareEnabled} = useTrackToggle({source: Track.Source.ScreenShare});
    return (
        <div className="meetingpage-footer">
            <div style={{flexGrow: 1, width: "50%"}}>
                <div className="meetingpage-footer-title">{params.meetingid}</div>
            </div>
            <MeetingFooterButton Icon={VideoIcon} onClick={() => {toggleCam()}} active={camEnabled} />
            <MeetingFooterButton Icon={MicIcon} onClick={() => {toggleMic()}} active={micEnabled} />
            <MeetingFooterButton Icon={ScreenShareIcon} onClick={() => {toggleScreenShare()}} active={screenShareEnabled} />
            <MeetingFooterButton Icon={PhoneOffIcon} onClick={() => {room.disconnect()}} />
            <div style={{flexGrow: 1, gap: 20, width: "50%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "end"}}>
                <Settings size={22} />
                <SidebarTabIcon sidebarPage={sidebarPage} setSidebarPage={setSidebarPage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} Icon={MessageSquareIcon} thisSidebarPage="chat" />
                <SidebarTabIcon sidebarPage={sidebarPage} setSidebarPage={setSidebarPage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} Icon={InfoIcon} thisSidebarPage="info" />
                <SidebarTabIcon sidebarPage={sidebarPage} setSidebarPage={setSidebarPage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} Icon={UsersIcon} thisSidebarPage="users" />
            </div>
        </div>
    )
}

function SidebarTabIcon({sidebarPage, setSidebarPage, sidebarOpen, setSidebarOpen, Icon, thisSidebarPage}: {sidebarPage: string, setSidebarPage: (sidebarPage: string) => void, sidebarOpen: boolean, setSidebarOpen: (sidebarOpen: boolean) => void, Icon: React.ElementType, thisSidebarPage: string}) {
    return (
        <Icon className="meetingpage-sidebar-tab-icon" size={22} onClick={() => {
            if (!sidebarOpen) {
                setSidebarPage(thisSidebarPage)
                setSidebarOpen(true)
            } else if (sidebarPage === thisSidebarPage && sidebarOpen) {
                setSidebarOpen(false)
            } else {
                setSidebarPage(thisSidebarPage)
                setSidebarOpen(true)
            }
        }} />
    )
}

function SidebarHeader({Icon, title, setSidebarOpen}: {Icon: React.ElementType, title: string, setSidebarOpen: (sidebarOpen: boolean) => void}) {
    return (
        <div className="meetingpage-sidebar-header">
            <Icon className="meetingpage-sidebar-header-icon" size={18} />
            <div className="meetingpage-sidebar-header-title">{title}</div>
            <div style={{flexGrow: 1}} />
            <XIcon className="meetingpage-sidebar-header-close" size={18} onClick={() => {setSidebarOpen(false)}} />
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