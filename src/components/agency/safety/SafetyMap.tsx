"use client";

import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
  tone: "sos" | "live";
}

// Default Leaflet marker icons reference image files that Next.js/webpack won't
// resolve automatically — a divIcon sidesteps that entirely and lets the pin
// match the app's own red/green palette instead of Leaflet's stock blue pin.
function pinIcon(tone: MapPin["tone"]) {
  const color = tone === "sos" ? "#DC2626" : "#16A34A";
  return L.divIcon({
    className: "",
    html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26],
  });
}

const NEPAL_CENTER: [number, number] = [28.3949, 84.124];

export default function SafetyMap({ pins }: { pins: MapPin[] }) {
  const center = useMemo<[number, number]>(() => {
    if (pins.length === 0) return NEPAL_CENTER;
    return [pins.reduce((s, p) => s + p.lat, 0) / pins.length, pins.reduce((s, p) => s + p.lng, 0) / pins.length];
  }, [pins]);

  return (
    <MapContainer center={center} zoom={pins.length ? 8 : 7} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {pins.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={pinIcon(p.tone)}>
          <Popup>
            <p className="font-semibold">{p.title}</p>
            <p className="text-xs text-neutral-600">{p.subtitle}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
