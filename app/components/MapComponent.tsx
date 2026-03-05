"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

interface MapComponentProps {
  latitude: number;
  longitude: number;
}

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-zinc-100/60 rounded-xl">
      <div className="flex flex-col items-center gap-2 text-zinc-400">
        <div className="h-6 w-6 border-2 border-zinc-300 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-xs font-medium">Loading map…</span>
      </div>
    </div>
  ),
});

export default function MapComponent({ latitude, longitude }: MapComponentProps) {
  const key = useMemo(() => `${latitude}-${longitude}`, [latitude, longitude]);
  return <LeafletMap key={key} latitude={latitude} longitude={longitude} />;
}
