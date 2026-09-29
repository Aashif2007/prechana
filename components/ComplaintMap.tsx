"use client";

import dynamic from "next/dynamic";

export const ComplaintMap = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="h-64 w-full rounded-xl bg-slate-100" />,
});
