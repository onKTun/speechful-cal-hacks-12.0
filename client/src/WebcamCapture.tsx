import React from 'react';
import Webcam from 'react-webcam';

// THE BORDER/EMOJIS WILL BE SOLELY DETERMINED BY THE VARIABLE "sentiment". THIS IS A SINGULAR VALUE <=4 BAD 5-6 NEUTRAL 7=+ GOOD
const WebcamCapture = () => {
    const webcamRef = React.useRef<Webcam>(null);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const [recording, setRecording] = React.useState(false);
    const [videoURL, setVideoURL] = React.useState("");
    const [sentiment, setSentiment] = React.useState(6);
    const [recordedChunks, setRecordedChunks] = React.useState<Blob[]>([]);
    const [runningRating, setRunningRating] = React.useState<number[][]>([]);

    function calcAverage(): number[] {
        if (runningRating.length == 0) return [6, 6, 6];

        const sums = runningRating.reduce(
            (acc, arr) => acc.map((v, i) => v + (arr[i] ?? 0)),
            [0, 0, 0]
        );

        return sums.map(v => v / runningRating.length);
    }

    const capture = async () => {
        if (!webcamRef.current)
            return;
        const image = webcamRef.current.getScreenshot();
        if (!image)
            return
        
        try {
            const response = await fetch('http://localhost:3000/sentiment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ base64Image: image }),
            })
            const data = await response.json();

            setRunningRating(prev => {
                const updated = [...prev, data.result];
                if (updated.length > 5) {
                    updated.shift();
                }
                return updated;
            });
            console.log(runningRating);

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

    const handlePlayback = () => {
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks);
            const url = URL.createObjectURL(blob);
            setVideoURL(url);
        }
    }

    React.useEffect(() => {
        if (recording) {
            const interval = setInterval(capture, 5000); //5 seconds
            return () => clearInterval(interval);
        }
    }, [recording]);

    return (
        <div>
            {recordedChunks.length > 0 && !videoURL && (
                <button onClick={handlePlayback}>Play Recording</button>
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
  {runningRating.map((r, i) => (
    <div key={i}>{r.join(", ")}</div>
  ))}
</div>

        </div>
    )
}

export default WebcamCapture