import { useEffect } from 'react';

let landmarkerPromise;

async function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = import('@mediapipe/tasks-vision').then(async ({ FaceLandmarker, FilesetResolver }) => {
      const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm');
      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task' },
        numFaces: 1,
        runningMode: 'IMAGE',
      });
    });
  }
  return landmarkerPromise;
}

export default function FaceDetectorBridge({ uri, onDetected, onError }) {
  useEffect(() => {
    if (!uri) return undefined;
    let active = true;
    const image = new Image();
    image.onload = async () => {
      try { const result = await (await getLandmarker()).detect(image); if (active) onDetected(result); } catch (error) { if (active) onError?.(error); }
    };
    image.onerror = () => onError?.(new Error('Foto wajah tidak dapat dibaca.'));
    image.src = uri;
    return () => { active = false; };
  }, [onDetected, onError, uri]);
  return null;
}
