"use client"
import { Toaster } from "@/components/ui/sonner"
import { useAuth } from "keystone-lib"
import { PhoneIcon } from "lucide-react"
import { createContext, useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import { io } from "socket.io-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
export const appContext = createContext({
    auth: null as any,
    socket: null as Socket | null,
    setSocket: (socket: Socket) => {},
    connected: false,
    theme: {
        name: "Spooky",
        data: "spooky"
    },
    setTheme: (theme: {name: string, data: string}) => {}
})

export default function AppLayout({children}: {children: React.ReactNode}) {
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!})
    const [socket, setSocket] = useState<Socket | null>(null)
    const [connected, setConnected] = useState(false)
    const router = useRouter()
    const [theme, setTheme] = useState({
        name: "Spooky",
        data: "spooky"
    })
    useEffect(() => {
        document.body.setAttribute("data-theme", theme.data)
    }, [theme])
    useEffect(() => {
        if (auth.loaded && auth.error) {
            window.location.href = "https://keystoneapi.qplus.cloud/auth/signin?redirectTo=" + window.location.href
        }
    }, [auth])
    const [isElectron, setIsElectron] = useState(false)
    useEffect(() => {
        setIsElectron(navigator.userAgent.includes("Electron"))
        if (window.localStorage.getItem("theme")) {
            setTheme(JSON.parse(window.localStorage.getItem("theme")!))
        }
    }, [])
    useEffect(() => {
        if(!auth.data) return
        const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
            auth: {
                sessionId: auth.data?.sessionId!
            }
        })
        setSocket(socket)
        socket.on("connect", () => {
            setConnected(true)
        })
        socket.on("disconnect", () => {
            setConnected(false)
        })
        socket.on("telephony.call", (data) => {
            socket.emit("status.get", (status: string) => {
                if (status == "ONLINE") {
                    const audio = new Audio()
                    audio.src = "/ringtone.mp3"
                    audio.play()
                    toast("Call from " + data.profile.name, {
                        duration: 10000,
                        description: data.profile.tenant?.name + "/" + data.profile.username,
                        action: <Button style={{
                            marginLeft: "auto"
                        }} variant="outline" onClick={() => {
                            if (isElectron) {
                                window.open("/app/meeting/" + data.meetingid + "?call=true", "_blank")
                            } else {
                                router.push("/app/meeting/" + data.meetingid + "?call=true")
                            }
                            audio.pause()
                            audio.remove()
                            toast.dismiss()
                        }}><PhoneIcon />Accept</Button>
                    })
                }
            })
        })
    }, [auth])
    if(!connected || !auth.data) return <div className="homepage"></div>
    return <appContext.Provider value={{auth: auth!, socket, setSocket, connected, theme, setTheme}}>{children}<Toaster position="top-right"/>{theme.data == "spooky" ? <BatMouseFollower/> : null}</appContext.Provider>
}

function BatMouseFollower() {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})
    const [batPosition, setBatPosition] = useState({x: 0, y: 0})
    useEffect(() => {
        document.addEventListener("mousemove", (e: MouseEvent) => {
            setMousePosition({x: e.clientX, y: e.clientY})
        })
        const interval = setInterval(() => {
            setBatPosition({x: batPosition.x + (mousePosition.x - batPosition.x) * 0.1, y: batPosition.y + (mousePosition.y - batPosition.y) * 0.1})
        }, 16)
        return () => {
            clearInterval(interval)
            document.removeEventListener("mousemove", (e: MouseEvent) => {
                setMousePosition({x: e.clientX, y: e.clientY})
            })
        }
    }, [batPosition])
    return <img src="/bat.png" className="bat-mouse-follower" style={{
        position: "fixed",
        width: 100,
        height: 100,
        top: batPosition.y,
        left: batPosition.x,
        zIndex: 9999,
        pointerEvents: "none",
    }}/>
}
    