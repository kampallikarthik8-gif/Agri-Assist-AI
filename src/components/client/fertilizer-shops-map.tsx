
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Star, Search, Loader2, Phone, Clock, MapPin, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 28.6139, // Default to Delhi, India
  lng: 77.2090,
};

const libraries: ("drawing" | "geometry" | "places")[] = ["drawing", "geometry", "places"];
libraries.sort();

type PlaceResult = google.maps.places.PlaceResult;

export function FertilizerShopsMap() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

   useEffect(() => {
    setIsMounted(true);
  }, []);

  const searchNearbyShops = useCallback((map: google.maps.Map) => {
    if (!map) return;
    const service = new google.maps.places.PlacesService(map);
    const request: google.maps.places.PlaceSearchRequest = {
      location: map.getCenter()!,
      radius: 10000, // 10km radius
      keyword: "fertilizer shop OR rbk OR Rythu Bharosa Kendram",
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setPlaces(results);
        if(results.length === 0) {
             toast({
                title: "No shops found",
                description: "No fertilizer shops or RBKs found within a 10km radius of this location.",
            });
        }
      } else {
        setPlaces([]);
         toast({
            variant: "destructive",
            title: "Search failed",
            description: "Could not fetch nearby locations. Please try a different area.",
        });
      }
    });
  }, [toast]);
  
  const handleSelectPlace = useCallback((place: PlaceResult) => {
    if (!mapRef.current) return;
    const service = new google.maps.places.PlacesService(mapRef.current);
    
    setSelectedPlace(place);

    service.getDetails({ placeId: place.place_id!, fields: ['name', 'rating', 'user_ratings_total', 'vicinity', 'geometry', 'formatted_phone_number', 'opening_hours', 'place_id', 'url', 'types'] }, (detailedPlace, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && detailedPlace) {
        if(detailedPlace.geometry?.location) {
            mapRef.current?.panTo(detailedPlace.geometry.location);
            mapRef.current?.setZoom(15);
        }
        setSelectedPlace(detailedPlace);
      } else {
         setSelectedPlace(place);
      }
    });
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery || !isLoaded || !mapRef.current) return;
    setIsSearching(true);
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
        setIsSearching(false);
        if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            mapRef.current?.setCenter(location);
            mapRef.current?.setZoom(14);
            searchNearbyShops(mapRef.current!);
        } else {
            toast({
                variant: "destructive",
                title: "Location not found",
                description: "Could not find the location you entered. Please try another search.",
            });
        }
    });
  }, [searchQuery, isLoaded, searchNearbyShops, toast]);

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
  
  const getDirections = (place: PlaceResult) => {
    if (place.url) {
      window.open(place.url, '_blank');
    } else if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  if (!isMounted) return <Skeleton className="h-full w-full" />;

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
        Could not load the map. The Places API requires billing to be enabled on your Google Cloud project. Please ensure you have a valid, unrestricted Google Maps API key and that billing is enabled.
      </div>
    );
  }

  return isLoaded ? (
    <div className="grid grid-cols-1 md:grid-cols-3 h-full w-full">
      <div className="md:col-span-1 h-full flex flex-col">
        <Card className="flex-grow flex flex-col border-0 md:border-r rounded-none">
          <CardHeader>
            <CardTitle className="text-xl">Search Results</CardTitle>
             <div className="flex w-full items-center space-x-2 pt-2">
                <Input 
                    type="text" 
                    placeholder="Search for a location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="bg-background"
                />
                <Button type="button" onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-grow overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 pt-0 space-y-2">
              {places.length > 0 ? places.map((place) => (
                <div 
                    key={place.place_id} 
                    className="p-3 rounded-lg border cursor-pointer hover:bg-muted"
                    onClick={() => handleSelectPlace(place)}
                >
                  <h3 className="font-semibold">{place.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{place.vicinity}</p>
                   {place.rating && (
                    <div className="flex items-center gap-1 mt-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{place.rating} ({place.user_ratings_total} reviews)</span>
                    </div>
                  )}
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-10">No shops found in this area.</p>
              )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2 h-full w-full">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            mapTypeId: "roadmap",
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: true,
          }}
        >
          {places.map((place) => (
            <Marker
              key={place.place_id}
              position={place.geometry?.location}
              onClick={() => handleSelectPlace(place)}
              animation={selectedPlace?.place_id === place.place_id ? window.google.maps.Animation.BOUNCE : undefined}
            />
          ))}

          {selectedPlace && (
            <InfoWindow
              position={selectedPlace.geometry?.location}
              onCloseClick={() => setSelectedPlace(null)}
            >
               <div className="p-1 w-72 space-y-2">
                <h3 className="font-bold text-base">{selectedPlace.name}</h3>
                <p className="text-sm text-muted-foreground flex items-start gap-2"><MapPin className="size-4 mt-0.5 shrink-0" />{selectedPlace.vicinity}</p>
                {selectedPlace.formatted_phone_number && <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="size-4" />{selectedPlace.formatted_phone_number}</p>}
                 {selectedPlace.opening_hours && (
                    <p className="text-sm flex items-center gap-2">
                        <Clock className="size-4"/>
                        <Badge variant={selectedPlace.opening_hours.isOpen ? "secondary" : "destructive"}>
                            {selectedPlace.opening_hours.isOpen ? "Open Now" : "Closed"}
                        </Badge>
                    </p>
                 )}
                 {selectedPlace.rating && (
                    <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{selectedPlace.rating} ({selectedPlace.user_ratings_total} reviews)</span>
                    </div>
                )}
                
                <Button size="sm" className="w-full mt-2" onClick={() => getDirections(selectedPlace)}>
                    <ExternalLink className="mr-2 size-4" />
                    Get Directions
                </Button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  ) : (
    <Skeleton className="h-full w-full" />
  );
}
