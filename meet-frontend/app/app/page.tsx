"use client"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon, VideoIcon, SettingsIcon, CalendarIcon, DoorClosedIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useAuth } from "keystone-lib";
import { useRouter } from "next/navigation";
import {CreateMeeting, ScheduleMeeting} from "@/components/createMeeting";
import {JoinMeeting} from "@/components/createMeeting";
import "@/app/app/home.css"
import { useClock } from "@/lib/useClock";
import { Settings } from "@/components/createMeeting";
import { TeamDashboard } from "@/components/createMeeting";
import { Separator } from "@/components/ui/separator";
import { useRequests } from "@/lib/useRequests";

export default function AppPage() {
    const time = useClock()
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!})
    const router = useRouter()
    const data = useRequests({
        requests: [
            {
                url: `/meeting/scheduled`,
                resType: "json"
            }
        ]
    })
    useEffect(() => {
        console.log(data)
    }, [data])
    return (
        <div className="homepage">
            <div className="homepage-header">
                <VideoIcon size={25} color="var(--qu-color-foreground)" strokeWidth={1.5} />
                {/* {auth.data?.tenant.logo ? <img src={auth.data?.tenant.logo} className="homepage-header-title-secondary-logo" /> : <h1 className="homepage-header-title-secondary">{auth.data?.tenant.name}</h1>} */}
                <h1 className="homepage-header-title">Quntem Meet</h1>
                <div style={{flexGrow: 1}} />
                <TeamDashboard />
                <Settings />
            </div>
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
                        {data.loaded === true && data.data?.["/meeting/scheduled"].data.length > 0 ? data.data?.["/meeting/scheduled"]?.data?.map((meeting, index) => <ScheduledMeeting key={index} isFirst={index === 0} meeting={meeting} />) : <p>No scheduled meetings</p>}
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
        </div>
    )
}

function ScheduledMeeting({isFirst, meeting}: {isFirst: boolean, meeting: {
    name: string,
    description: string,
    startTime: string,
    endTime: string,
    invitees: string[],
    room: string,
    limitToInvitees: boolean,
    owner: string,
    tenant: string,
    id: string
}}) {
    const router = useRouter()
    return (
        <div className="homepage-scheduledmeeting">
            <h1 className="homepage-scheduledmeeting-title">{meeting.name}</h1>
            <div className="homepage-scheduledmeeting-time">
                <h1 className="homepage-scheduledmeeting-time-text">{new Date(meeting.startTime).getHours() != 0 ? new Date(meeting.startTime).getHours() > 9 ? new Date(meeting.startTime).getHours() : "0" + new Date(meeting.startTime).getHours() : "00"}:{new Date(meeting.startTime).getMinutes() != 0 ? new Date(meeting.startTime).getMinutes() > 9 ? new Date(meeting.startTime).getMinutes() : "0" + new Date(meeting.startTime).getMinutes() : "00"} - {new Date(meeting.endTime).getHours() != 0 ? new Date(meeting.endTime).getHours() > 9 ? new Date(meeting.endTime).getHours() : "0" + new Date(meeting.endTime).getHours() : "00"}:{new Date(meeting.endTime).getMinutes() != 0 ? new Date(meeting.endTime).getMinutes() > 9 ? new Date(meeting.endTime).getMinutes() : "0" + new Date(meeting.endTime).getMinutes() : "00"} • {new Date(meeting.startTime).getDate()}/{new Date(meeting.startTime).getMonth() + 1}/{new Date(meeting.startTime).getFullYear()}</h1>
            </div>
            {isFirst && <div className="homepage-scheduledmeeting-buttons mt-[10px]">
                <Button variant="outline" className="w-full" onClick={() => router.push("/meeting/" + meeting.id)}><DoorClosedIcon />Join</Button>
            </div>}
        </div>
    )
}
