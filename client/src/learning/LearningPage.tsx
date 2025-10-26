import { useEffect, useRef, useState } from "react"
import { processTranscript, compareTextAccuracy } from "./utils/processTranscript"

export default function LearningPageDev() {
    const [isMicOpen, setMicStatus] = useState(false)
    const [output, setOutput] = useState("")
    const microphone = useRef<MediaRecorder | undefined>(undefined)
    const listenButton = useRef<HTMLButtonElement | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)

    const originalLines = processTranscript("I am happy to join with you today in what will go down in history as the greatest demonstration for freedom in the history of our nation.\nFive score years ago a great American in whose symbolic shadow we stand today signed the Emancipation Proclamation. "
        , 1)
    const threshold = 0.9

    const openMicrophone = async (microphone: MediaRecorder, socket: WebSocket) => {
        return new Promise((resolve: any) => {
            microphone.onstart = () => {
                console.log("client: microphone opened");
                document.body.classList.add("recording");
                resolve();
            };

            microphone.onstop = () => {
                console.log("client: microphone closed");
                document.body.classList.remove("recording");
            };

            microphone.ondataavailable = (event: any) => {
                console.log("client: microphone data received");
                if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
                    socket.send(event.data);
                }
            };

            microphone.start(1000);
            setMicStatus(true)
        });
    }

    const closeMicrophone = async (microphone: MediaRecorder) => {
        microphone.stop();
        setMicStatus(false)
    }
//logic to see where the user is in the text
    useEffect(() => {
        const processOutput = (text: string) => {
            if (text == "") {
                return;
            }

            const words = processTranscript(text, 1)
            const transcriptWords = originalLines.slice(currentIndex, currentIndex + words.length)

            const score = compareTextAccuracy(words.join(' '), transcriptWords.join(' '))

            if (score >= threshold) {
                setCurrentIndex(currentIndex + words.length)
            }
        }

        processOutput(output)
    }, [output])

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:3000");

        //once the websocket is open, this function is called to assign the listening toggle button it's logic
        const start = async (socket: WebSocket) => {
            console.log("client: waiting to open microphone");

            listenButton.current?.addEventListener("click", async () => {

                if (!microphone.current) {
                    try {
                        microphone.current = await getMicrophone();

                    } catch (error) {
                        console.error("error getting microphone:", error);
                    }
                }

                if (!isMicOpen && microphone.current) {
                    await openMicrophone(microphone.current, socket);
                }
                else {
                    if (microphone.current) {
                        await closeMicrophone(microphone.current);
                    }
                    //setMicStatus(false)
                    microphone.current = undefined;
                }
            });
        }

        socket.addEventListener("open", async () => {
            console.log("client: connected to server");
            await start(socket);
        });

        //listener for recieving 
        socket.addEventListener("message", (event) => {
            if (event.data === "") {
                return;
            }

            let data;
            try {
                data = JSON.parse(event.data);
            } catch (e) {
                console.error("Failed to parse JSON:", e);
                return;
            }

            //this handles where the transcript data is going!
            if (data && data.channel && data.channel.alternatives[0].transcript !== "") {
                setOutput(data.channel.alternatives[0].transcript)
            }
        });

        socket.addEventListener("close", () => {
            console.log("client: disconnected from server");
        });
    }, [])

    return (
        <div>
            <ul>
                {originalLines.map((line, idx) => (
                    <li key={idx} style={{ display: "flex", gap: 8 }}>
                        <span style={{ minWidth: 24, textAlign: "right", color: "#666" }}>{idx}.</span>
                        <span>{line}</span>
                    </li>
                ))}
            </ul>
            <div>{currentIndex}</div>
            <button ref={listenButton}>
                Click to toggle listening. Status: {isMicOpen + ""}
            </button>
            <h4>Similarity</h4>
            <div>Original {originalLines.slice(currentIndex, currentIndex + processTranscript(output, 1).length).join(" ")}</div>
            <div>Transcribed {output}</div>
            <div>Score: {compareTextAccuracy(originalLines[currentIndex], output)}</div>
        </div>
    )
}

async function getMicrophone() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        return new MediaRecorder(stream, { mimeType: "audio/webm" });
    } catch (error) {
        console.error("error accessing microphone:", error);
        throw error;
    }
}
