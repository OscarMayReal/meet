import { useAuth } from "keystone-lib"
import { useEffect, useState } from "react"

export type RequestObject = {
    url: string
    resType?: "json" | "text" | undefined
}

export type ResponseObject = {
    status: typeof Response.prototype.status
    data: any
}

export function useRequests({requests}: {requests: RequestObject[]}) {
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!})
    function reload() {
        setData({loaded: false, data: {}, reload})
    }
    const [data, setData] = useState({loaded: false, data: {}, reload})
    useEffect(() => {
        if (data.loaded) return
        if (!auth.data) return
        var responses: Record<string, ResponseObject> = {}
        Promise.all(requests.map((request) => {
            return fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + request.url, {
                headers: {
                    "authorization": "Bearer " + auth.data?.sessionId!
                }
            }).then(async (res) => {
                let data: any
                if (request.resType == "json") {
                    data = await res.json()
                } else if (request.resType == "text") {
                    data = await res.text()
                } else {
                    data = await res.json()
                }
                responses[request.url] = {
                    status: res.status,
                    data
                }
            })
        })).then(() => {
            setData({loaded: true, data: responses, reload})
        })
    }, [requests, data.loaded])
    return data
}