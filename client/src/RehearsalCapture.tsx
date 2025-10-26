import React from 'react';
import Webcam from 'react-webcam';
import { useTheme } from './ThemeContext';

interface RehearsalCaptureProps {
    isStarted: boolean;
    isHovered?: boolean;
    webcamRef?: React.RefObject<Webcam | null>;
}

// THE BORDER/EMOJIS WILL BE SOLELY DETERMINED BY THE VARIABLE "sentiment". THIS IS A SINGULAR VALUE <=4 BAD 5-6 NEUTRAL 7=+ GOOD
const RehearsalCapture = ({ isStarted, isHovered = false, webcamRef: externalWebcamRef }: RehearsalCaptureProps) => {
    const { isDark } = useTheme();
    const internalWebcamRef = React.useRef<Webcam>(null);
    const webcamRef = externalWebcamRef || internalWebcamRef;
    const [videoURL] = React.useState("");

    return (
        <>
            {/* Webcam - Full Screen */}
            {(isStarted || isHovered) && (
                <div className={`absolute inset-0 transition-opacity duration-500 ${isStarted ? "opacity-100 z-10" : "opacity-0 -z-10"}`}>
                    {videoURL ? (
                        <video 
                            controls 
                            src={videoURL}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Webcam
                            audio={true}
                            ref={webcamRef}
                            screenshotFormat="image/webp"
                            muted
                            className="w-full h-full object-cover"
                            videoConstraints={{
                                facingMode: "user",
                            }}
                        />
                    )}
                </div>
            )}

            {/* Pastel Overlay when not started */}
            {!isStarted && (
                <div
                    className={`absolute inset-0 transition-opacity duration-500 ${
                        isDark ? "bg-slate-900" : "bg-pink-50"
                    }`}
                >
                    {/* Decorative Blobs */}
                    <div
                        className={`absolute top-[10%] right-[15%] w-96 h-96 md:w-[500px] md:h-[500px] ${
                            isDark ? "bg-pink-400/20" : "bg-pink-300/40"
                        } rounded-full blur-3xl`}
                    ></div>
                    <div
                        className={`absolute bottom-[10%] left-[10%] w-[500px] h-[500px] md:w-[600px] md:h-[600px] ${
                            isDark ? "bg-purple-400/25" : "bg-purple-300/50"
                        } rounded-full blur-3xl`}
                    ></div>
                    <div
                        className={`absolute top-[40%] left-[50%] w-80 h-80 md:w-[400px] md:h-[400px] ${
                            isDark ? "bg-blue-400/20" : "bg-blue-300/40"
                        } rounded-full blur-3xl`}
                    ></div>
                </div>
            )}
        </>
    )
}

export default RehearsalCapture

