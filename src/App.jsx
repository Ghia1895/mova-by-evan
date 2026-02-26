import React, { useEffect, useRef, useState } from "react";

const APP_STATES = {
  LANDING: "landing",
  RECORDING: "recording",
  PREVIEW: "preview",
  TEMPLATES: "templates",
  RESULT: "result",
};

const TRANSFORM_TEMPLATES = [
  {
    id: "aesthetic",
    name: "Aesthetic Celebrity",
    keywords: ["Soft glow", "Cinematic", "Polished"],
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=260&fit=crop",
  },
  {
    id: "travel",
    name: "Travel Vlog",
    keywords: ["Vibrant", "Warm tones", "Adventure"],
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=260&fit=crop",
  },
  {
    id: "artistic",
    name: "Artistic Touch",
    keywords: ["Oil texture", "Brushstrokes", "Vivid"],
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=260&fit=crop",
  },
];

function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [appState, setAppState] = useState(APP_STATES.LANDING);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isTransforming, setIsTransforming] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function initCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: true,
        });
        if (!isMounted) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        if (isMounted) {
          setHasPermission(false);
        }
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  const startRecording = () => {
    if (!streamRef.current) return;
    if (isRecording) return;

    const mimeTypeCandidates = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];

    let chosenType = "";
    for (const type of mimeTypeCandidates) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(type)) {
        chosenType = type;
        break;
      }
    }

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: chosenType || undefined,
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: chosenType || "video/webm",
        });
        if (recordedUrl) {
          URL.revokeObjectURL(recordedUrl);
        }
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setIsRecording(false);
        setAppState(APP_STATES.PREVIEW);
        setCountdown(0);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setAppState(APP_STATES.RECORDING);
      setCountdown(5);

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            if (
              mediaRecorderRef.current &&
              mediaRecorderRef.current.state === "recording"
            ) {
              mediaRecorderRef.current.stop();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const handleRetake = () => {
    setAppState(APP_STATES.LANDING);
    setSelectedTemplate(null);
    setIsTransforming(false);
    setCountdown(5);
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  };

  const handleGoToTemplates = () => {
    if (!recordedUrl) return;
    setAppState(APP_STATES.TEMPLATES);
  };

  const triggerTransform = (templateId) => {
    setSelectedTemplate(templateId);
    setIsTransforming(true);
    setAppState(APP_STATES.RESULT);

    // Simulate a quick processing effect
    setTimeout(() => {
      setIsTransforming(false);
    }, 1500);
  };

  const handleTemplateSelect = (templateId) => {
    triggerTransform(templateId);
  };

  const handleRegenerate = () => {
    if (!selectedTemplate) return;
    triggerTransform(selectedTemplate);
  };

  const handleCaptureAnother = () => {
    handleRetake();
  };

  const getFilterForTemplate = (templateId) => {
    switch (templateId) {
      case "aesthetic":
        return "contrast(1.2) saturate(1.1) brightness(1.05) blur(0.5px)";
      case "travel":
        return "contrast(1.15) saturate(1.3) brightness(1.08)";
      case "artistic":
        return "contrast(1.3) saturate(1.4) hue-rotate(12deg)";
      default:
        return "none";
    }
  };

  const renderCameraOrPreview = () => {
    const isLiveCamera =
      appState === APP_STATES.LANDING || appState === APP_STATES.RECORDING;

    if (isLiveCamera) {
      if (hasPermission === false) {
        return (
          <div className="camera-error">
            <p>
              We could not access your camera. Please allow camera permissions in
              your browser settings and reload this page.
            </p>
          </div>
        );
      }

      return (
        <div className="camera-wrapper">
          <video
            ref={videoRef}
            className="camera-view"
            autoPlay
            playsInline
            muted
          />
          {isRecording && (
            <div className="recording-indicator">
              <span className="red-dot" />
              <span>Recording</span>
            </div>
          )}
          {isRecording && (
            <div className="countdown-badge">{countdown}s</div>
          )}
        </div>
      );
    }

    if (!recordedUrl) {
      return (
        <div className="camera-error">
          <p>No recording yet. Capture a 5-second video to preview it here.</p>
        </div>
      );
    }

    const isResult = appState === APP_STATES.RESULT && selectedTemplate;
    const isArtisticResult =
      isResult && selectedTemplate === "artistic";

    const filter = isResult && selectedTemplate
      ? getFilterForTemplate(selectedTemplate)
      : "none";

    return (
      <div
        className={`camera-wrapper ${
          isArtisticResult ? "artistic-wrapper" : ""
        }`}
      >
        <video
          key={recordedUrl}
          className={`camera-view ${
            isArtisticResult ? "camera-view-artistic" : ""
          }`}
          src={recordedUrl}
          controls
          playsInline
          loop
          style={{ filter }}
        />
        {isArtisticResult && (
          <div className="artistic-texture-overlay" />
        )}
        {isTransforming && (
          <div className="scan-overlay">
            <div className="scan-line" />
          </div>
        )}
      </div>
    );
  };

  const renderPrimaryAction = () => {
    if (appState === APP_STATES.LANDING || appState === APP_STATES.RECORDING) {
      return (
        <button
          type="button"
          className={`primary-button record-button ${
            isRecording ? "recording" : ""
          }`}
          onClick={startRecording}
          disabled={isRecording || hasPermission === false}
        >
          {isRecording ? "Recording..." : "Record 5 Seconds"}
        </button>
      );
    }

    if (appState === APP_STATES.PREVIEW) {
      return (
        <div className="actions-row">
          <button
            type="button"
            className="primary-button"
            onClick={handleGoToTemplates}
          >
            Transform it!
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={handleRetake}
            aria-label="Retake"
            title="Retake"
          >
            ⟲
          </button>
        </div>
      );
    }

    if (appState === APP_STATES.TEMPLATES) {
      return null;
    }

    if (appState === APP_STATES.RESULT) {
      return (
        <div className="actions-column">
          <button
            type="button"
            className="primary-button"
            onClick={handleRegenerate}
            disabled={!selectedTemplate || isTransforming}
          >
            {isTransforming ? "Regenerating..." : "Regenerate"}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={handleCaptureAnother}
            disabled={isTransforming}
          >
            Capture another
          </button>
        </div>
      );
    }

    return null;
  };

  const renderTemplateSelection = () => {
    if (appState !== APP_STATES.TEMPLATES) return null;

    return (
      <div className="templates-overlay" role="dialog" aria-modal="true" aria-label="Choose transform style">
        <div className="templates-overlay-backdrop" onClick={() => setAppState(APP_STATES.PREVIEW)} aria-hidden="true" />
        <div className="templates-overlay-center">
          <h2 className="templates-overlay-title">Choose your magic</h2>
          <div className="templates-overlay-cards">
            {TRANSFORM_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                className="template-card"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="template-card-image-wrap">
                  <img src={template.image} alt="" className="template-card-image" />
                </div>
                <div className="template-card-label">{template.name}</div>
                <div className="template-card-keywords">
                  {template.keywords.map((kw) => (
                    <span key={kw} className="template-keyword">{kw}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="templates-overlay-cancel"
            onClick={() => setAppState(APP_STATES.PREVIEW)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const renderResultLabel = () => {
    if (appState !== APP_STATES.RESULT || !selectedTemplate) return null;

    const selected = TRANSFORM_TEMPLATES.find(
      (t) => t.id === selectedTemplate
    );

    return (
      <div className="result-header">
        <h2 className="section-title">
          {isTransforming ? "Transforming your clip..." : "Your transformed 5 seconds"}
        </h2>
        {selected && (
          <p className="result-subtitle">
            Style: <span>{selected.name}</span>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="app-root">
      <div className="app-shell">
        <header className="app-header">
          <div className="brand">
            <div className="logo-circle">
              {/* Place your Confluence award logo at public/confluence-award-logo.png */}
              <img
                src="/confluence-award-logo.png"
                alt="Confluence Award"
                className="logo-image"
              />
            </div>
            <div className="brand-text">
              <span className="brand-subtitle">Confluence Award</span>
              <span className="brand-title">5-Second Transformer</span>
            </div>
          </div>
        </header>

        <main className="app-main">
          <section className="hero">
            <h1 className="hero-title">
              Capture and transform your amazing{" "}
              <span className="highlight">5 sec</span>
            </h1>
            <p className="hero-subtitle">
              One tap to record. One tap to glow up your moment.
            </p>
          </section>

          <section className="view-section">
            {renderCameraOrPreview()}
          </section>

          {renderResultLabel()}
          {renderTemplateSelection()}

          <section className="actions-section">{renderPrimaryAction()}</section>
        </main>

        <footer className="app-footer">
          <span className="footer-text">
            Designed for mobile first · Works on modern browsers
          </span>
        </footer>
      </div>
    </div>
  );
}

export default App;

