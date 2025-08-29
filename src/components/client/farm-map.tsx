
"use client";

import { useState, useCallback, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  DrawingManager,
  Polygon,
  InfoWindow,
} from "@react-google-maps/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2, Leaf, BrainCircuit, Loader2 } from "lucide-react";
import { soilHealthAnalyzer, SoilHealthAnalyzerOutput } from "@/ai/flows/soil-health-analyzer";
import { cropRecommendationEngine, CropRecommendationEngineOutput } from "@/ai/flows/crop-recommendation-engine";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
};

const defaultCenter = {
  lat: 28.6139, // Default to Delhi, India
  lng: 77.2090,
};

const libraries: ("drawing" | "geometry" | "places")[] = ["drawing", "geometry", "places"];

type DrawnShape = {
    id: number;
    type: 'polygon' | 'rectangle';
    path: google.maps.LatLngLiteral[];
    area: number; // in square meters
    infoWindowPos: google.maps.LatLng;
    center: google.maps.LatLngLiteral;
};

const LOCAL_STORAGE_KEY = 'farm_map_fields';

export function FarmMap() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [drawnShapes, setDrawnShapes] = useState<DrawnShape[]>([]);
  const [activeInfoWindow, setActiveInfoWindow] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SoilHealthAnalyzerOutput | CropRecommendationEngineOutput | null>(null);
  const [analysisTitle, setAnalysisTitle] = useState("");
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const savedShapes = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedShapes) {
          const shapes = JSON.parse(savedShapes).map((shape: any) => ({
              ...shape,
              infoWindowPos: new google.maps.LatLng(shape.infoWindowPos.lat, shape.infoWindowPos.lng),
          }));
          setDrawnShapes(shapes);
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
       const shapesToSave = drawnShapes.map(shape => ({
            ...shape,
            infoWindowPos: { lat: shape.infoWindowPos.lat(), lng: shape.infoWindowPos.lng() },
        }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(shapesToSave));
    }
  }, [drawnShapes, isMounted]);

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
  
  const onOverlayComplete = (overlay: google.maps.Polygon | google.maps.Rectangle) => {
      let path: google.maps.LatLngLiteral[];
      let type: 'polygon' | 'rectangle';

      if (!overlay.setMap) return;

      if (overlay instanceof google.maps.Polygon) {
        path = overlay.getPath().getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
        type = 'polygon';
      } else if (overlay instanceof google.maps.Rectangle) {
        const bounds = overlay.getBounds()!;
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        path = [
            { lat: ne.lat(), lng: sw.lng() },
            { lat: ne.lat(), lng: ne.lng() },
            { lat: sw.lat(), lng: ne.lng() },
            { lat: sw.lat(), lng: sw.lng() }
        ];
        type = 'rectangle';
      } else {
        return;
      }

      const areaInMeters = google.maps.geometry.spherical.computeArea(path);
      const centerOfPolygon = getCenterOfPolygon(path);
      
      const newShape: DrawnShape = {
          id: Date.now(),
          type,
          path,
          area: areaInMeters,
          infoWindowPos: new google.maps.LatLng(centerOfPolygon.lat, centerOfPolygon.lng),
          center: centerOfPolygon,
      };

      setDrawnShapes(prev => [...prev, newShape]);
      overlay.setMap(null); 
  };

  const getCenterOfPolygon = (path: google.maps.LatLngLiteral[]) => {
      const bounds = new google.maps.LatLngBounds();
      path.forEach(p => bounds.extend(p));
      const center = bounds.getCenter();
      return { lat: center.lat(), lng: center.lng() };
  };

  const clearAllDrawings = () => {
    setDrawnShapes([]);
    setActiveInfoWindow(null);
  };
  
  const deleteShape = (shapeId: number) => {
    setDrawnShapes(prev => prev.filter(shape => shape.id !== shapeId));
    setActiveInfoWindow(null);
  };

  const handlePolygonClick = (shapeId: number) => {
    setActiveInfoWindow(shapeId);
  }

  const handleAnalysis = async (shape: DrawnShape, analysisType: 'soil' | 'crop') => {
    setIsAnalysisLoading(true);
    setAnalysisResult(null);
    setIsDialogOpen(true);
    setActiveInfoWindow(null);

    try {
        if (analysisType === 'soil') {
            setAnalysisTitle("Soil Health Analysis");
            const result = await soilHealthAnalyzer({ location: `Field at ${shape.center.lat.toFixed(4)}, ${shape.center.lon.toFixed(4)}`, lat: shape.center.lat, lon: shape.center.lon });
            setAnalysisResult(result);
        } else {
            setAnalysisTitle("Crop Recommendation");
            const result = await cropRecommendationEngine({ location: `Field at ${shape.center.lat.toFixed(4)}, ${shape.center.lon.toFixed(4)}`, lat: shape.center.lat, lon: shape.center.lon });
            setAnalysisResult(result);
        }
    } catch (error: any) {
      console.error(error);
      toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: error.message || "Could not retrieve AI analysis for this field.",
      });
      setIsDialogOpen(false);
    } finally {
        setIsAnalysisLoading(false);
    }
  }

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
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeId: "satellite",
          streetViewControl: false,
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
          },
          fullscreenControl: false,
        }}
      >
        <DrawingManager
          onPolygonComplete={onOverlayComplete}
          onRectangleComplete={onOverlayComplete as any}
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
              editable: false,
              zIndex: 1,
            },
            rectangleOptions: {
                fillColor: "hsl(var(--primary) / 0.3)",
                strokeColor: "hsl(var(--primary))",
                strokeWeight: 2,
                editable: false,
                zIndex: 1,
            }
          }}
        />

        {drawnShapes.map((shape) => (
            <Polygon
                key={shape.id}
                paths={shape.path}
                onClick={() => handlePolygonClick(shape.id)}
                options={{
                    fillColor: "hsl(var(--primary) / 0.3)",
                    strokeColor: "hsl(var(--primary))",
                    strokeWeight: 2,
                }}
            />
        ))}

        {activeInfoWindow !== null && drawnShapes.find(s => s.id === activeInfoWindow) && (() => {
            const activeShape = drawnShapes.find(s => s.id === activeInfoWindow)!;
            const areaInAcres = activeShape.area * 0.000247105;
            return (
                <InfoWindow
                    position={activeShape.infoWindowPos}
                    onCloseClick={() => setActiveInfoWindow(null)}
                >
                    <div className="p-2 text-foreground space-y-2 w-48">
                        <div>
                            <h4 className="font-bold text-base">Field Area</h4>
                            <p>{areaInAcres.toFixed(3)} acres</p>
                            <p>{activeShape.area.toFixed(2)} square meters</p>
                        </div>
                        <div className="space-y-2">
                           <Button size="sm" className="w-full" onClick={() => handleAnalysis(activeShape, 'soil')}>
                             <Leaf className="mr-2 size-4"/> Analyze Soil
                           </Button>
                           <Button size="sm" className="w-full" onClick={() => handleAnalysis(activeShape, 'crop')}>
                            <BrainCircuit className="mr-2 size-4"/> Get Crop Recs
                           </Button>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteShape(activeShape.id)}
                            className="w-full"
                        >
                            <Trash2 className="mr-2 size-4" />
                            Delete Field
                        </Button>
                    </div>
                </InfoWindow>
            );
        })()}
      </GoogleMap>
      {drawnShapes.length > 0 && (
        <Button
          variant="destructive"
          size="icon"
          onClick={clearAllDrawings}
          className="absolute bottom-4 right-4 z-10"
          title="Clear all drawings"
        >
          <Trash2 className="size-5" />
        </Button>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{analysisTitle}</DialogTitle>
            <DialogDescription>AI-powered analysis for the selected field.</DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {isAnalysisLoading ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : analysisResult && "report" in analysisResult ? (
              <div className="space-y-2">
                <p><strong>Organic Matter:</strong> {analysisResult.report.organicMatter}</p>
                <p><strong>Nitrogen:</strong> {analysisResult.report.nitrogen}</p>
                <p><strong>Phosphorus:</strong> {analysisResult.report.phosphorus}</p>
                <p><strong>Potassium:</strong> {analysisResult.report.potassium}</p>
                <p><strong>pH:</strong> {analysisResult.report.ph}</p>
                <p><strong>Moisture:</strong> {analysisResult.report.moisture}</p>
                <p className="pt-2 border-t mt-2"><strong>Summary:</strong> {analysisResult.summary}</p>
              </div>
            ) : analysisResult && "recommendedCrops" in analysisResult ? (
              <div className="space-y-2">
                <p><strong>Recommended Crops:</strong> {analysisResult.recommendedCrops.join(', ')}</p>
                <p className="pt-2 border-t mt-2"><strong>Rationale:</strong> {analysisResult.rationale}</p>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  ) : (
    <Skeleton className="h-full w-full rounded-lg" />
  );
}
