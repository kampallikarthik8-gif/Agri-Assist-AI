
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
import { Trash2, Leaf, BrainCircuit, Loader2, Droplets, Bug, Wind, CloudRain, FlaskConical } from "lucide-react";
import { soilHealthAnalyzer, SoilHealthAnalyzerOutput } from "@/ai/flows/soil-health-analyzer";
import { cropRecommendationEngine, CropRecommendationEngineOutput } from "@/ai/flows/crop-recommendation-engine";
import { smartIrrigationPlanner, SmartIrrigationPlannerOutput } from "@/ai/flows/smart-irrigation-planner";
import { pestDiseaseAlert, PestDiseaseAlertOutput } from "@/ai/flows/pest-disease-alert";
import { pestSprayingAdvisor, PestSprayingAdvisorOutput } from "@/ai/flows/pest-spraying-advisor";
import { rainfallAlert, RainfallAlertOutput } from "@/ai/flows/rainfall-alert";
import { fertilizerCalculator, FertilizerCalculatorOutput } from "@/ai/flows/fertilizer-calculator";

import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

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

type AnalysisResult = 
    | SoilHealthAnalyzerOutput 
    | CropRecommendationEngineOutput 
    | SmartIrrigationPlannerOutput 
    | PestDiseaseAlertOutput 
    | PestSprayingAdvisorOutput
    | RainfallAlertOutput
    | FertilizerCalculatorOutput
    | { error: string };


const LOCAL_STORAGE_KEY = 'farm_map_fields';

const getCenterOfPolygon = (path: google.maps.LatLngLiteral[]) => {
    const bounds = new google.maps.LatLngBounds();
    path.forEach(p => bounds.extend(p));
    const center = bounds.getCenter();
    return { lat: center.lat(), lng: center.lng() };
};

