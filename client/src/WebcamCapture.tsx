import React from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = () => {
    const webcamRef = React.useRef<Webcam>(null);
    const [sentiment, setSentiment] = React.useState("");

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
            setSentiment(data.result);
        } catch (err) {
            console.error(err);
        }
    };

    React.useEffect(() => {
        const interval = setInterval(capture, 5000); //5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/webp"
            />
            <button onClick={capture}>Capture photo</button>
            <div>{sentiment}</div>
        </div>
    )
}

export default WebcamCapture