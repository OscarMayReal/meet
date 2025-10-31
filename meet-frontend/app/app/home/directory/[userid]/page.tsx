"use client"
import { useParams } from "next/navigation"
import { useRequests } from "@/lib/useRequests"
import { Button } from "@/components/ui/button"
import { MailIcon, PhoneIcon } from "lucide-react"
export default function DirectoryPage() {
    const params = useParams()
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
                <Button className="directory-page-infobox-button w-fit" variant="outline"><PhoneIcon />Call</Button>
                <a href={"mailto:" + data.data?.["/directory/" + params.userid]?.data.email}><Button className="directory-page-infobox-button w-fit" variant="outline"><MailIcon />Email</Button></a>
            </div>
        </div>
    )
}