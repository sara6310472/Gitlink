import { useState, useRef, useEffect } from 'react';

export const useCamera = () => {
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [stream, setStream] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });

            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    setIsReady(true);
                };
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setCameraError('Error opening camera. Please check permissions.');
        }
    };

    const capturePhoto = (onPhotoCapture) => {
        if (!videoRef.current || !canvasRef.current || !isReady) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `photo_${Date.now()}.jpg`, {
                    type: 'image/jpeg'
                });
                onPhotoCapture(file);
                closeCamera();
            }
        }, 'image/jpeg', 0.9);
    };

    const closeCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsReady(false);
        setCameraError(null);
        setShowCameraModal(false);
    };

    const openCamera = () => {
        setShowCameraModal(true);
        startCamera();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return {
        showCameraModal,
        isReady,
        cameraError,
        videoRef,
        canvasRef,
        openCamera,
        closeCamera,
        capturePhoto,
    };
};