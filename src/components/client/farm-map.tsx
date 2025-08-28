
"use client";

import { useState, useCallback, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  DrawingManager,
} from "@react-google-maps/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

const libraries: "drawing"[] = ["drawing"];

export function FarmMap() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [drawnPolygons, setDrawnPolygons] = useState<google.maps.Polygon[]>([]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.log("Error: The Geolocation service failed. Using default location.");
        }
      );
    }
  }, []);

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const onPolygonComplete = (polygon: google.maps.Polygon) => {
    // The polygon is automatically added to the map by the DrawingManager.
    // We'll keep a reference to it to be able to clear it later.
    setDrawnPolygons((prev) => [...prev, polygon]);
    // Prevent the polygon from being drawn again by the manager
    (polygon as any).setMap(null); 
    
    // To keep it on the map, we need to re-add it under our own management
    polygon.setMap(map);
  };

  const clearDrawings = () => {
    drawnPolygons.forEach((p) => p.setMap(null));
    setDrawnPolygons([]);
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full">
        Error loading maps. Please check your API key and configuration.
      </div>
    );
  }

  return isLoaded ? (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeId: "satellite",
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        <DrawingManager
          onPolygonComplete={onPolygonComplete}
          options={{
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [
                google.maps.drawing.OverlayType.POLYGON,
                google.maps.drawing.OverlayType.RECTANGLE,
              ],
            },
            polygonOptions: {
              fillColor: "hsl(var(--primary) / 0.3)",
              strokeColor: "hsl(var(--primary))",
              strokeWeight: 2,
              clickable: false,
              editable: true,
              zIndex: 1,
            },
          }}
        />
      </GoogleMap>
      {drawnPolygons.length > 0 && (
        <Button
          variant="destructive"
          size="icon"
          onClick={clearDrawings}
          className="absolute bottom-4 right-4 z-10"
          title="Clear all drawings"
        >
          <Trash2 className="size-5" />
        </Button>
      )}
    </div>
  ) : (
    <Skeleton className="h-full w-full rounded-lg" />
  );
}
