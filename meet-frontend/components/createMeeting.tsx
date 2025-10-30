import { useState } from "react";
import { useAuth } from "keystone-lib"
import { useRouter } from "next/navigation"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon, TextCursorInput, TextCursorInputIcon, VideoIcon } from "lucide-react"
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
