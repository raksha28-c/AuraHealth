"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const CLINICS = [
  { id: 1, name: "Manipal Hospital (Old Airport Road)", lat: 12.9600, lng: 77.6480, status: "Open 24/7" },
  { id: 2, name: "Aster CMI Hospital", lat: 13.0610, lng: 77.5960, status: "Open" },
  { id: 3, name: "Narayana Health City", lat: 12.8120, lng: 77.6940, status: "Specialty Only" },
  { id: 4, name: "Fortis Hospital (Bannerghatta)", lat: 12.8950, lng: 77.5980, status: "Emergency Ready" },
];

function RecenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 14);
  }, [coords, map]);
  return null;
}

export default function ClinicMap() {
  const [center, setCenter] = useState<[number, number]>([51.505, -0.09]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.log("Geolocation error:", err)
      );
    }
  }, []);

  if (!isClient) return <div className="map-container glass" style={{ height: "400px" }}>Loading Map...</div>;

  return (
    <div className="map-container glass" style={{ height: "400px", zIndex: 10 }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap coords={center} />
        
        {CLINICS.map((clinic) => (
          <Marker key={clinic.id} position={[clinic.lat, clinic.lng]}>
            <Popup>
              <div style={{ color: "black" }}>
                <strong>{clinic.name}</strong><br />
                Status: {clinic.status}
              </div>
            </Popup>
          </Marker>
        ))}
        
        <Marker position={center}>
          <Popup><div style={{ color: "black" }}>You are here</div></Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
