import { useAuth } from "keystone-lib"
import { useEffect, useState } from "react"

export function useToken({meetingid}: {meetingid: string}) {
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!})
    console.log(auth.data?.sessionId)
    const [token, setToken] = useState<string | null>(null)
    useEffect(() => {
        if (!auth.data) return
        if (!meetingid) return
        fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + "/meeting/join", {
            method: "POST",
            headers: {
                "authorization": "Bearer " + auth.data?.sessionId!,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({id: meetingid})
        }).then((res) => {
            if (res.ok) {
                res.json().then((data) => {
                    setToken(data)
                })
            }
        })
    }, [auth.data, meetingid])
    return token
}