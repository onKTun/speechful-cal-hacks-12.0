import React from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = () => {
    const webcamRef = React.useRef<Webcam>(null);
    const [videoSentiment, setVideoSentiment] = React.useState("");
    const [audioSentiment, setAudioSentiment] = React.useState("");
    const [isRecording, setIsRecording] = React.useState(false);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const audioChunksRef = React.useRef<Blob[]>([]);

    const capture = async () => {
        if (!webcamRef.current)
            return;
        const image = webcamRef.current.getScreenshot();
        if (!image)
            return
        console.log('Image preview:', image.substring(0, 50));
        
        try {
            const response = await fetch('http://localhost:3000/sentiment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ base64Image: image }),
            })
            const data = await response.json();
            setVideoSentiment(data.result);
        } catch (err) {
            console.error(err);
        }
    };

    const processAudio = async (audioBlob: Blob) => {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.webm');
            
            const response = await fetch('http://localhost:3000/audio-sentiment', {
                method: 'POST',
                body: formData,
            });
            
            const data = await response.json();
            setAudioSentiment(data.result);
        } catch (err) {
            console.error('Audio processing error:', err);
        }
    };

    const startRecording = () => {
        if (webcamRef.current?.stream) {
            const stream = webcamRef.current.stream;
            const audioStream = new MediaStream();
            const audioTracks = stream.getAudioTracks();
            audioTracks.forEach(track => audioStream.addTrack(track));

            mediaRecorderRef.current = new MediaRecorder(audioStream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                processAudio(audioBlob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    React.useEffect(() => {
        const interval = setInterval(() => {
            capture();
            if (isRecording) {
                stopRecording();
                setTimeout(startRecording, 100); // Small delay before restarting
            } else {
                startRecording();
            }
        }, 5000); // 5 seconds

        return () => {
            clearInterval(interval);
            if (isRecording) {
                stopRecording();
            }
        };
    }, [isRecording]);

    return (
        <div>
            <Webcam
                audio={true}
                ref={webcamRef}
                screenshotFormat="image/webp"
            />
            <button onClick={capture}>Capture photo</button>
            <div>
                <h3>Video Feedback:</h3>
                <div>{videoSentiment}</div>
            </div>
            <div>
                <h3>Audio Feedback:</h3>
                <div>{audioSentiment}</div>
            </div>
        </div>
    )
}

export default WebcamCapture