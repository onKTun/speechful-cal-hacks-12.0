import { useEffect, useRef, useState } from "react"
export default function LearningPageDev(){
    const [isRecording, setRecording] = useState(false)
    const [output, setOutput] = useState("")
    const ws = useRef<WebSocket | null>(null)
    const mediaRecorder = useRef<MediaRecorder | null>(null)


    useEffect(()=>{
        const socket = new WebSocket("ws://localhost:8080");
        ws.current = socket

        socket.onmessage = (event) => {
            console.log("Transcript:", event.data);
            setOutput(output + " " + event.data)
        };

        return ()=>{
            socket.close
        }

    },[])

    useEffect(()=>{
        const startRecording = async ()=>{
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream, { mimeType: "audio/webm" });

            mediaRecorder.current.addEventListener("dataavailable", async (event) => {
                if (event.data.size > 0 && ws.current?.readyState === WebSocket.OPEN) {
                    const audioBuffer = await event.data.arrayBuffer();
                    ws.current.send(audioBuffer);
                }
            });

            mediaRecorder.current.start(250); // send audio chunks every 250ms
        }
        if (isRecording){
            startRecording()
        }
        else{
            mediaRecorder.current?.stop()
        }
    },[isRecording])


    
    

    return <div><button onClick={()=>{setRecording(!isRecording)}}>Recording status: {isRecording + ""}, click to toggle</button>
        {output}</div>
}