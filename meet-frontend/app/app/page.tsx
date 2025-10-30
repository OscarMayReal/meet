"use client"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon, VideoIcon, SettingsIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "keystone-lib";
import { useRouter } from "next/navigation";
import {CreateMeeting} from "@/components/createMeeting";
import {JoinMeeting} from "@/components/createMeeting";
import "@/app/app/home.css"
import { useClock } from "@/lib/useClock";
import { Settings } from "@/components/createMeeting";
import { TeamDashboard } from "@/components/createMeeting";

export default function AppPage() {
    const time = useClock()
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!})
    const router = useRouter()
    return (
        <div className="homepage">
            <div className="homepage-header">
                <VideoIcon size={25} color="var(--qu-color-foreground)" strokeWidth={1.5} />
                {auth.data?.tenant.logo ? <img src={auth.data?.tenant.logo} className="homepage-header-title-secondary-logo" /> : <h1 className="homepage-header-title-secondary">{auth.data?.tenant.name}</h1>}
                <h1 className="homepage-header-title">Quntem Meet</h1>
                <div style={{flexGrow: 1}} />
                <TeamDashboard />
                <Settings />
            </div>
            <div className="homepage-mainarea">
                <h1 className="homepage-mainarea-clock">{time.getHours() != 0 ? time.getHours() > 9 ? time.getHours() : "0" + time.getHours() : "00"}:{time.getMinutes() != 0 ? time.getMinutes() > 9 ? time.getMinutes() : "0" + time.getMinutes() : "00"} • {time.getDate()}/{time.getMonth() + 1}/{time.getFullYear()}</h1>
                <h1 className="homepage-mainarea-title">Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {auth.data?.user.name}</h1>
                <div className="homepage-mainarea-button-row">
                    <CreateMeeting />
                    <JoinMeeting />
                </div>
            </div>
        </div>
    )
}