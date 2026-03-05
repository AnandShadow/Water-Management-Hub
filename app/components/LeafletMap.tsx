"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { useTheme } from "next-themes";

/* Fix Leaflet's default marker icon paths broken by bundlers */
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/* Recenter map when coordinates change */
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

interface LeafletMapProps {
  latitude: number;
  longitude: number;
}

export default function LeafletMap({ latitude, longitude }: LeafletMapProps) {
  const { theme } = useTheme();
  const tileUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileAttribution =
    theme === "dark"
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      scrollWheelZoom={true}
      className="h-full w-full rounded-xl z-0"
      style={{ minHeight: "100%" }}
    >
      <TileLayer
        attribution={tileAttribution}
        url={tileUrl}
      />
      <Marker position={[latitude, longitude]} icon={markerIcon}>
        <Popup>
          <span className="text-xs font-semibold">
            {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
          </span>
        </Popup>
      </Marker>
      <RecenterMap lat={latitude} lng={longitude} />
    </MapContainer>
  );
}
