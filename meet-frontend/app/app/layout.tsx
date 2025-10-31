"use client"
import { useAuth } from "keystone-lib"
import { createContext, useEffect, useState } from "react"
import { Socket } from "socket.io-client"
import { io } from "socket.io-client"

export const appContext = createContext({
    auth: null as any,
    socket: null as Socket | null,
    setSocket: (socket: Socket) => {}
})

export default function AppLayout({children}: {children: React.ReactNode}) {
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!})
    const [socket, setSocket] = useState<Socket | null>(null)
    useEffect(() => {
        if(!auth.data) return
        const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
            auth: {
                sessionId: auth.data?.sessionId!
            }
        })
        setSocket(socket)
    }, [auth])
    return <appContext.Provider value={{auth: auth.data!, socket, setSocket}}>{children}</appContext.Provider>
}