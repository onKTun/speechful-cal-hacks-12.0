import { useEffect, useRef, useState } from "react"
export default function LearningPageDev() {
    const [isRecording, setRecording] = useState(false)
    const [output, setOutput] = useState("")
    const ws = useRef<WebSocket | null>(null)
    const mediaRecorder = useRef<MediaRecorder | null>(null)

    const eventAction = async (event: any) => {
        if (event.data.size > 0 && ws.current?.readyState === WebSocket.OPEN) {
            const audioBuffer = await event.data.arrayBuffer();
            console.log("sending audio data...")
            ws.current.send(audioBuffer);
        }
    }

    useEffect(() => {

        const startRecording = async () => {
            //create websocket connection
            console.debug("creating a websocket connection")
            const socket = new WebSocket("ws://localhost:8080");
            ws.current = socket

            socket.onmessage = (event) => {
                console.debug("Transcript:", event.data);
                setOutput(prev => prev + " " + event.data)
            };

            socket.onclose = (event) => {
                console.log("Websocket closed by server")
                setRecording(false)
            };

            //create recordign device
            console.debug("starting recording...")
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });

            mediaRecorder.current.addEventListener("dataavailable", eventAction);

            mediaRecorder.current.start(1000); // send audio chunks every 250ms
        }

        const stopRecording = () => {
            console.debug("Closing the websocket")
            ws.current?.close()
            ws.current = null

            console.debug("stopping recording...")
            //mediaRecorder.current?.removeEventListener("dataavailable", eventAction)
            mediaRecorder.current?.stop()
            mediaRecorder.current = null

        }

        if (isRecording) {
            startRecording()
        }
        else {
            stopRecording()
        }

        return () => {
            stopRecording();
        }
    }, [isRecording])





    return <div><button onClick={() => { setRecording(!isRecording) }}>Recording status: {isRecording + ""}, click to toggle</button>
        {output}
    </div>
}