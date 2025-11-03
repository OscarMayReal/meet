import { LogInIcon, SparklesIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100dvh",
      width: "100vw",
      top: 0,
      position: "fixed",
      gap: 10,
      alignItems: "center",
      justifyContent: "center"
    }}>
      <h1 className="text-4xl" style={{
        color: "var(--qu-color-foreground)"
      }}>Quntem Meet</h1>
      <p className="text-lg">Simple video conferencing</p>
      <div className="flex flex-row items-center gap-3">
        <a href="https://keystone.qplus.cloud/acquireapp/cmhj8sipl000jx9qcl3ghi2mx"><Button variant="outline"><SparklesIcon /> Get Started</Button></a>
        <a href="/app"><Button variant="outline"><LogInIcon /> Login</Button></a>
      </div>
    </div>
  );
}
