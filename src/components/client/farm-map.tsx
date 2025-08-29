
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
  lat: 28.6139, // Default to Delhi, India
  lng: 77.2090,
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
    // The polygon is automatically added to the map by the DrawingManager when `drawingControl` is true.
    // To manage it ourselves (e.g., to clear it), we'll add it to our state.
    // The google.maps.event.addListener on the drawingManager handles this.
  };

  const onDrawingManagerLoad = (drawingManager: google.maps.drawing.DrawingManager) => {
    google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon: google.maps.Polygon) => {
        setDrawnPolygons(prev => [...prev, polygon]);
    });
  }

  const clearDrawings = () => {
    drawnPolygons.forEach((p) => p.setMap(null));
    setDrawnPolygons([]);
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full text-center text-muted-foreground p-4">
        Could not load the map. Please ensure you have a valid Google Maps API key in your environment variables and that it is correctly configured in the Google Cloud Console.
      </div>
    );
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      return (
         <div className="flex items-center justify-center h-full text-center text-muted-foreground p-4">
            Google Maps API Key is missing. Please add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to your .env file to use this feature.
        </div>
      )
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
          fullscreenControl: false,
        }}
      >
        <DrawingManager
          onLoad={onDrawingManagerLoad}
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
            rectangleOptions: {
                fillColor: "hsl(var(--primary) / 0.3)",
                strokeColor: "hsl(var(--primary))",
                strokeWeight: 2,
                clickable: false,
                editable: true,
                zIndex: 1,
            }
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
