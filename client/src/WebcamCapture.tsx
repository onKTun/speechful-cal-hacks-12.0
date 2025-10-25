import React from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = () => {
    const webcamRef = React.useRef<Webcam>(null);
    const [sentiment, setSentiment] = React.useState("");
    const imagesRef = React.useRef<string[]>([]);

    React.useEffect(() => {
        let count = 0;

        const capture = () => {
            if (!webcamRef.current)
                return;
            const newImage = webcamRef.current.getScreenshot();
            if (!newImage)
                return
            
            imagesRef.current = [...imagesRef.current, newImage];
        };

        const analyze = async () => {
            const imagesToSend = imagesRef.current;
            try {
                const response = await fetch('http://localhost:3000/sentiment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ base64Images: imagesToSend }),
                })
                imagesRef.current = [];
                const data = await response.json();
                console.log(data);
                setSentiment(data.result);
            } catch (err) {
                console.error(err);
            }
        }

        const interval = setInterval(() => {
            capture();
            count++;
            console.log(count);
            if (count == 2) {
                analyze();
                count = 0;
            }
        } , 5000); //1 second
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/webp"
                screenshotQuality={0.5}
            />
            <div>{sentiment}</div>
        </div>
    )
}

export default WebcamCapture