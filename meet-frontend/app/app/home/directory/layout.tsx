"use client"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookUserIcon, PlusIcon, VideoIcon, SettingsIcon, CalendarIcon, DoorClosedIcon } from "lucide-react";
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
import { appContext } from "@/app/app/layout";

export default function AppPage({children}: {children: React.ReactNode}) {
    const time = useClock()
    const router = useRouter()
    const data = useRequests({
        requests: [
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
        <div className="directory-mainarea">
            <div className="directory-sidebar">
                <div className="directory-sidebar-header">
                    <BookUserIcon size={20} />
                    <div className="directory-sidebar-header-title">
                        Directory - {auth.data?.tenant.displayName ? auth.data?.tenant.displayName : auth.data?.tenant.name}
                    </div>
                </div>
                <div className="directory-sidebar-content">
                    {data.loaded && data.data?.["/directory"].data.map((user: any) => (
                        <DirectorySidebarItem key={user.id} name={user.name} subtitle={user.email} status={user.status} onClick={() => router.push(`/app/home/directory/${user.userid}`)}/>
                    ))}
                </div>
            </div>
            <div className="directory-mainarea-content">
                {children}
            </div>
        </div>
    )
}

function DirectorySidebarItem({name, subtitle, status, onClick}: {name: string, subtitle: string, status: string, onClick: () => void}) {
    return (
        <div className="directory-sidebar-item" onClick={onClick}>
            <div className="directory-sidebar-item-title">
                {name}
                <StatusDot status={status}/>
            </div>
            <div className="directory-sidebar-item-subtitle">
                {subtitle}
            </div>
        </div>
    )
}

function StatusDot({status}: {status: string}) {
    return (
        <div style={{backgroundColor: "var(--qu-color-" + status.toLowerCase() + ")"}} className="w-[10px] h-[10px] rounded-full"/>
    )
}