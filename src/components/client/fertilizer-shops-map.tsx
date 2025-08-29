
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
};

const defaultCenter = {
  lat: 28.6139, // Default to Delhi, India
  lng: 77.2090,
};

const libraries: ("places")[] = ["places"];

type PlaceResult = google.maps.places.PlaceResult;

export function FertilizerShopsMap() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const searchNearbyShops = useCallback((map: google.maps.Map) => {
    const service = new google.maps.places.PlacesService(map);
    const request: google.maps.places.PlaceSearchRequest = {
      location: map.getCenter()!,
      radius: 5000, // 5km radius
      keyword: "fertilizer shop",
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setPlaces(results);
      }
    });
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(userCenter);
          map.setCenter(userCenter);
          map.setZoom(14);
          searchNearbyShops(map);
        },
        () => {
          map.setCenter(defaultCenter);
          map.setZoom(12);
          searchNearbyShops(map);
        }
      );
    } else {
        map.setCenter(defaultCenter);
        map.setZoom(12);
        searchNearbyShops(map);
    }
  }, [searchNearbyShops]);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      return (
         <div className="flex items-center justify-center h-full text-center text-muted-foreground p-4">
            Google Maps API Key is missing. Please add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to your .env file to use this feature.
        </div>
      )
  }
  
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full text-center text-muted-foreground p-4">
        Could not load the map. Please ensure you have a valid Google Maps API key in your environment variables and that it is correctly configured in the Google Cloud Console.
      </div>
    );
  }

  return isLoaded ? (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeId: "roadmap",
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: false,
        }}
      >
        {places.map((place) => (
          <Marker
            key={place.place_id}
            position={place.geometry?.location}
            onClick={() => setSelectedPlace(place)}
          />
        ))}

        {selectedPlace && (
          <InfoWindow
            position={selectedPlace.geometry?.location}
            onCloseClick={() => setSelectedPlace(null)}
          >
            <div className="p-1 max-w-xs">
              <h3 className="font-bold text-base">{selectedPlace.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedPlace.vicinity}</p>
              {selectedPlace.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{selectedPlace.rating} ({selectedPlace.user_ratings_total} reviews)</span>
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  ) : (
    <Skeleton className="h-full w-full rounded-lg" />
  );
}
