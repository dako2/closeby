import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { useQuery } from "@tanstack/react-query";
import { type Landmark, type BoundingBox } from "@shared/schema";
import { LandmarkCard } from "./landmark-card";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

function BboxChangeHandler({ onBboxChange }: { onBboxChange: (bbox: BoundingBox) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const bbox = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };
      onBboxChange(bbox);
    }
  });
  return null;
}

export function MapView() {
  const [bbox, setBbox] = useState<BoundingBox>({
    north: 51.5074,
    south: 51.5074,
    east: -0.1278,
    west: -0.1278
  });

  const { data: landmarks } = useQuery<Landmark[]>({
    queryKey: ["/api/landmarks", bbox ? JSON.stringify(bbox) : null],
    enabled: !!bbox,
    queryFn: async () => {
      if (!bbox) return [];

      const params = new URLSearchParams({
        north: bbox.north.toString(),
        south: bbox.south.toString(),
        east: bbox.east.toString(),
        west: bbox.west.toString()
      });

      const response = await fetch(`/api/landmarks?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch landmarks');
      }
      return response.json();
    }
  });

  return (
    <div className="h-[80vh] rounded-lg overflow-hidden border">
      <MapContainer
        center={[51.5074, -0.1278]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BboxChangeHandler onBboxChange={setBbox} />
        {landmarks?.map((landmark) => (
          <Marker
            key={landmark.id}
            position={[Number(landmark.lat), Number(landmark.lng)]}
          >
            <Popup>
              <LandmarkCard landmark={landmark} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}