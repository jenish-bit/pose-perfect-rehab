
import { useEffect, useRef, useState } from 'react';
import { Pose } from '@mediapipe/pose';

interface PoseData {
  landmarks: any[];
  worldLandmarks: any[];
  armAngle: number;
  shoulderPosition: number;
  confidence: number;
  isCorrectForm: boolean;
  feedback: string;
}

export const usePoseDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  exerciseType: string
) => {
  const [poseData, setPoseData] = useState<PoseData>({
    landmarks: [],
    worldLandmarks: [],
    armAngle: 0,
    shoulderPosition: 0,
    confidence: 0,
    isCorrectForm: false,
    feedback: 'Position yourself in front of camera'
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const poseRef = useRef<Pose | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastRepTime = useRef<number>(0);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const initializePose = async () => {
      try {
        const pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        pose.onResults((results) => {
          if (canvasRef.current && results.poseLandmarks) {
            const canvasCtx = canvasRef.current.getContext('2d');
            if (canvasCtx && videoRef.current) {
              canvasCtx.save();
              canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              
              // Draw pose landmarks
              drawPoseLandmarks(canvasCtx, results.poseLandmarks);
              
              // Analyze pose based on exercise type
              const analysis = analyzePose(results.poseLandmarks, exerciseType);
              setPoseData(analysis);
              
              canvasCtx.restore();
            }
          }
        });

        poseRef.current = pose;
        setIsInitialized(true);
        
        // Start the pose detection loop
        const detect = async () => {
          if (videoRef.current && poseRef.current && videoRef.current.readyState >= 2) {
            try {
              await poseRef.current.send({ image: videoRef.current });
            } catch (error) {
              console.error('Pose detection error:', error);
            }
          }
          animationRef.current = requestAnimationFrame(detect);
        };
        
        detect();

      } catch (error) {
        console.error('Error initializing pose detection:', error);
      }
    };

    initializePose();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [videoRef, canvasRef, exerciseType]);

  const drawPoseLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    // Draw key pose points
    const connections = [
      [11, 12], // shoulders
      [11, 13], [13, 15], // left arm
      [12, 14], [14, 16], // right arm
      [11, 23], [12, 24], // torso
      [23, 25], [25, 27], // left leg
      [24, 26], [26, 28]  // right leg
    ];

    // Draw landmarks
    landmarks.forEach((landmark, index) => {
      const x = landmark.x * ctx.canvas.width;
      const y = landmark.y * ctx.canvas.height;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#00ff00';
      ctx.fill();
    });

    // Draw connections
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    connections.forEach(([start, end]) => {
      if (landmarks[start] && landmarks[end]) {
        const startX = landmarks[start].x * ctx.canvas.width;
        const startY = landmarks[start].y * ctx.canvas.height;
        const endX = landmarks[end].x * ctx.canvas.width;
        const endY = landmarks[end].y * ctx.canvas.height;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    });
  };

  const analyzePose = (landmarks: any[], exerciseType: string): PoseData => {
    if (!landmarks || landmarks.length < 33) {
      return {
        landmarks,
        worldLandmarks: [],
        armAngle: 0,
        shoulderPosition: 0,
        confidence: 0,
        isCorrectForm: false,
        feedback: 'Please position yourself fully in camera view'
      };
    }

    // Get key landmarks
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    let analysis: PoseData = {
      landmarks,
      worldLandmarks: [],
      armAngle: 0,
      shoulderPosition: 0,
      confidence: 0.8,
      isCorrectForm: false,
      feedback: ''
    };

    // Check landmark visibility
    const visibility = [leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist]
      .reduce((sum, landmark) => sum + (landmark?.visibility || 0), 0) / 6;

    if (visibility < 0.7) {
      analysis.feedback = 'Please move closer to the camera';
      analysis.confidence = visibility;
      return analysis;
    }

    switch (exerciseType.toLowerCase()) {
      case 'shoulder flexion':
        analysis = analyzeShoulderFlexion(leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist);
        break;
      case 'arm circles':
        analysis = analyzeArmCircles(leftShoulder, rightShoulder, leftWrist, rightWrist);
        break;
      case 'bicep curls':
        analysis = analyzeBicepCurls(leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist);
        break;
      case 'weight shifts':
        analysis = analyzeWeightShifts(landmarks[23], landmarks[24]); // hips
        break;
      case 'ankle pumps':
        analysis = analyzeAnklePumps(landmarks[27], landmarks[28]); // ankles
        break;
      case 'seated marching':
        analysis = analyzeSeatedMarching(landmarks[25], landmarks[26]); // knees
        break;
      default:
        analysis.feedback = 'Exercise analysis in progress...';
    }

    analysis.landmarks = landmarks;
    analysis.confidence = Math.min(analysis.confidence, visibility);
    
    return analysis;
  };

  const analyzeShoulderFlexion = (leftShoulder: any, rightShoulder: any, leftElbow: any, rightElbow: any, leftWrist: any, rightWrist: any): PoseData => {
    // Use right arm for analysis
    const shoulderToWrist = {
      x: rightWrist.x - rightShoulder.x,
      y: rightWrist.y - rightShoulder.y
    };

    // Calculate arm elevation angle
    const angle = Math.atan2(-shoulderToWrist.y, shoulderToWrist.x) * 180 / Math.PI;
    const armHeight = rightShoulder.y - rightWrist.y;

    let feedback = '';
    let isCorrectForm = false;

    if (armHeight > 0.15 && Math.abs(angle) < 30) {
      feedback = 'Excellent! Perfect shoulder flexion';
      isCorrectForm = true;
    } else if (armHeight > 0.1) {
      feedback = 'Good! Try to raise your arm a bit higher';
      isCorrectForm = false;
    } else if (armHeight > 0.05) {
      feedback = 'Keep raising your arm forward';
      isCorrectForm = false;
    } else {
      feedback = 'Raise your arm forward to shoulder height';
      isCorrectForm = false;
    }

    return {
      landmarks: [],
      worldLandmarks: [],
      armAngle: Math.abs(angle),
      shoulderPosition: armHeight * 100,
      confidence: 0.9,
      isCorrectForm,
      feedback
    };
  };

  const analyzeArmCircles = (leftShoulder: any, rightShoulder: any, leftWrist: any, rightWrist: any): PoseData => {
    // Check if arms are extended to sides
    const leftArmExtended = Math.abs(leftWrist.x - leftShoulder.x) > 0.2;
    const rightArmExtended = Math.abs(rightWrist.x - rightShoulder.x) > 0.2;
    
    let feedback = '';
    let isCorrectForm = false;

    if (leftArmExtended && rightArmExtended) {
      feedback = 'Perfect! Arms extended, make circular motions';
      isCorrectForm = true;
    } else if (leftArmExtended || rightArmExtended) {
      feedback = 'Good! Extend both arms out to your sides';
      isCorrectForm = false;
    } else {
      feedback = 'Extend your arms out to your sides';
      isCorrectForm = false;
    }

    return {
      landmarks: [],
      worldLandmarks: [],
      armAngle: 0,
      shoulderPosition: 0,
      confidence: 0.85,
      isCorrectForm,
      feedback
    };
  };

  const analyzeBicepCurls = (leftShoulder: any, rightShoulder: any, leftElbow: any, rightElbow: any, leftWrist: any, rightWrist: any): PoseData => {
    // Calculate elbow angle for bicep curl (using right arm)
    const upperArm = {
      x: rightElbow.x - rightShoulder.x,
      y: rightElbow.y - rightShoulder.y
    };
    
    const forearm = {
      x: rightWrist.x - rightElbow.x,
      y: rightWrist.y - rightElbow.y
    };

    const dotProduct = upperArm.x * forearm.x + upperArm.y * forearm.y;
    const upperArmMag = Math.sqrt(upperArm.x * upperArm.x + upperArm.y * upperArm.y);
    const forearmMag = Math.sqrt(forearm.x * forearm.x + forearm.y * forearm.y);
    
    const angle = Math.acos(Math.max(-1, Math.min(1, dotProduct / (upperArmMag * forearmMag)))) * 180 / Math.PI;

    let feedback = '';
    let isCorrectForm = false;

    if (angle < 60) {
      feedback = 'Great curl! Now lower slowly';
      isCorrectForm = true;
    } else if (angle < 120) {
      feedback = 'Good form, continue the curl';
      isCorrectForm = false;
    } else {
      feedback = 'Start curling the weight toward your shoulder';
      isCorrectForm = false;
    }

    return {
      landmarks: [],
      worldLandmarks: [],
      armAngle: angle,
      shoulderPosition: 0,
      confidence: 0.9,
      isCorrectForm,
      feedback
    };
  };

  const analyzeWeightShifts = (leftHip: any, rightHip: any): PoseData => {
    // Analyze weight distribution based on hip position
    const hipBalance = Math.abs(leftHip.y - rightHip.y);
    
    let feedback = '';
    let isCorrectForm = false;

    if (hipBalance < 0.02) {
      feedback = 'Good balance! Try shifting weight to one side';
      isCorrectForm = false;
    } else if (hipBalance > 0.03) {
      feedback = 'Good weight shift! Hold and return to center';
      isCorrectForm = true;
    } else {
      feedback = 'Shift your weight more to one side';
      isCorrectForm = false;
    }

    return {
      landmarks: [],
      worldLandmarks: [],
      armAngle: 0,
      shoulderPosition: hipBalance * 100,
      confidence: 0.85,
      isCorrectForm,
      feedback
    };
  };

  const analyzeAnklePumps = (leftAnkle: any, rightAnkle: any): PoseData => {
    // Simple ankle movement detection
    const ankleMovement = Math.abs(leftAnkle.y - rightAnkle.y);
    
    let feedback = '';
    let isCorrectForm = false;

    if (ankleMovement > 0.02) {
      feedback = 'Great ankle movement! Keep pumping';
      isCorrectForm = true;
    } else {
      feedback = 'Move your feet up and down';
      isCorrectForm = false;
    }

    return {
      landmarks: [],
      worldLandmarks: [],
      armAngle: 0,
      shoulderPosition: ankleMovement * 100,
      confidence: 0.8,
      isCorrectForm,
      feedback
    };
  };

  const analyzeSeatedMarching = (leftKnee: any, rightKnee: any): PoseData => {
    // Detect knee lifting movement
    const kneeHeight = Math.max(leftKnee.y, rightKnee.y);
    const baselineKneeHeight = 0.6; // Approximate seated knee height
    
    let feedback = '';
    let isCorrectForm = false;

    if (kneeHeight < baselineKneeHeight - 0.05) {
      feedback = 'Perfect! Keep marching in place';
      isCorrectForm = true;
    } else {
      feedback = 'Lift your knees up as if marching';
      isCorrectForm = false;
    }

    return {
      landmarks: [],
      worldLandmarks: [],
      armAngle: 0,
      shoulderPosition: (baselineKneeHeight - kneeHeight) * 100,
      confidence: 0.8,
      isCorrectForm,
      feedback
    };
  };

  return { poseData, isInitialized };
};
