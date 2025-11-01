"use client"
import { BookUserIcon, HomeIcon, VideoIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { TeamDashboard, Settings } from "@/components/createMeeting";
import { appContext } from "@/app/app/layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";
export default function Layout({children}: {children: React.ReactNode}) {
    const {socket} = useContext(appContext)
    const router = useRouter()
    const pathname = usePathname()
    const [isElectron, setIsElectron] = useState(false)
    useEffect(() => {
        setIsElectron(navigator.userAgent.includes("Electron"))
    }, [])
    return (
        <div className="homepage">
            <div className="homepage-header">
                {isElectron && (
                    <div style={{
                        width: 60
                    }} />
                )}
                <VideoIcon size={25} color="var(--qu-color-foreground)" strokeWidth={1.5} />
                {/* {auth.data?.tenant.logo ? <img src={auth.data?.tenant.logo} className="homepage-header-title-secondary-logo" /> : <h1 className="homepage-header-title-secondary">{auth.data?.tenant.name}</h1>} */}
                {/* <h1 className="homepage-header-title">Quntem Meet</h1> */}
                {socket?.connected && <StatusSwitch />}
                <div style={{flexGrow: 1}} />
                <div className="homepage-header-tabbar">
                    <TabItem name="Home" Icon={HomeIcon} active={pathname === "/app/home"} onClick={() => router.push("/app/home")} />
                    <TabItem name="Directory" Icon={BookUserIcon} active={pathname.startsWith("/app/home/directory")} onClick={() => router.push("/app/home/directory")} />
                </div>
                <TeamDashboard />
                <Settings />
            </div>
            {children}
            <img className="theme-spooky-pumpkin theme-spooky-pumpkin-1" src="/pumpkin.png" />
            <img className="theme-spooky-pumpkin theme-spooky-pumpkin-2" src="/pumpkin.png" />
            <img className="theme-spooky-pumpkin theme-spooky-pumpkin-3" src="/pumpkin.png" />
            <img className="theme-spooky-pumpkin theme-spooky-pumpkin-4" src="/pumpkin.png" />
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
                backgroundColor: "var(--qu-color-background-body)",
                WebkitAppRegion: "no-drag"
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

function TabItem({name, Icon, active, onClick}: {name: string, Icon: React.ElementType, active: boolean, onClick: () => void}) {
    return (
        <div className={"homepage-header-tabbar-item" + (active ? " active" : "")} onClick={onClick}>
            <Icon className="homepage-header-tabbar-item-icon" size={20} />
            <h1 className="homepage-header-tabbar-item-text">{name}</h1>
        </div>
    )
}
    