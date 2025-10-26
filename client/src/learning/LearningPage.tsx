import { useEffect, useRef, useState } from "react"

export default function LearningPageDev() {
    const [isMicOpen, setMicStatus] = useState(false)
    const [output, setOutput] = useState("")
    const microphone = useRef<MediaRecorder | undefined>(undefined)
    const listenButton = useRef<HTMLButtonElement | null>(null)

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
            <button ref={listenButton}>
                Click to toggle listening. Status: {isMicOpen + ""}
            </button>
            <div>{output}</div>
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
