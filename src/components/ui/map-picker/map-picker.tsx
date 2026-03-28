"use client";

import dynamic from "next/dynamic";
import { Loading03Icon } from "hugeicons-react";
import { type MapPickerClientProps } from "./map-picker-client";

const DynamicMap = dynamic(() => import("./map-picker-client"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] sm:h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
      <Loading03Icon className="animate-spin text-indigo-600 size-6" />
    </div>
  )
});

export function MapPicker(props: MapPickerClientProps) {
  return <DynamicMap {...props} />;
}
