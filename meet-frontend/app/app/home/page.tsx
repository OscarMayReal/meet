"use client"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon, VideoIcon, SettingsIcon, CalendarIcon, DoorClosedIcon, XIcon, UserPlusIcon, UserIcon, UserMinusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useContext, useEffect, useState } from "react";
import { useAuth } from "keystone-lib";
import { useRouter } from "next/navigation";
import {CreateMeeting, ScheduleMeeting} from "@/components/createMeeting";
import {JoinMeeting} from "@/components/createMeeting";
import "@/app/app/home/home.css"
import { useClock } from "@/lib/useClock";
import { Settings } from "@/components/createMeeting";
import { TeamDashboard } from "@/components/createMeeting";
import { Separator } from "@/components/ui/separator";
import { useRequests } from "@/lib/useRequests";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { appContext } from "../layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AppPage() {
    const time = useClock()
    const router = useRouter()
    const data = useRequests({
        requests: [
            {
                url: `/meeting/scheduled`,
                resType: "json"
            },
            {
                url: `/directory`,
                resType: "json"
            }
        ]
    })
    useEffect(() => {
        console.log(data)
    }, [data])
    const {socket, auth} = useContext(appContext)
    return (
            <div className="homepage-mainarea">
                <div className="homepage-actionarea">
                    <h1 className="homepage-mainarea-clock">{time.getHours() != 0 ? time.getHours() > 9 ? time.getHours() : "0" + time.getHours() : "00"}:{time.getMinutes() != 0 ? time.getMinutes() > 9 ? time.getMinutes() : "0" + time.getMinutes() : "00"} • {time.getDate()}/{time.getMonth() + 1}/{time.getFullYear()}</h1>
                    <h1 className="homepage-mainarea-title">Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {auth.data?.user.name}</h1>
                    <div>
                        <div className="homepage-mainarea-button-row">
                            <CreateMeeting />
                            <JoinMeeting />
                        </div>
                        {/* <div className="homepage-mainarea-button-row">
                            <Button variant="outline" onClick={() => setOpen(true)}><CalendarIcon />Schedule Meeting</Button>
                        </div> */}
                    </div>
                    <div className="homepage-scheduledmeeting-container divide-y [&>:not(:last-child)]:mb-[10px] [&>:not(:last-child)]:pb-[10px] mt-[15px]">
                        {data.loaded === true && data.data?.["/meeting/scheduled"].data.length > 0 ? data.data?.["/meeting/scheduled"]?.data?.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map((meeting, index) => <ScheduledMeeting key={index} isFirst={index === 0} meeting={meeting} directory={data.data?.["/directory"]?.data} />) : <p>No scheduled meetings</p>}
                    </div>
                    <ScheduleMeeting dataHook={data} />
                </div>
                {/* <div className="homepage-scheduledmeetingarea">
                    <h1 className="homepage-scheduledmeetingarea-title">Scheduled Meetings</h1>
                    <div className="homepage-scheduledmeeting-container divide-y [&>:not(:last-child)]:mb-[15px] [&>:not(:last-child)]:pb-[15px]">
                        <ScheduledMeeting />
                        <ScheduledMeeting />
                        <ScheduledMeeting />
                    </div>
                </div> */}
            </div>
    )
}

