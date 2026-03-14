"use client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for the default marker icon not showing up in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

export default function Map({ userPos, partnerPos }) {
  const center = userPos || [36.8065, 10.1815]; // Default to Tunis

  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden border-2 border-pink-200 shadow-inner">
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        {userPos && (
          <Marker position={userPos} icon={icon}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {partnerPos && (
          <Marker position={partnerPos} icon={icon}>
            <Popup>Partner is here</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}