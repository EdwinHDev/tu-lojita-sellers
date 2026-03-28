"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Loading03Icon } from "hugeicons-react";

// Fix Leaflet's default icon path issues with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface MapPickerClientProps {
  initialPosition?: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}

// Default center to Venezuela fallback if no geoloc
const VENEZUELA_CENTER: [number, number] = [6.4238, -66.5897];

function MapController({ 
  position, 
  onPositionChange,
  disabled
}: { 
  position: [number, number] | null; 
  onPositionChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!disabled) {
        onPositionChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return position ? (
    <Marker 
      position={position} 
      draggable={!disabled}
      eventHandlers={{
        dragend: (e) => {
          if (!disabled) {
            const marker = e.target;
            const pos = marker.getLatLng();
            onPositionChange(pos.lat, pos.lng);
          }
        }
      }}
    />
  ) : null;
}

export default function MapPickerClient({ initialPosition, onPositionChange, disabled }: MapPickerClientProps) {
  const [center, setCenter] = useState<[number, number]>(initialPosition || VENEZUELA_CENTER);
  const [zoom, setZoom] = useState<number>(initialPosition ? 16 : 5);
  const [position, setPosition] = useState<[number, number] | null>(initialPosition || null);
  const [loadingLoc, setLoadingLoc] = useState(!initialPosition); // Solo buscamos si no hay pos inicial

  useEffect(() => {
    let mounted = true;
    // Si no tenemos una posicion inicial, tratamos de pedirla
    if (!initialPosition) {
      if (typeof navigator !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!mounted) return;
            const currentPosition: [number, number] = [pos.coords.latitude, pos.coords.longitude];
            setCenter(currentPosition);
            setZoom(16);
            setPosition(currentPosition);
            onPositionChange(currentPosition[0], currentPosition[1]);
            setLoadingLoc(false);
          },
          (error) => {
            console.error("Geoloc error:", error);
            if (!mounted) return;
            // Default Vzla
            setCenter(VENEZUELA_CENTER);
            setZoom(5);
            setLoadingLoc(false);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        setLoadingLoc(false);
      }
    }
    
    return () => {
      mounted = false;
    };
  }, [initialPosition, onPositionChange]);

  if (loadingLoc) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
        <Loading03Icon className="animate-spin text-indigo-600 mb-2" />
        <p className="text-xs font-medium text-gray-500">Obteniendo tu ubicación...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController 
          position={position} 
          onPositionChange={(lat, lng) => {
            setPosition([lat, lng]);
            onPositionChange(lat, lng);
          }} 
          disabled={disabled} 
        />
      </MapContainer>
    </div>
  );
}
