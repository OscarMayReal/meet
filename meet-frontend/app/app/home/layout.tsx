"use client"
import { VideoIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { TeamDashboard, Settings } from "@/components/createMeeting";
import { appContext } from "@/app/app/layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export default function Layout({children}: {children: React.ReactNode}) {
    const {socket} = useContext(appContext)
    return (
        <div className="homepage">
            <div className="homepage-header">
                <VideoIcon size={25} color="var(--qu-color-foreground)" strokeWidth={1.5} />
                {/* {auth.data?.tenant.logo ? <img src={auth.data?.tenant.logo} className="homepage-header-title-secondary-logo" /> : <h1 className="homepage-header-title-secondary">{auth.data?.tenant.name}</h1>} */}
                {/* <h1 className="homepage-header-title">Quntem Meet</h1> */}
                {socket?.connected && <StatusSwitch />}
                <div style={{flexGrow: 1}} />
                <TeamDashboard />
                <Settings />
            </div>
            {children}
        </div>
    )
}

function StatusSwitch() {
    const {socket} = useContext(appContext)
    const [status, setStatus] = useState(null)
    useEffect(() => {
        socket?.emit("status.set", {status})
    }, [status])
    useEffect(() => {
        socket?.emit("status.get", (data: string) => {
            console.log(data)
            setStatus(data)
        })
    }, [])
    return (
        <Select value={status} onValueChange={setStatus}>
            <SelectTrigger style={{
                backgroundColor: "var(--qu-color-background-body)"
            }}>
                <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="ONLINE"><div style={{backgroundColor: "var(--qu-color-online)"}} className="w-[10px] h-[10px] rounded-full"></div>Online</SelectItem>
                <SelectItem value="AWAY"><div style={{backgroundColor: "var(--qu-color-away)"}} className="w-[10px] h-[10px] rounded-full"></div>Away</SelectItem>
                <SelectItem value="BUSY"><div style={{backgroundColor: "var(--qu-color-busy)"}} className="w-[10px] h-[10px] rounded-full"></div>Busy</SelectItem>
                <SelectItem value="OFFLINE"><div style={{backgroundColor: "var(--qu-color-offline)"}} className="w-[10px] h-[10px] rounded-full"></div>Offline</SelectItem>
            </SelectContent>
        </Select>
    )
}