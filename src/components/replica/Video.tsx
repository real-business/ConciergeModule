import React, { useEffect, useRef, useState } from "react";
import { useVideoTrack, DailyVideo } from "@daily-co/daily-react";

interface VideoProps {
  id: string;
  style?: React.CSSProperties;
}

const Video: React.FC<VideoProps> = ({ id, style = {} }) => {
  const videoState = useVideoTrack(id);
  const isOff = videoState?.isOff;
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleCanPlay = () => setIsVideoReady(true);
    videoEl.addEventListener("canplay", handleCanPlay);

    return () => {
      videoEl.removeEventListener("canplay", handleCanPlay);
    };
  }, [videoState]);

  return (
    <div
      className="w-full rounded-lg overflow-hidden bg-slate-100 relative transition-all duration-300 mx-auto
                    h-[200px] sm:h-[250px] md:h-[350px] lg:h-[450px] xl:h-[500px]"
      style={style}
    >
      {/* Video */}
      {id && (
        <DailyVideo
          automirror
          sessionId={id}
          type="video"
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: isOff || !isVideoReady ? "none" : "block",
          }}
        />
      )}

      {/* Spinner */}
      {!isVideoReady && !isOff && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-slate-100 z-10">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
        </div>
      )}

      {/* Fallback image when video is off */}
      {isOff && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-slate-100 z-5">
          <svg
            className="h-1/2 w-auto"
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
              <path
                d="M18.571,4 C19.142,4 19.557,4.23 19.815,4.689 C20.073,5.148 20.073,5.622 19.815,6.111 L16,12 L19.815,17.889 C20.073,18.377 20.073,18.852 19.815,19.311 C19.557,19.77 19.142,20 18.571,20 L5.429,20 C4.857,20 4.443,19.77 4.185,19.311 C3.927,18.852 3.927,18.377 4.185,17.889 L8,12 L4.185,6.111 C3.927,5.622 3.927,5.148 4.185,4.689 C4.443,4.23 4.857,4 5.429,4 L18.571,4 Z"
                fill="#555555"
              ></path>
              <line
                x1="4"
                y1="4"
                x2="20"
                y2="20"
                stroke="#E92A09"
                strokeWidth="2.5"
                strokeLinecap="round"
              ></line>
            </g>
          </svg>
        </div>
      )}
    </div>
  );
};

export default Video;
