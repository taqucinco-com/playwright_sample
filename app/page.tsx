"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main style={{ padding: "48px 16px", maxWidth: 640, margin: "0 auto" }}>
      <h1>Home</h1>
      <button type="button" onClick={() => router.push("/about")}>
        about へ
      </button>
    </main>
  );
}
