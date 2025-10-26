import { useState } from "react";


export default function Microphone(){

   const [output, setOutput] = useState("")

    
    // frontend.js
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

        mediaRecorder.addEventListener("dataavailable", async (event) => {
            if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
                const audioBuffer = await event.data.arrayBuffer();
                ws.send(audioBuffer);
            }
        });

        mediaRecorder.start(250); // send audio chunks every 250ms
    };


    
    ws.onmessage = (event) => {
        console.log("Transcript:", event.data);
        setOutput(output + " " + event.data)
    };

    return <div><span>{output}</span></div>


}