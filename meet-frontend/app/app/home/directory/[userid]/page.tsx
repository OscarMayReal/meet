"use client"
import { useParams } from "next/navigation"
import { useRequests } from "@/lib/useRequests"
import { Button } from "@/components/ui/button"
import { MailIcon, PhoneIcon } from "lucide-react"
import { appContext } from "@/app/app/layout"
import { useContext } from "react"
import { useRouter } from "next/navigation"
export default function DirectoryPage() {
    const {socket, auth} = useContext(appContext)
    const params = useParams()
    const router = useRouter()
    const data = useRequests({
        requests: [
            {
                url: `/directory/${params.userid}`,
                resType: "json"
            }
        ]
    })
    return (
        <div className="w-full h-full">
            <div className="directory-page-infobox">
                <h1 className="directory-page-infobox-title">{data.data?.["/directory/" + params.userid]?.data.name}</h1>
                <p className="directory-page-infobox-subtitle">{data.data?.["/directory/" + params.userid]?.data.email}</p>
            </div>
            <div className="directory-page-infobox-buttons">
                <Button onClick={async () => {
                    const meetingid = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + "/meeting/create", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + auth.data?.sessionId!
                        },
                        body: JSON.stringify({name: "Call With " + data.data?.["/directory/" + params.userid]?.data.name + ", " + auth.data?.user?.name})
                    }).then((res) => res.json().then((data) => data.id))
                    socket?.emit("telephony.call", {
                        to: params.userid,
                        from: auth.data?.user?.id!,
                        meetingid: meetingid
                    })
                    router.push("/app/meeting/" + meetingid + "?call=true")
                }} className="directory-page-infobox-button w-fit" variant="outline"><PhoneIcon />Call</Button>
                <a href={"mailto:" + data.data?.["/directory/" + params.userid]?.data.email}><Button className="directory-page-infobox-button w-fit" variant="outline"><MailIcon />Email</Button></a>
            </div>
        </div>
    )
}