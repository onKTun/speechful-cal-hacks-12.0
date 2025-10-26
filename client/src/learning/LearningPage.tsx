import { useEffect, useRef, useState } from "react"

export default function LearningPageDev() {
    const [isRecording, setRecording] = useState(false)
    const [output, setOutput] = useState("")
    const ws = useRef<WebSocket | null>(null)
    const mediaRecorder = useRef<MediaRecorder | null>(null)
    const mediaStream = useRef<MediaStream | null>(null)

    // this function is used to send audio to the backend
    const sendAudioAction = async (event: BlobEvent) => {
        if (event.data.size > 0 && ws.current?.readyState === WebSocket.OPEN) {
            const audioBuffer = await event.data.arrayBuffer();
            //console.log("sending audio data...", audioBuffer.byteLength, "bytes")
            ws.current.send(audioBuffer);
        }
    }

    useEffect(() => {
        const startRecording = async () => {
            try {
                // Create WebSocket connection
                console.debug("creating a websocket connection")
                const socket = new WebSocket("ws://localhost:8080");
                ws.current = socket

                // Wait for WebSocket to open before starting recording
                await new Promise<void>((resolve, reject) => {
                    socket.onopen = () => {
                        console.debug("WebSocket connected")
                        resolve()
                    }
                    socket.onerror = (error) => {
                        console.error("WebSocket error:", error)
                        reject(error)
                    }
                    // Timeout after 5 seconds
                    setTimeout(() => reject(new Error("WebSocket connection timeout")), 5000)
                })

                //when the socket recieves the transcript
                socket.onmessage = (event) => {
                    console.debug("Transcript:", event.data);
                    setOutput(prev => prev + " " + event.data)
                };

                socket.onclose = (event) => {
                    console.log("WebSocket closed:", event.code, event.reason)
                    setRecording(false)
                };

                // Create recording device
                console.debug("starting recording...")
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStream.current = stream

                mediaRecorder.current = new MediaRecorder(stream, {
                    mimeType: "audio/webm;codecs=opus"
                });
                //send audio when there is data available
                mediaRecorder.current.addEventListener("dataavailable", sendAudioAction);

                mediaRecorder.current.onerror = (event) => {
                    console.error("MediaRecorder error:", event)
                    setRecording(false)
                }

                mediaRecorder.current.start(300); // send audio chunks every x milliseconds
            } catch (error) {
                console.error("Failed to start recording:", error)
                setRecording(false)
                // Clean up on error
                stopRecording()
            }
        }

        const stopRecording = () => {
            console.debug("stopping recording...")

            // Remove event listener before stopping
            if (mediaRecorder.current) {
                mediaRecorder.current.removeEventListener("dataavailable", sendAudioAction)
                if (mediaRecorder.current.state !== "inactive") {
                    mediaRecorder.current.stop()
                }
                mediaRecorder.current = null
            }

            // Stop all media stream tracks
            if (mediaStream.current) {
                mediaStream.current.getTracks().forEach(track => track.stop())
                mediaStream.current = null
            }

            // Close WebSocket
            if (ws.current) {
                console.debug("Closing the websocket")
                if (ws.current.readyState === WebSocket.OPEN ||
                    ws.current.readyState === WebSocket.CONNECTING) {
                    ws.current.close()
                }
                ws.current = null
            }
        }

        if (isRecording) {
            startRecording()
        } else {
            stopRecording()
        }

        return () => {
            stopRecording();
        }
    }, [isRecording, sendAudioAction])

    return (
        <div>
            <button onClick={() => { setRecording(!isRecording) }}>
                Recording status: {isRecording + ""}, click to toggle
            </button>
            <div>{output}</div>
        </div>
    )
}