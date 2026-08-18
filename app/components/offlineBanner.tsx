"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function OfflineBanner({
  fetchedAt,
}: {
  fetchedAt: string | null;
}) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="text-center text-sm font-medium py-1 bg-[#256F5C]/10 text-[#256F5C]"
    >
      You're offline — showing rates from
      {fetchedAt ? dayjs(fetchedAt).format(" h:mm A") : " your last visit"}.
    </div>
  );
}