export function FarmMap() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [drawnShapes, setDrawnShapes] = useState<DrawnShape[]>([]);
  const [activeInfoWindow, setActiveInfoWindow] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisTitle, setAnalysisTitle] = useState("");
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogInput, setDialogInput] = useState<{type: 'irrigation' | 'fertilizer', crop: string, soilData?: SoilHealthAnalyzerOutput['report']}>({ type: 'irrigation', crop: ''});
  const [currentShapeForAnalysis, setCurrentShapeForAnalysis] = useState<DrawnShape | null>(null);

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
          try {
            const shapesFromStorage = JSON.parse(savedShapes);
            if (Array.isArray(shapesFromStorage)) {
                 const shapes = shapesFromStorage.map((shape: any) => {
                    const center = shape.center || getCenterOfPolygon(shape.path);
                    return {
                        ...shape,
                        center,
                        infoWindowPos: new google.maps.LatLng(center.lat, center.lng),
                    };
                });
                setDrawnShapes(shapes);
            }
          } catch (e) {
              console.error("Failed to parse shapes from local storage", e);
              setDrawnShapes([]);
          }
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

  const handleAnalysis = async (shape: DrawnShape, analysisType: 'soil' | 'crop' | 'irrigation' | 'pest' | 'spraying' | 'rainfall' | 'fertilizer') => {
    setIsAnalysisLoading(true);
    setAnalysisResult(null);
    setCurrentShapeForAnalysis(shape);

    if (!shape.center || typeof shape.center.lat !== 'number' || typeof shape.center.lon !== 'number') {
        toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: "Could not determine the center of the selected field. Please try redrawing it.",
        });
        setIsAnalysisLoading(false);
        return;
    }
    const locationStr = `Field at ${shape.center.lat.toFixed(4)}, ${shape.center.lon.toFixed(4)}`;


    if (analysisType === 'irrigation') {
        setDialogInput({ type: 'irrigation', crop: '' });
        setAnalysisTitle("Smart Irrigation Planner");
        setIsAnalysisLoading(false);
        setIsDialogOpen(true);
        return;
    }
     if (analysisType === 'fertilizer') {
        setIsAnalysisLoading(true);
        setAnalysisTitle("Fertilizer Calculator");
        setIsDialogOpen(true);
        try {
            const soilData = await soilHealthAnalyzer({ location: locationStr, lat: shape.center.lat, lon: shape.center.lon });
            setDialogInput({ type: 'fertilizer', crop: '', soilData: soilData.report });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Soil Analysis Failed", description: "Could not get soil data needed for fertilizer calculation." });
            setAnalysisResult({ error: "Could not get soil data needed for fertilizer calculation. Please try analyzing soil health first." });
        } finally {
            setIsAnalysisLoading(false);
        }
        return;
    }

    setIsDialogOpen(true);
    try {
        let result: AnalysisResult | null = null;
        if (analysisType === 'soil') {
            setAnalysisTitle("Soil Health Analysis");
            result = await soilHealthAnalyzer({ location: locationStr, lat: shape.center.lat, lon: shape.center.lon });
        } else if (analysisType === 'crop') {
            setAnalysisTitle("Crop Recommendation");
            result = await cropRecommendationEngine({ location: locationStr, lat: shape.center.lat, lon: shape.center.lon });
        } else if (analysisType === 'pest') {
            setAnalysisTitle("Pest & Disease Alerts");
            result = await pestDiseaseAlert({ location: locationStr });
        } else if (analysisType === 'spraying') {
            setAnalysisTitle("Pest Spraying Advisor");
            result = await pestSprayingAdvisor({ location: locationStr });
        } else if (analysisType === 'rainfall') {
            setAnalysisTitle("Rainfall Alert");
            result = await rainfallAlert({ location: locationStr });
        }
        setAnalysisResult(result);
    } catch (error: any) {
      console.error(error);
      toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: error.message || "Could not retrieve AI analysis for this field.",
      });
      setAnalysisResult({ error: error.message || "An unknown error occurred." });
    } finally {
        setIsAnalysisLoading(false);
    }
  }

  const handleDialogSubmit = async () => {
      if (!dialogInput.crop || !currentShapeForAnalysis) return;
      setIsAnalysisLoading(true);
      setAnalysisResult(null);
      const locationStr = `Field at ${currentShapeForAnalysis.center.lat.toFixed(4)}, ${currentShapeForAnalysis.center.lon.toFixed(4)}`;
      try {
          let result: AnalysisResult | null = null;
          if (dialogInput.type === 'irrigation') {
            result = await smartIrrigationPlanner({ location: locationStr, cropType: dialogInput.crop });
          } else if (dialogInput.type === 'fertilizer' && dialogInput.soilData) {
            const areaInAcres = currentShapeForAnalysis.area * 0.000247105;
            result = await fertilizerCalculator({
                cropType: dialogInput.crop,
                soilNitrogen: parseFloat(dialogInput.soilData.nitrogen),
                soilPhosphorus: parseFloat(dialogInput.soilData.phosphorus),
                soilPotassium: parseFloat(dialogInput.soilData.potassium),
                farmArea: areaInAcres,
                areaUnit: 'acres'
            });
          }
          setAnalysisResult(result);
      } catch (error: any) {
          console.error(error);
          toast({
              variant: "destructive",
              title: "Analysis Failed",
              description: error.message || "Could not retrieve AI analysis for this field.",
          });
          setAnalysisResult({ error: error.message || "An unknown error occurred." });
      } finally {
          setIsAnalysisLoading(false);
          setDialogInput({ type: dialogInput.type, crop: '' }); // Clear input but keep type
      }
  }

  const closeDialog = () => {
      setIsDialogOpen(false);
      setAnalysisResult(null);
      setDialogInput({ type: 'irrigation', crop: '' });
      setCurrentShapeForAnalysis(null);
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
        Could not load the map. Please ensure you have a valid Google Maps API key and that it is correctly configured in the Google Cloud Console.
      </div>
    );
  }

  const renderAnalysisContent = () => {
    if (!analysisResult) return null;
    if ('error' in analysisResult) {
        return <p className="text-destructive">{analysisResult.error}</p>;
    }
    if ("report" in analysisResult) { // SoilHealthAnalyzerOutput
        return (
            <div className="space-y-2">
                <p><strong>Organic Matter:</strong> {analysisResult.report.organicMatter}</p>
                <p><strong>Nitrogen:</strong> {analysisResult.report.nitrogen}</p>
                <p><strong>Phosphorus:</strong> {analysisResult.report.phosphorus}</p>
                <p><strong>Potassium:</strong> {analysisResult.report.potassium}</p>
                <p><strong>pH:</strong> {analysisResult.report.ph}</p>
                <p><strong>Moisture:</strong> {analysisResult.report.moisture}</p>
                <p className="pt-2 border-t mt-2"><strong>Summary:</strong> {analysisResult.summary}</p>
            </div>
        );
    }
    if ("recommendedCrops" in analysisResult) { // CropRecommendationEngineOutput
        return (
            <div className="space-y-2">
                <p><strong>Recommended Crops:</strong> {analysisResult.recommendedCrops.join(', ')}</p>
                <p className="pt-2 border-t mt-2"><strong>Rationale:</strong> {analysisResult.rationale}</p>
            </div>
        );
    }
    if ("irrigationPlan" in analysisResult) { // SmartIrrigationPlannerOutput
        return (
            <div className="space-y-2">
                <p className="whitespace-pre-line">{analysisResult.irrigationPlan}</p>
            </div>
        );
    }
    if ("alerts" in analysisResult && !("recommendation" in analysisResult)) { // PestDiseaseAlertOutput or RainfallAlertOutput
        return (
            <div className="space-y-2">
                {analysisResult.alerts.length > 0 ? analysisResult.alerts.map((alert, index) => (
                    <div key={index} className="border-l-4 pl-3 py-1" style={{ borderColor: alert.severity === 'High' ? 'red' : alert.severity === 'Medium' ? 'orange' : 'blue' }}>
                        <p><strong>{alert.title || alert.name}</strong> - <Badge variant={alert.severity === 'High' ? "destructive" : "secondary"}>{alert.severity} Risk</Badge></p>
                         {alert.message && <p className="text-sm text-muted-foreground">{alert.message}</p>}
                    </div>
                )) : <p>No immediate threats or alerts detected for this location.</p>}
            </div>
        );
    }
    if ("recommendation" in analysisResult && "windSpeed" in analysisResult) { // PestSprayingAdvisorOutput
        return (
            <div className="space-y-3">
                <p><strong>Recommendation:</strong> <Badge variant={analysisResult.recommendation === 'Good' ? 'default' : analysisResult.recommendation === 'Caution' ? 'secondary' : 'destructive'}>{analysisResult.recommendation}</Badge></p>
                <p><strong>Wind Speed:</strong> {analysisResult.windSpeed} mph</p>
                <p><strong>Chance of Rain:</strong> {analysisResult.chanceOfRain}</p>
                <p className="pt-2 border-t mt-2"><strong>Rationale:</strong> {analysisResult.rationale}</p>
            </div>
        )
    }
     if ("fertilizerAmounts" in analysisResult) { // FertilizerCalculatorOutput
        return (
            <div className="space-y-3">
                <p><strong>Nitrogen:</strong> {analysisResult.fertilizerAmounts.nitrogen.toFixed(2)} kg</p>
                <p><strong>Phosphorus:</strong> {analysisResult.fertilizerAmounts.phosphorus.toFixed(2)} kg</p>
                <p><strong>Potassium:</strong> {analysisResult.fertilizerAmounts.potassium.toFixed(2)} kg</p>
                <p className="pt-2 border-t mt-2"><strong>Recommendation:</strong> {analysisResult.recommendation}</p>
            </div>
        );
    }
    return null;
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
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                           <Button size="sm" className="w-full" onClick={() => handleAnalysis(activeShape, 'soil')}>
                             <Leaf className="mr-2 size-4"/> Analyze Soil
                           </Button>
                           <Button size="sm" className="w-full" onClick={() => handleAnalysis(activeShape, 'crop')}>
                            <BrainCircuit className="mr-2 size-4"/> Get Crop Recs
                           </Button>
                           <Button size="sm" className="w-full" onClick={() => handleAnalysis(activeShape, 'fertilizer')}>
                            <FlaskConical className="mr-2 size-4"/> Calc Fertilizer
                           </Button>
                           <Button size="sm" className="w-full" onClick={() => handleAnalysis(activeShape, 'irrigation')}>
                                <Droplets className="mr-2 size-4"/> Plan Irrigation
                           </Button>
                           <Button size="sm" className="w-full" onClick={() => handleAnalysis(activeShape, 'pest')}>
                                <Bug className="mr-2 size-4"/> Check Pests
                           </Button>
                           <Button size="sm" className="w-full" onClick={() => handleAnalysis(activeShape, 'spraying')}>
                                <Wind className="mr-2 size-4"/> Spraying Advisor
                           </Button>
                           <Button size="sm" className="w-full" onClick={() => handleAnalysis(activeShape, 'rainfall')}>
                                <CloudRain className="mr-2 size-4"/> Rainfall Alerts
                           </Button>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteShape(activeShape.id)}
                            className="w-full mt-2"
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

      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
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
            ) : analysisResult ? (
                renderAnalysisContent()
            ) : (
                <div className="space-y-4">
                     {dialogInput.type === 'fertilizer' && !dialogInput.soilData && (
                        <div className="flex justify-center items-center h-24">
                            <Loader2 className="size-8 animate-spin text-primary" />
                            <p className="ml-4">Fetching soil data...</p>
                        </div>
                    )}
                    <p>Enter the crop you are growing to get a customized {dialogInput.type} plan.</p>
                    <Input 
                        placeholder="e.g., Rice, Wheat, Corn"
                        value={dialogInput.crop}
                        onChange={(e) => setDialogInput(prev => ({ ...prev, crop: e.target.value }))}
                    />
                    <Button className="w-full" onClick={handleDialogSubmit} disabled={!dialogInput.crop || (dialogInput.type === 'fertilizer' && !dialogInput.soilData)}>
                        Generate Plan
                    </Button>
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  ) : (
    <Skeleton className="h-full w-full rounded-lg" />
  );
}
