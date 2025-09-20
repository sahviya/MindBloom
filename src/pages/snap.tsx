import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const filters = [
  { id: "none", name: "Original", style: "" },
  { id: "grayscale", name: "B&W", style: "filter: grayscale(100%)" },
  { id: "sepia", name: "Vintage", style: "filter: sepia(100%)" },
  { id: "warm", name: "Warm", style: "filter: saturate(1.2) hue-rotate(15deg)" },
  { id: "cool", name: "Cool", style: "filter: saturate(1.1) hue-rotate(-15deg)" },
  { id: "bright", name: "Bright", style: "filter: brightness(1.3) contrast(1.1)" },
  { id: "magical", name: "Magical", style: "filter: saturate(1.4) hue-rotate(30deg) brightness(1.1)" },
];

function prettyCameraError(err: any): string {
  const name = err?.name || "Error";
  switch (name) {
    case "NotAllowedError":
      return "Permission denied. Click the camera icon in the address bar to allow access.";
    case "NotFoundError":
      return "No camera found. Connect a webcam or try a different device.";
    case "NotReadableError":
      return "Camera is in use by another app. Close it and retry.";
    case "OverconstrainedError":
      return "Camera constraints not supported. Retrying with defaults.";
    case "SecurityError":
      return "Camera blocked by browser security settings. Use http://localhost and allow access.";
    default:
      return err?.message || String(err);
  }
}

