import { useState } from "react";
import { useAuth } from "keystone-lib"
import { useRouter } from "next/navigation"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon, SettingsIcon, TextCursorInput, TextCursorInputIcon, UsersIcon, VideoIcon } from "lucide-react"
import { Input } from "@/components/ui/input";

export function CreateMeeting() {
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
                                        router.push("/meeting/" + data.id)
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
                            router.push("/meeting/" + name)
                        }}><PlusIcon />Join</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function Settings() {
    const [open, setOpen] = useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <SettingsIcon size={22} color="var(--qu-color-foreground)" strokeWidth={1.5} />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Configure your settings
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={"outline"}>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function TeamDashboard() {
    const [open, setOpen] = useState(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <UsersIcon size={22} color="var(--qu-color-foreground)" strokeWidth={1.5} />
            </DialogTrigger>
            <DialogContent style={{width: "100vw", height: "100vh", maxWidth: "100vw", maxHeight: "100vh", margin: "0", padding: "0", border: "none", borderRadius: "0", overflow: "hidden", boxShadow: "none"}}>
                <iframe src="https://keystone.qplus.cloud/team" style={{width: "100vw", height: "100vh", margin: "0", padding: "0"}} />
                <div style={{height: 50, width: 50, position: "absolute", top: 0, right: 0, backgroundColor: "white"}} />
            </DialogContent>
        </Dialog>
    )
}
    
