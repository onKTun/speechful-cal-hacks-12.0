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
    const [feedback, setFeedback] = React.useState("");
    const [dataCount, setDataCount] = React.useState(0);
    // [facial_expression], [eye_contact], [focus]. for each array, [average, min, max]
    const [visualRuntimeRatings, setVisualRuntimeRatings] = React.useState<number[][]>([[6, 6, 6], [6, 6, 6], [6, 6, 6]]);

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
                
                setVisualRuntimeRatings(prevRatings => 
                    prevRatings.map((category, i) => [
                        category[0] + data.result[i],
                        Math.min(category[1], data.result[i]),
                        Math.max(category[2], data.result[i])
                    ])
                );

                const updated = [...prev, data.result];
                setDataCount(prev => prev + 1);
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

        try {

            const averagedRatings = visualRuntimeRatings.map(category => [
                category[0] / dataCount,
                category[1],
                category[2]
            ]);

            const response = await fetch('http://localhost:3000/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({ averagedRatings }),
            })
            const data = await response.json();
            setFeedback(data.content[0].text);
            console.log(data.content[0].text);
        } catch (err) {
            console.error(err);
        }
    }

    const reset = () => {
        setRecording(false);
        setVideoURL("");
        setVisualSentiment(6);
        setRecordedChunks([]);
        setVisualRunningRating([]);
        setDataCount(0);
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setVisualTips("");
        setVisualRuntimeRatings([[6, 6, 6], [6, 6, 6], [6, 6, 6]]);
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
                <>
                    <video controls src={videoURL}></video>
                    <div>{feedback}</div>
                </>
            ):(
                <Webcam
                    audio={true}
                    ref={webcamRef}
                    screenshotFormat="image/webp"
                    muted
                    style={{ transform: "scaleX(-1)" }}
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