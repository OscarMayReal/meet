import { useContext, useEffect, useState } from "react";
import { useAuth } from "keystone-lib"
import { useRouter } from "next/navigation"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Paintbrush2Icon, PlusIcon, SettingsIcon, TextCursorInput, TextCursorInputIcon, UsersIcon, VideoIcon, XIcon } from "lucide-react"
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldGroup, FieldTitle } from "./ui/field";
import router from "next/router";
import { appContext } from "@/app/app/layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMediaDevices, usePersistentUserChoices } from "@livekit/components-react";

export function CreateMeeting() {
    const [isElectron, setIsElectron] = useState(false)
    useEffect(() => {
        setIsElectron(navigator.userAgent.includes("Electron"))
    }, [])
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!})
    const router = useRouter()
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={"outline"}><VideoIcon />New Meeting</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Meeting</DialogTitle>
                    <DialogDescription>
                        Create a new Video Conference
                    </DialogDescription>
                </DialogHeader>
                <Input placeholder="Meeting Name" value={name} onChange={(e) => setName(e.target.value)} />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={"outline"} onClick={() => {
                            fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + "/meeting/create", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": "Bearer " + auth.data?.sessionId!
                                },
                                body: JSON.stringify({name})
                            }).then((res) => {
                                if (res.ok) {
                                    setOpen(false)
                                    res.json().then((data) => {
                                        console.log(data)
                                        if (isElectron) {
                                            window.open("/app/meeting/" + data.id, "_blank")
                                        } else {
                                            router.push("/app/meeting/" + data.id)
                                        }
                                    })
                                }
                            })
                        }}><PlusIcon />Create</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function JoinMeeting() {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!})
    const router = useRouter()
    const [isElectron, setIsElectron] = useState(false)
    useEffect(() => {
        setIsElectron(navigator.userAgent.includes("Electron"))
    }, [])
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={"outline"}><TextCursorInputIcon />Join Meeting</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Join Meeting</DialogTitle>
                    <DialogDescription>
                        Enter the meeting ID
                    </DialogDescription>
                </DialogHeader>
                <Input placeholder="Meeting ID" value={name} onChange={(e) => setName(e.target.value)} />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={"outline"} onClick={() => {
                            if (isElectron) {
                                window.open("/app/meeting/" + name, "_blank")
                            } else {
                                router.push("/app/meeting/" + name)
                            }
                        }}><PlusIcon />Join</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function Settings({size}: {size?: number}) {
    const availableThemes = [
        {
            name: "Light",
            data: "light"
        },
        {
            name: "Dark",
            data: "dark"
        },
        {
            name: "Spooky",
            data: "spooky"
        }
    ]
    const {theme, setTheme} = useContext(appContext)
    const [open, setOpen] = useState(false)
    const [tab, setTab] = useState("devices")
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <SettingsIcon size={size || 20} color="var(--qu-color-foreground)" />
            </DialogTrigger>
            <DialogContent style={{
                padding: 0,
                gap: 0,
                overflow: "hidden",
            }}>
                <DialogHeader style={{
                    height: 60,
                    borderBottom: "1px solid var(--qu-color-border)",
                }}>
                    <div className="homepage-header-tabbar" style={{
                        height: 60,
                    }}>
                        {/* <TabItem name="General" Icon={SettingsIcon} active={tab === "general"} onClick={() => setTab("general")} /> */}
                        <TabItem name="Devices" Icon={VideoIcon} active={tab === "devices"} onClick={() => setTab("devices")} />
                        <TabItem name="Theme" Icon={Paintbrush2Icon} active={tab === "theme"} onClick={() => setTab("theme")} />
                    </div>
                </DialogHeader>
                <div style={{
                    height: "calc(100% - 60px)",
                }}>
                    {/* {tab === "general" && <div className="settings-tab-area">
                        <div className="settings-tab-area-title">
                            <h1>General</h1>
                        </div>
                    </div>} */}
                    {tab === "devices" && <div className="settings-tab-area">
                        <div className="settings-tab-area-title mb-2">
                            <h1>Devices</h1>
                        </div>
                        <MediaDeviceSwitcher />
                    </div>}
                    {tab === "theme" && <div className="settings-tab-area">
                        <div className="settings-tab-area-title">
                            <h1>Theme</h1>
                        </div>
                        <Select style={{
                            width: "100%"
                        }} value={theme.name} onValueChange={(value) => {
                            setTheme(availableThemes.find((theme) => theme.name === value)!)
                            window.localStorage.setItem("theme", JSON.stringify(availableThemes.find((theme) => theme.name === value)!))
                        }}>
                            <SelectTrigger style={{
                                backgroundColor: "var(--background)",
                                WebkitAppRegion: "no-drag",
                                width: "100%",
                                marginTop: "10px"
                            }}>
                                <SelectValue placeholder="Select a theme" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableThemes.map((theme) => (
                                    <SelectItem key={theme.name} value={theme.name}>
                                        {theme.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function MediaDeviceSwitcher() {
    const videoDevices = useMediaDevices({kind: "videoinput"})
    const audioDevices = useMediaDevices({kind: "audioinput"})
    const userchoices = usePersistentUserChoices()
    if(videoDevices.length === 0 || audioDevices.length === 0) return null
    return (
        <>
            <FieldGroup>
                <Field>
                    <FieldTitle>Video Device</FieldTitle>
                    <FieldDescription>Select a video device to use for meetings</FieldDescription>
                    <Select value={userchoices.userChoices.videoDeviceId} onValueChange={(value) => userchoices.saveVideoInputDeviceId(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a video device" />
                        </SelectTrigger>
                        <SelectContent>
                            {videoDevices.map((device) => (
                                <SelectItem key={device.label} value={device.deviceId}>
                                    {device.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Field>
                    <FieldTitle>Audio Device</FieldTitle>
                    <FieldDescription>Select an audio device to use for meetings</FieldDescription>
                    <Select value={userchoices.userChoices.audioDeviceId} onValueChange={(value) => userchoices.saveAudioInputDeviceId(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an audio device" />
                        </SelectTrigger>
                        <SelectContent>
                            {audioDevices.map((device) => (
                                <SelectItem key={device.label} value={device.deviceId}>
                                    {device.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
            </FieldGroup>
        </>
    )
}

export function TeamDashboard() {
    const [open, setOpen] = useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <UsersIcon size={20} color="var(--qu-color-foreground)" />
            </DialogTrigger>
            <DialogContent style={{width: "100vw", height: "100vh", maxWidth: "100vw", maxHeight: "100vh", margin: "0", padding: "0", border: "none", borderRadius: "0", overflow: "hidden", boxShadow: "none"}}>
                <iframe src="https://keystone.qplus.cloud/team" style={{width: "100vw", height: "100vh", margin: "0", padding: "0"}} />
                <div style={{height: 50, width: 50, position: "absolute", top: 0, right: 0, backgroundColor: "white"}} />
            </DialogContent>
        </Dialog>
    )
}
    
export function ScheduleMeeting({dataHook}: {dataHook: any}) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [date, setDate] = useState(new Date().toLocaleString())
    const [endDate, setEndDate] = useState(new Date().setHours(new Date().getHours() + 1).toLocaleString())
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!})
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-[300px]"><CalendarIcon />Schedule Meeting</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Schedule Meeting</DialogTitle>
                    <DialogDescription>
                        Schedule a new Video Conference
                    </DialogDescription>
                </DialogHeader>
                <FieldGroup>
                    <Field>
                        <FieldTitle>Meeting Name</FieldTitle>
                        <Input placeholder="Meeting Name" value={name} onChange={(e) => setName(e.target.value)} />
                    </Field>
                    <Field>
                        <FieldTitle>Meeting Description</FieldTitle>
                        <Input placeholder="Meeting Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </Field>
                    <Field>
                        <FieldTitle>Start and End Date</FieldTitle>
                        <div className="flex gap-[10px]">
                            <Input type="datetime-local" placeholder="Meeting Start Date" value={date} onChange={(e) => setDate(e.target.value)} />
                            <Input type="datetime-local" placeholder="Meeting End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </Field>
                </FieldGroup>
                <DialogFooter>
                    <Button variant="outline" onClick={() => {
                        fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + "/meeting/schedule", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer " + auth.data?.sessionId!
                            },
                            body: JSON.stringify({name, description, startTime: new Date(date), endTime: new Date(endDate)})
                        }).then((res) => {
                            if (res.ok) {
                                setOpen(false)
                                res.json().then((data) => {
                                    console.log(data)
                                    setOpen(false)
                                    dataHook.reload()
                                })
                            }
                        })
                    }}><CalendarIcon />Schedule</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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