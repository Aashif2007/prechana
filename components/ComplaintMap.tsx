"use client";

import dynamic from "next/dynamic";

export const ComplaintMap = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] md:h-[480px] w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 text-sm text-slate-400">
      <div className="flex items-center gap-2.5">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        <span>Loading interactive map...</span>
      </div>
    </div>
  ),
});