function ScheduledMeeting({isFirst, meeting, directory}: {isFirst: boolean, meeting: {
    name: string,
    description: string,
    startTime: string,
    endTime: string,
    invitees: string[],
    room: string,
    limitToInvitees: boolean,
    owner: string,
    tenant: string,
    id: string,
}, directory: any}) {
    const router = useRouter()
    const [invitees, setInvitees] = useState(meeting.invitees)
    const {auth} = useContext(appContext)

    useEffect(() => {
        console.log(directory)
    }, [directory])
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="homepage-scheduledmeeting">
                    <h1 className="homepage-scheduledmeeting-title">{meeting.name}</h1>
                    <div className="homepage-scheduledmeeting-time">
                        <h1 className="homepage-scheduledmeeting-time-text">{new Date(meeting.startTime).getHours() != 0 ? new Date(meeting.startTime).getHours() > 9 ? new Date(meeting.startTime).getHours() : "0" + new Date(meeting.startTime).getHours() : "00"}:{new Date(meeting.startTime).getMinutes() != 0 ? new Date(meeting.startTime).getMinutes() > 9 ? new Date(meeting.startTime).getMinutes() : "0" + new Date(meeting.startTime).getMinutes() : "00"} - {new Date(meeting.endTime).getHours() != 0 ? new Date(meeting.endTime).getHours() > 9 ? new Date(meeting.endTime).getHours() : "0" + new Date(meeting.endTime).getHours() : "00"}:{new Date(meeting.endTime).getMinutes() != 0 ? new Date(meeting.endTime).getMinutes() > 9 ? new Date(meeting.endTime).getMinutes() : "0" + new Date(meeting.endTime).getMinutes() : "00"} • {new Date(meeting.startTime).getDate()}/{new Date(meeting.startTime).getMonth() + 1}/{new Date(meeting.startTime).getFullYear()}</h1>
                    </div>
                    {isFirst && <div className="homepage-scheduledmeeting-buttons mt-[10px]">
                        <Button variant="outline" className="w-full" onClick={(e) => {
                            e.stopPropagation()
                            router.push("/app/meeting/meeting_" + meeting.id)
                        }}><DoorClosedIcon />Join</Button>
                    </div>}
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{meeting.name}</DialogTitle>
                    <DialogDescription>{new Date(meeting.startTime).getHours() != 0 ? new Date(meeting.startTime).getHours() > 9 ? new Date(meeting.startTime).getHours() : "0" + new Date(meeting.startTime).getHours() : "00"}:{new Date(meeting.startTime).getMinutes() != 0 ? new Date(meeting.startTime).getMinutes() > 9 ? new Date(meeting.startTime).getMinutes() : "0" + new Date(meeting.startTime).getMinutes() : "00"} - {new Date(meeting.endTime).getHours() != 0 ? new Date(meeting.endTime).getHours() > 9 ? new Date(meeting.endTime).getHours() : "0" + new Date(meeting.endTime).getHours() : "00"}:{new Date(meeting.endTime).getMinutes() != 0 ? new Date(meeting.endTime).getMinutes() > 9 ? new Date(meeting.endTime).getMinutes() : "0" + new Date(meeting.endTime).getMinutes() : "00"} • {new Date(meeting.startTime).getDate()}/{new Date(meeting.startTime).getMonth() + 1}/{new Date(meeting.startTime).getFullYear()}</DialogDescription>
                </DialogHeader>
                <div className="homepage-scheduledmeeting-description">
                    {meeting.description}
                </div>
                {meeting.owner == auth.data?.user.id && <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline"><UserPlusIcon />Invite</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {directory?.filter(item => item.userid != auth.data?.user.id).map(item => {
                            return <DropdownMenuItem disabled={invitees.includes(item.userid)} onClick={async () => {
                                await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/meeting/scheduled/" + meeting.id + "/addinvitee", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": "Bearer " + auth.data?.sessionId
                                    },
                                    body: JSON.stringify({
                                        invitee: item.userid
                                    })
                                })
                                setInvitees([...invitees, item.userid])
                            }} key={item.id}><UserIcon />{item.name}</DropdownMenuItem>
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>}
                <div className="meeting-invitees-list">
                    {invitees.map(item => {
                        return <MemberItem key={item} name={directory.find(dir => dir.userid === item)?.name} email={directory.find(dir => dir.userid === item)?.email} id={directory.find(dir => dir.userid === item)?.userid} onRemoveInvitee={() => {
                            fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/meeting/scheduled/" + meeting.id + "/removeinvitee", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": "Bearer " + auth.data?.sessionId
                                },
                                body: JSON.stringify({
                                    invitee: item
                                })
                            })
                            setInvitees(invitees.filter(invitee => invitee !== item))
                        }} hideRemoveButton={meeting.owner != auth.data?.user.id}/>
                    })}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline"><XIcon />Close</Button>
                    </DialogClose>
                    <Button variant="outline" onClick={(e) => {
                        e.stopPropagation()
                        router.push("/app/meeting/meeting_" + meeting.id)
                    }}><DoorClosedIcon />Join</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function MemberItem({name, email, id, onRemoveInvitee, hideRemoveButton}: {name: string, email: string, id: string, onRemoveInvitee: () => void, hideRemoveButton?: boolean}) {
    return (
        <div className="meetingpage-sidebar-memberitem">
            <Avatar className="meetingpage-sidebar-memberitem-avatar">
                <AvatarFallback className='text-2xl meetingpage-sidebar-memberitem-avatar-fallback'>{name.charAt(0)}{name.charAt(1)}</AvatarFallback>
            </Avatar>
            <div>
                <div className="meetingpage-sidebar-memberitem-name">{name}</div>
                <div className="meetingpage-sidebar-memberitem-email">{email}</div>
            </div>
            <div style={{flex: 1}}/>
            {!hideRemoveButton && <Button variant="outline" onClick={onRemoveInvitee}>
                <UserMinusIcon />
            </Button>}
        </div>
    )
}