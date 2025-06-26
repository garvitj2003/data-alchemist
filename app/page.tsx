"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function () {
  const router = useRouter();
  return (
    <div>
      <div>welcome</div>
      <Button onClick={() => router.push("/upload")}>Get started</Button>
    </div>
  );
}
