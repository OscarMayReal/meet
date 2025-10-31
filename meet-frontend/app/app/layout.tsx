"use client"
import { useAuth } from "keystone-lib"
import { createContext, useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import { io } from "socket.io-client"

export const appContext = createContext({
    auth: null as any,
    socket: null as Socket | null,
    setSocket: (socket: Socket) => {},
    connected: false
})

export default function AppLayout({children}: {children: React.ReactNode}) {
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!})
    const [socket, setSocket] = useState<Socket | null>(null)
    const [connected, setConnected] = useState(false)
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
    }, [auth])
    if(!connected || !auth.data) return <div className="homepage"></div>
    return <appContext.Provider value={{auth: auth!, socket, setSocket, connected}}>{children}</appContext.Provider>
}