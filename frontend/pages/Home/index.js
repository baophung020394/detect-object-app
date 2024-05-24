import { Box, Image, Spinner } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const previousFrameRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // State for loading spinner
  const lastFrameTimeRef = useRef(0);
  const imageUrlRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 60 },
          },
        })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setSocket(new WebSocket("ws://localhost:8000/ws"));
        })
        .catch((err) => console.error("Error accessing media devices.", err));
    }
  }, [videoRef]);

  useEffect(() => {
    if (socket) {
      socket.onopen = () => {
        console.log("WebSocket connection established");
      };

      socket.onmessage = (event) => {
        const blob = new Blob([event.data], { type: "image/jpeg" });
        const imageUrl = URL.createObjectURL(blob);

        if (imageUrlRef.current) {
          URL.revokeObjectURL(imageUrlRef.current);
        }

        imageUrlRef.current = imageUrl;
        setImageSrc(imageUrl);
        setIsLoading(false); // Stop loading spinner when the first image is received
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };

      return () => {
        socket.close();
      };
    }
  }, [socket]);

  const captureAndSendFrame = (timestamp) => {
    const desiredFrameRate = 10;
    const minFrameTime = 1000 / desiredFrameRate;

    if (timestamp - lastFrameTimeRef.current < minFrameTime) {
      requestAnimationFrame(captureAndSendFrame);
      return;
    }

    lastFrameTimeRef.current = timestamp;

    if (!videoRef.current || !canvasRef.current) {
      requestAnimationFrame(captureAndSendFrame);
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const currentFrame = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    );

    let diff = 0;
    if (previousFrameRef.current) {
      diff = calculateFrameDifference(previousFrameRef.current, currentFrame);
    }

    if (diff > 0.1 && socket && socket.readyState === WebSocket.OPEN) {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            socket.send(blob);
          }
          requestAnimationFrame(captureAndSendFrame);
        },
        "image/jpeg",
        0.7,
      );
    } else {
      requestAnimationFrame(captureAndSendFrame);
    }

    previousFrameRef.current = currentFrame;
  };

  const calculateFrameDifference = (frame1, frame2) => {
    let diff = 0;
    for (let i = 0; i < frame1.data.length; i += 4) {
      const rDiff = Math.abs(frame1.data[i] - frame2.data[i]);
      const gDiff = Math.abs(frame1.data[i + 1] - frame2.data[i + 1]);
      const bDiff = Math.abs(frame1.data[i + 2] - frame2.data[i + 2]);
      diff += (rDiff + gDiff + bDiff) / 3;
    }
    return diff / (frame1.data.length / 4);
  };

  useEffect(() => {
    if (socket && videoRef.current) {
      requestAnimationFrame(captureAndSendFrame);
    }
  }, [socket]);

  return (
    <Box
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box display="none">
        <video ref={videoRef} style={{ display: "block" }} />
      </Box>
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        style={{ display: "none" }}
      />
      <Box
        width="800px"
        height="800px"
        display="flex"
        justifyContent="center"
        alignItems="center"
        border="2px solid"
        borderColor="gray.300"
        borderRadius="md"
      >
        {isLoading ? (
          <Spinner size="xl" />
        ) : (
          imageSrc && (
            <Image
              src={imageSrc}
              alt="Processed frame"
              style={{ maxWidth: "100%", maxHeight: "100%", display: "block" }}
            />
          )
        )}
      </Box>
    </Box>
  );
}
