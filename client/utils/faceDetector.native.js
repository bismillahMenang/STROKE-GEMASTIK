import { useEffect } from 'react';
import { useImageFaceDetector } from 'react-native-vision-camera-face-detector';

export default function FaceDetectorBridge({ uri, onDetected, onError }) {
  const detector = useImageFaceDetector({ performanceMode: 'accurate', runClassifications: true, runContours: true, runLandmarks: true });
  useEffect(() => {
    if (!uri) return undefined;
    let active = true;
    detector.detectFaces(uri).then((faces) => { if (active) onDetected(faces[0] || null); }).catch((error) => { if (active) onError?.(error); });
    return () => { active = false; };
  }, [detector, onDetected, onError, uri]);
  return null;
}
