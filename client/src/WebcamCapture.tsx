import React from 'react';
import Webcam from 'react-webcam';

// THE BORDER/EMOJIS WILL BE SOLELY DETERMINED BY THE VARIABLE "sentiment". THIS IS A SINGULAR VALUE <=4 BAD 5-6 NEUTRAL 7=+ GOOD
const WebcamCapture = () => {
    const webcamRef = React.useRef<Webcam>(null);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const [visualTips, setVisualTips] = React.useState("");
    const [recording, setRecording] = React.useState(false);
    const [videoURL, setVideoURL] = React.useState("");
    const [visualSentiment, setVisualSentiment] = React.useState(6);
    const [recordedChunks, setRecordedChunks] = React.useState<Blob[]>([]);
    const [visualRunningRating, setVisualRunningRating] = React.useState<number[][]>([]);

    /*const audioCapture = async () => {
        if (!webcamRef.current?.stream)
            return;
        
        const audioTracks = webcamRef.current.stream.getAudioTracks();
        if (audioTracks.length === 0)
            return;
        
        const audioStream = new MediaStream(audioTracks);
        
        const audioRecorder = new MediaRecorder(audioStream, {
            mimeType: "audio/webm"
        });
        
        const chunks: Blob[] = [];
        
        audioRecorder.addEventListener("dataavailable", (event: BlobEvent) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        });
        
        audioRecorder.addEventListener("stop", async () => {
            const blob = new Blob(chunks, { type: "audio/webm" });
            
            try {
                const base64Audio = await blobToBase64(blob);
                const response = await fetch('http://localhost:3000/sentiment/audio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ base64Audio: base64Audio }),
                });
                const data = await response.json();

                setVisualRunningRating(prev => {
                    const updated = [...prev, data.result];
                    if (updated.length > 5) {
                        updated.shift();
                    }

                    const sums = updated.reduce(
                        (acc, arr) => acc.map((v:number, i:number) => v + (arr[i] ?? 0)),
                        [0, 0, 0]
                    );
                    const averages: number[] = sums.map((v: number): number => v / updated.length);
                    const overallSentiment = averages.reduce((sum:number, val:number) => sum + val, 0) / averages.length;
                    
                    setVisualSentiment(overallSentiment);
                    
                    return updated;
                });
            } catch (err) {
                console.error(err);
            }
        });
        
        audioRecorder.start();
        setTimeout(() => audioRecorder.stop(), 5000);
    };*/

    const videoCapture = async () => {
        if (!webcamRef.current)
            return;
        const image = webcamRef.current.getScreenshot();
        if (!image)
            return
        
        try {
            const response = await fetch('http://localhost:3000/sentiment/visual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ base64Image: image }),
            })
            const data = await response.json();

            setVisualRunningRating(prev => {
                if (data.result[0] === -1) {
                    return prev;
                }

                const updated = [...prev, data.result];
                if (updated.length > 4) {
                    updated.shift();
                }

                const sums = updated.reduce(
                    (acc, arr) => acc.map((v:number, i:number) => v + (arr[i] ?? 0)),
                    [0, 0, 0]
                );
                const averages: number[] = sums.map((v: number): number => v / updated.length);
                const overallSentiment = averages.reduce((sum:number, val:number) => sum + val, 0) / averages.length;
                
                setVisualSentiment(overallSentiment);
                
                return updated;
            });

        } catch (err) {
            console.error(err);
        }
    };

    const startRecording = () => {
        if (!webcamRef.current?.stream)
            return;
        setRecording(true);
        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
           mimeType: "video/webm"
        });
        mediaRecorderRef.current.addEventListener("dataavailable", (event: BlobEvent) => {
            if (event.data.size > 0) {
                setRecordedChunks((prev) => [...prev, event.data]);
            }
        });
        mediaRecorderRef.current.start();
    }

    const stopRecording = () => {
        if (!mediaRecorderRef.current)
            return;
        mediaRecorderRef.current.stop();
        setRecording(false);
    }

    const handlePlayback = async () => {
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks);
            const url = URL.createObjectURL(blob);
            setVideoURL(url);
        }
    }

    const reset = () => {
        setRecording(false);
        setVideoURL("");
        setVisualSentiment(6);
        setRecordedChunks([]);
        setVisualRunningRating([]);
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setVisualTips("");
    }

    React.useEffect(() => {
        if (recording) {
            const interval = setInterval(() => {
                videoCapture();
                
                const sums = visualRunningRating.reduce(
                        (acc, arr) => acc.map((v:number, i:number) => v + (arr[i] ?? 0)),
                        [0, 0, 0]
                    );
                const averages: number[] = sums.map((v: number): number => v / visualRunningRating.length);
                const smallest = Math.min(...averages);

                if (smallest >= 6.5)
                    setVisualTips("Doing great! Keep it up!");
                else if (smallest < 5){
                    const tips = {
                        0: "Be more expressive!",
                        1: "Look at the audience!",
                        2: "Stay still, stop fidgeting!"
                    };
                    setVisualTips(tips[averages.indexOf(smallest) as keyof typeof tips]);
                } else {
                    setVisualTips("");
                }

            }, 2000); //2 seconds
            return () => clearInterval(interval);
        }
    }, [recording, visualRunningRating]);

    return (
        <div>
            {recordedChunks.length > 0 && !videoURL && (
                <>
                    <button onClick={handlePlayback}>Play Recording</button>
                    <button onClick={reset}>Reset</button>
                </>
            )}
            {videoURL ? (
                <video controls src={videoURL}></video>
            ):(
                <Webcam
                    audio={true}
                    ref={webcamRef}
                    screenshotFormat="image/webp"
                    muted
                />
            )}

            {recording ? (
                <button onClick={stopRecording}>End</button>
            ):(
                <button onClick={startRecording}>Start</button>
            )}
            <div>
                {visualRunningRating.map((r, i) => (
                    <div key={i}>{r.join(", ")}</div>
                ))}
            </div>
            <div>{visualSentiment}</div>
            {visualSentiment >= 7 && <div>😄</div>}
            {visualSentiment < 7 && visualSentiment >= 5 && <div>😐</div>}
            {visualSentiment < 5 && <div>😢</div>}
            <div>{visualTips}</div>
        </div>
    )
}

export default WebcamCapture