export default function Snap() {
  const [isCamera, setIsCamera] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const shareToCommunityMutation = useMutation({
    mutationFn: async (data: { content: string; imageBase64: string }) => {
      const response = await apiRequest("POST", "/api/community/posts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({ title: "Success!", description: "Your snap has been shared with the community! ✨" });
      setCapturedImage(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to share your snap. Please try again.", variant: "destructive" });
    },
  });

  const ensureVideoReady = (video: HTMLVideoElement) => {
    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      setCameraReady(true);
      setCameraError(null);
      return true;
    }
    return false;
  };

  const listVideoDevices = async () => {
    try {
      const ds = await navigator.mediaDevices.enumerateDevices();
      const vids = ds.filter(d => d.kind === "videoinput");
      setDevices(vids);
      if (!selectedDeviceId && vids.length > 0) setSelectedDeviceId(vids[0].deviceId);
    } catch {}
  };

  const attachStream = (mediaStream: MediaStream) => {
    const v = videoRef.current;
    if (!v) {
      mediaStream.getTracks().forEach(t => t.stop());
      return;
    }

    setStream(mediaStream);
    v.srcObject = mediaStream;
    v.muted = true;
    v.setAttribute("playsinline", "true");

    const markReadyIfPossible = () => {
      if (v && ensureVideoReady(v)) {
        return true;
      }
      return false;
    };

    const startPollingReady = () => {
      const start = Date.now();
      const timer = window.setInterval(() => {
        if (markReadyIfPossible()) {
          window.clearInterval(timer);
          return;
        }
        if (Date.now() - start > 4000) {
          window.clearInterval(timer);
          setCameraError("Camera is taking too long to initialize. Check permissions and try again.");
        }
      }, 150);
    };

    const onCanPlay = () => {
      if (markReadyIfPossible()) {
        v.play().catch(() => {});
        v.removeEventListener("loadeddata", onCanPlay);
        v.removeEventListener("canplay", onCanPlay);
      }
    };

    v.addEventListener("loadeddata", onCanPlay);
    v.addEventListener("canplay", onCanPlay);

    Promise.resolve(v.play()).catch(() => {});
    startPollingReady();
  };

  const tryEnumeratedDevices = async () => {
    await listVideoDevices();
    for (const dev of devices) {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: dev.deviceId } }, audio: false });
        attachStream(s);
        setSelectedDeviceId(dev.deviceId);
        return true;
      } catch {}
    }
    return false;
  };

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera not supported in this browser.");
      toast({ title: "Unsupported", description: "Camera is not supported in this browser.", variant: "destructive" });
      return;
    }

    setCameraReady(false);
    setCameraError(null);

    try {
      await listVideoDevices();
      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      attachStream(mediaStream);
    } catch (err: any) {
      try {
        const fallback = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        attachStream(fallback);
      } catch (err2: any) {
        try {
          const ok = await tryEnumeratedDevices();
          if (!ok) throw err2;
        } catch (err3: any) {
          const message = prettyCameraError(err3);
          setCameraError(message);
          toast({ title: "Camera Error", description: message, variant: "destructive" });
        }
      }
    }
  }, [selectedDeviceId, toast, devices.length]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    const v = videoRef.current;
    if (v) v.srcObject = null;
    setCameraReady(false);
  }, [stream]);

  const resetCamera = async () => {
    stopCamera();
    await startCamera();
  };

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current as HTMLVideoElement;
      const context = canvas.getContext("2d");
      
      const performCapture = () => {
        if (!context) return false;
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0);
          const imageData = canvas.toDataURL("image/jpeg", 0.6);
          setCapturedImage(imageData);
          stopCamera();
          return true;
        }
        return false;
      };

      if (!performCapture()) {
        video.play().catch(() => {});
        setTimeout(() => {
          if (!performCapture()) {
            toast({ title: "Camera Error", description: "Unable to capture photo. Please ensure camera is ready.", variant: "destructive" });
          }
        }, 200);
      }
    } else {
      toast({ title: "Camera Error", description: "Camera not initialized. Click Enable camera then try again.", variant: "destructive" });
    }
  }, [stopCamera, toast]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 800;
          const maxHeight = 600;
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedImage = canvas.toDataURL('image/jpeg', 0.6);
          setCapturedImage(compressedImage);
          setIsCamera(false);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const shareToCommunity = useCallback(() => {
    if (capturedImage) {
      const content = "Check out my snap! ✨📸";
      shareToCommunityMutation.mutate({ content, imageBase64: capturedImage });
    }
  }, [capturedImage, shareToCommunityMutation]);

  useEffect(() => {
    if (isCamera) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => { stopCamera(); };
  }, [isCamera, startCamera, stopCamera]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && isCamera && !cameraReady && !stream) {
        startCamera();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [cameraReady, isCamera, startCamera, stream]);

  const currentFilter = filters.find(f => f.id === selectedFilter);

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 genie-gradient bg-clip-text text-transparent">Snap ✨📸</h1>
        <p className="text-muted-foreground text-lg">Capture magical moments and share them with your wellness community</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant={isCamera ? "default" : "outline"} onClick={() => setIsCamera(true)} className={isCamera ? "genie-gradient" : ""} data-testid="camera-mode">
            <i className="fas fa-camera mr-2"></i>Camera
          </Button>
          <Button variant={!isCamera ? "default" : "outline"} onClick={() => { setIsCamera(false); fileInputRef.current?.click(); }} className={!isCamera ? "genie-gradient" : ""} data-testid="gallery-mode">
            <i className="fas fa-images mr-2"></i>Gallery
          </Button>
          {devices.length > 0 && (
            <select
              value={selectedDeviceId || ''}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="border rounded px-2 py-1 text-sm bg-background"
            >
              {devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</option>
              ))}
            </select>
          )}
          <Button variant="outline" size="sm" onClick={resetCamera}>Reset camera</Button>
        </div>

        <Card className="magical-border">
          <CardContent className="p-6">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {isCamera && !capturedImage && (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ ...(currentFilter && currentFilter.style ? { filter: currentFilter.style.split(': ')[1] } : {}) }} />
              )}
              {capturedImage && (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" style={{ filter: currentFilter && currentFilter.style && currentFilter.id !== 'none' ? currentFilter.style.split(': ')[1] : 'none' }} />
              )}
              {!isCamera && !capturedImage && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center"><i className="fas fa-image text-4xl mb-4"></i><p>Select an image from your gallery</p></div>
                </div>
              )}
            </div>

            {isCamera && !capturedImage && (
              <div className="flex flex-col items-center gap-3 mt-4">
                <Button size="lg" onClick={capturePhoto} disabled={!cameraReady} className={`w-16 h-16 rounded-full ${cameraReady ? "genie-gradient" : "bg-muted"}`} data-testid="capture-photo">
                  {cameraReady ? (<i className="fas fa-camera text-xl"></i>) : (<i className="fas fa-spinner fa-spin text-xl"></i>)}
                </Button>
                {!cameraReady && (
                  <div className="text-xs text-muted-foreground text-center">
                    {cameraError ? (
                      <>
                        <p>{cameraError}</p>
                        <Button variant="outline" size="sm" onClick={startCamera} className="mt-2">Enable camera</Button>
                      </>
                    ) : (
                      <p>Waiting for camera… If it takes too long, click Enable or Reset.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><i className="fas fa-magic mr-2"></i>Magical Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {filters.map((filter) => (
                <Button key={filter.id} variant={selectedFilter === filter.id ? "default" : "outline"} size="sm" onClick={() => setSelectedFilter(filter.id)} className={`${selectedFilter === filter.id ? "genie-gradient" : ""} text-xs`} data-testid={`filter-${filter.id}`}>
                  {filter.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {capturedImage && (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => { setCapturedImage(null); if (isCamera) { startCamera(); } }} data-testid="retake-photo">
                  <i className="fas fa-redo mr-2"></i>Retake
                </Button>
                <Button onClick={shareToCommunity} disabled={shareToCommunityMutation.isPending} className="genie-gradient" data-testid="share-to-community">
                  {shareToCommunityMutation.isPending ? (<><i className="fas fa-spinner fa-spin mr-2"></i>Sharing...</>) : (<><i className="fas fa-share mr-2"></i>Share to Community</>)}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <i className="fas fa-lightbulb text-yellow-500 mt-1"></i>
              <div>
                <h4 className="font-medium mb-2">✨ Snap Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Try different filters to enhance your wellness moments</li>
                  <li>• Share positive vibes and supportive content with the community</li>
                  <li>• Capture your progress, achievements, or inspiring quotes</li>
                  <li>• Use natural lighting for the best photo quality</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}