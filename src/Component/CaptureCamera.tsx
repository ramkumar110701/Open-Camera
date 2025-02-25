import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import "../assets/Style/CaptureCamera.css";

const CameraCapture = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const checkCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); 
      setCameraError(null);
    } catch (error) {
      console.error("Camera error:", error);
      setCameraError("Camera access denied. Enable it in browser settings.");
    }
  };

  const getVideoConstraints = () => {
    return {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: "environment", 
    };
  };

  useEffect(() => {
    checkCameraAccess();
  }, []);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
    }
  };

  const retake = () => {
    setImage(null);
  };

  const saveImage = () => {
    if (image) {
      const file = base64ToFile(image, "captured_image.jpg");
      setImageFile(file);
      setOpen(false);
    }
  };

  const base64ToFile = (base64: string, filename: string) => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleOpenCamera = () => {
    setImage(null);
    setImageFile(null);
    setOpen(true);
    checkCameraAccess(); 
  };

  return (
    <div className="camera-container">
      <input
        type="text"
        placeholder="Captured Image File"
        value={imageFile ? imageFile.name : ""}
        readOnly
        className="camera-input"
      />

      <button onClick={handleOpenCamera} className="camera-button">
        📷 Camera
      </button>

      {open && (
        <div className="camera-popup">
          {cameraError && <p className="error-message">{cameraError}</p>}

          {!image && !cameraError && (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={getVideoConstraints()}
              onUserMediaError={() => setCameraError("Failed to access camera.")}
              playsInline
              className="camera-preview"
            />
          )}

          {image && <img src={image} alt="Captured" className="camera-preview" />}

          <div className="button-group">
            {!image ? (
              <button onClick={capture} className="action-button capture-button">
                Capture
              </button>
            ) : (
              <>
                <button onClick={retake} className="action-button retake-button">
                  Retake
                </button>
                <button onClick={saveImage} className="action-button save-button">
                  Save
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
