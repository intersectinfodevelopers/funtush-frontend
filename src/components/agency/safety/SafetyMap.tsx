"use client";
import {MapContainer, TileLayer,Marker,Popup} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"

const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface ActiveTrek {
  id: string;
  name: string;
  guide_name: string;
  location_name: string;
  lat: number;
  lng: number;
  last_ping: string;
  has_sos?: boolean;
}

interface SafetyMapProps {
  treks: ActiveTrek[];
}

export default function SafetyMap({ treks }: SafetyMapProps) {
  const defaultCenter: [number, number] = [27.7172, 85.324];

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl border border-slate-200/60 shadow-inner overflow-hidden z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={8} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {treks.map((trek) => (
          <Marker 
            key={trek.id} 
            position={[trek.lat, trek.lng]} 
            icon={customIcon}
          >
            <Popup>
              <div className="p-1 font-sans text-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  {trek.has_sos && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                  <span>{trek.name}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Guide: <strong className="text-slate-700">{trek.guide_name}</strong></p>
                <p className="text-xs text-slate-500">Current Position: <strong className="text-slate-700">{trek.location_name}</strong></p>
                <p className="text-[10px] text-slate-400 mt-1">Last Update: {trek.last_ping}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}