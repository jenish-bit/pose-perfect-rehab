import { useRef, useEffect, useState, useCallback } from 'react';
import { Pose, Results } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

interface JointAngle {
  joint: string;
  angle: number;
  timestamp: number;
}

interface MovementMetrics {
  jointAngles: JointAngle[];
  rangeOfMotion: Record<string, { min: number; max: number; current: number }>;
  movementQuality: number;
  fatigueLevel: number;
  painIndicators: string[];
  balanceScore: number;
  symmetryScore: number;
}

interface AdvancedPoseData {
  landmarks: any[];
  movements: MovementMetrics;
  isCorrectForm: boolean;
  confidence: number;
  feedback: string;
  exercisePhase: 'preparation' | 'execution' | 'recovery';
}

export const useAdvancedPoseDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  exerciseType: string
) => {
  const [poseData, setPoseData] = useState<AdvancedPoseData>({
    landmarks: [],
    movements: {
      jointAngles: [],
      rangeOfMotion: {},
      movementQuality: 0,
      fatigueLevel: 0,
      painIndicators: [],
      balanceScore: 0,
      symmetryScore: 0
    },
    isCorrectForm: false,
    confidence: 0,
    feedback: '',
    exercisePhase: 'preparation'
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const movementHistoryRef = useRef<any[]>([]);
  const frameCountRef = useRef(0);

  // Calculate angle between three points
  const calculateAngle = useCallback((point1: any, point2: any, point3: any): number => {
    const vector1 = {
      x: point1.x - point2.x,
      y: point1.y - point2.y
    };
    const vector2 = {
      x: point3.x - point2.x,
      y: point3.y - point2.y
    };
    
    const dot = vector1.x * vector2.x + vector1.y * vector2.y;
    const mag1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    const mag2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
    
    const cos = dot / (mag1 * mag2);
    return Math.acos(Math.max(-1, Math.min(1, cos))) * (180 / Math.PI);
  }, []);

  // Analyze joint angles for multiple joints
  const analyzeJointAngles = useCallback((landmarks: any[]): JointAngle[] => {
    const jointAngles: JointAngle[] = [];
    const timestamp = Date.now();

    // Shoulder angle (left)
    if (landmarks[11] && landmarks[13] && landmarks[15]) {
      const shoulderAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
      jointAngles.push({ joint: 'left_shoulder', angle: shoulderAngle, timestamp });
    }

    // Shoulder angle (right)
    if (landmarks[12] && landmarks[14] && landmarks[16]) {
      const shoulderAngle = calculateAngle(landmarks[12], landmarks[14], landmarks[16]);
      jointAngles.push({ joint: 'right_shoulder', angle: shoulderAngle, timestamp });
    }

    // Elbow angle (left)
    if (landmarks[11] && landmarks[13] && landmarks[15]) {
      const elbowAngle = calculateAngle(landmarks[11], landmarks[13], landmarks[15]);
      jointAngles.push({ joint: 'left_elbow', angle: elbowAngle, timestamp });
    }

    // Elbow angle (right)
    if (landmarks[12] && landmarks[14] && landmarks[16]) {
      const elbowAngle = calculateAngle(landmarks[12], landmarks[14], landmarks[16]);
      jointAngles.push({ joint: 'right_elbow', angle: elbowAngle, timestamp });
    }

    // Hip angle (left)
    if (landmarks[23] && landmarks[25] && landmarks[27]) {
      const hipAngle = calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
      jointAngles.push({ joint: 'left_hip', angle: hipAngle, timestamp });
    }

    // Hip angle (right)
    if (landmarks[24] && landmarks[26] && landmarks[28]) {
      const hipAngle = calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
      jointAngles.push({ joint: 'right_hip', angle: hipAngle, timestamp });
    }

    // Knee angle (left)
    if (landmarks[23] && landmarks[25] && landmarks[27]) {
      const kneeAngle = calculateAngle(landmarks[23], landmarks[25], landmarks[27]);
      jointAngles.push({ joint: 'left_knee', angle: kneeAngle, timestamp });
    }

    // Knee angle (right)
    if (landmarks[24] && landmarks[26] && landmarks[28]) {
      const kneeAngle = calculateAngle(landmarks[24], landmarks[26], landmarks[28]);
      jointAngles.push({ joint: 'right_knee', angle: kneeAngle, timestamp });
    }

    return jointAngles;
  }, [calculateAngle]);

  // Calculate range of motion for each joint
  const calculateRangeOfMotion = useCallback((jointAngles: JointAngle[], history: any[]): Record<string, { min: number; max: number; current: number }> => {
    const rom: Record<string, { min: number; max: number; current: number }> = {};
    
    jointAngles.forEach(joint => {
      const historicalAngles = history
        .filter(h => h.joint === joint.joint)
        .map(h => h.angle);
      
      const allAngles = [...historicalAngles, joint.angle];
      rom[joint.joint] = {
        min: Math.min(...allAngles),
        max: Math.max(...allAngles),
        current: joint.angle
      };
    });

    return rom;
  }, []);

  // Detect fatigue based on movement patterns
  const detectFatigue = useCallback((movements: any[], frameCount: number): number => {
    if (movements.length < 30) return 0;

    const recentMovements = movements.slice(-30);
    const movementVariability = recentMovements.reduce((acc, curr, idx) => {
      if (idx === 0) return acc;
      const prev = recentMovements[idx - 1];
      return acc + Math.abs(curr.movementQuality - prev.movementQuality);
    }, 0) / recentMovements.length;

    // Higher variability might indicate fatigue
    return Math.min(10, Math.floor(movementVariability * 10));
  }, []);

  // Assess movement quality
  const assessMovementQuality = useCallback((landmarks: any[], exerciseType: string): number => {
    if (!landmarks || landmarks.length === 0) return 0;

    let qualityScore = 0;
    let checks = 0;

    // Check pose stability
    const centerOfMass = {
      x: (landmarks[11].x + landmarks[12].x) / 2,
      y: (landmarks[11].y + landmarks[12].y) / 2
    };
    
    // Check shoulder alignment
    if (landmarks[11] && landmarks[12]) {
      const shoulderAlignment = Math.abs(landmarks[11].y - landmarks[12].y);
      qualityScore += shoulderAlignment < 0.05 ? 25 : 0;
      checks++;
    }

    // Check hip alignment
    if (landmarks[23] && landmarks[24]) {
      const hipAlignment = Math.abs(landmarks[23].y - landmarks[24].y);
      qualityScore += hipAlignment < 0.05 ? 25 : 0;
      checks++;
    }

    // Check overall posture
    if (landmarks[0] && landmarks[11] && landmarks[12]) {
      const postureScore = Math.abs(landmarks[0].x - centerOfMass.x);
      qualityScore += postureScore < 0.1 ? 25 : 0;
      checks++;
    }

    // Exercise-specific checks
    if (exerciseType === 'arm_raise') {
      if (landmarks[15] && landmarks[16]) {
        const armHeight = Math.min(landmarks[15].y, landmarks[16].y);
        qualityScore += armHeight < landmarks[11].y ? 25 : 0;
        checks++;
      }
    }

    return checks > 0 ? qualityScore / checks : 0;
  }, []);

  // Analyze balance and symmetry
  const analyzeBalance = useCallback((landmarks: any[]): { balance: number; symmetry: number } => {
    if (!landmarks || landmarks.length < 33) {
      return { balance: 0, symmetry: 0 };
    }

    // Calculate center of pressure
    const leftFoot = landmarks[31];
    const rightFoot = landmarks[32];
    const centerOfPressure = {
      x: (leftFoot.x + rightFoot.x) / 2,
      y: (leftFoot.y + rightFoot.y) / 2
    };

    // Calculate body center
    const bodyCenter = {
      x: (landmarks[11].x + landmarks[12].x) / 2,
      y: (landmarks[23].y + landmarks[24].y) / 2
    };

    // Balance score based on center alignment
    const balanceDistance = Math.sqrt(
      Math.pow(centerOfPressure.x - bodyCenter.x, 2) +
      Math.pow(centerOfPressure.y - bodyCenter.y, 2)
    );
    const balanceScore = Math.max(0, 100 - (balanceDistance * 1000));

    // Symmetry score
    const leftSide = [landmarks[11], landmarks[13], landmarks[15], landmarks[23], landmarks[25], landmarks[27]];
    const rightSide = [landmarks[12], landmarks[14], landmarks[16], landmarks[24], landmarks[26], landmarks[28]];
    
    let symmetryDifference = 0;
    for (let i = 0; i < leftSide.length; i++) {
      if (leftSide[i] && rightSide[i]) {
        symmetryDifference += Math.abs(leftSide[i].y - rightSide[i].y);
      }
    }
    const symmetryScore = Math.max(0, 100 - (symmetryDifference * 500));

    return { balance: balanceScore, symmetry: symmetryScore };
  }, []);

  // Pain detection through movement patterns
  const detectPainIndicators = useCallback((movements: any[], landmarks: any[]): string[] => {
    const indicators: string[] = [];

    // Check for compensatory movements
    if (landmarks[11] && landmarks[12]) {
      const shoulderImbalance = Math.abs(landmarks[11].y - landmarks[12].y);
      if (shoulderImbalance > 0.1) {
        indicators.push('shoulder_compensation');
      }
    }

    // Check for restricted range of motion
    if (movements.length > 10) {
      const recentMovements = movements.slice(-10);
      const avgRange = recentMovements.reduce((acc, curr) => {
        return acc + Object.values(curr.rangeOfMotion).reduce((sum: number, rom: any) => {
          return sum + (rom.max - rom.min);
        }, 0);
      }, 0) / recentMovements.length;

      if (avgRange < 50) {
        indicators.push('restricted_movement');
      }
    }

    // Check for tremor or instability
    if (landmarks.length > 0) {
      const handStability = Math.abs(landmarks[15]?.x - landmarks[16]?.x) || 0;
      if (handStability > 0.05) {
        indicators.push('tremor_detected');
      }
    }

    return indicators;
  }, []);

  // Generate exercise feedback
  const generateFeedback = useCallback((metrics: MovementMetrics, exercisePhase: string): string => {
    const { movementQuality, fatigueLevel, painIndicators, balanceScore } = metrics;

    if (painIndicators.length > 0) {
      return "Take a break if you feel any discomfort. Consider adjusting your form.";
    }

    if (fatigueLevel > 7) {
      return "You seem tired. Consider taking a short rest.";
    }

    if (balanceScore < 50) {
      return "Focus on maintaining your balance. Keep your feet steady.";
    }

    if (movementQuality > 80) {
      return "Excellent form! Keep up the great work!";
    } else if (movementQuality > 60) {
      return "Good form. Try to maintain steady movements.";
    } else {
      return "Focus on slower, more controlled movements.";
    }
  }, []);

  const onResults = useCallback((results: Results) => {
    if (!canvasRef.current || !results.poseLandmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pose landmarks and connections
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: '#00FF00',
      lineWidth: 2
    });
    drawLandmarks(ctx, results.poseLandmarks, {
      color: '#FF0000',
      lineWidth: 1,
      radius: 3
    });

    // Analyze movements
    const jointAngles = analyzeJointAngles(results.poseLandmarks);
    const rangeOfMotion = calculateRangeOfMotion(jointAngles, movementHistoryRef.current);
    const movementQuality = assessMovementQuality(results.poseLandmarks, exerciseType);
    const { balance, symmetry } = analyzeBalance(results.poseLandmarks);
    const fatigueLevel = detectFatigue(movementHistoryRef.current, frameCountRef.current);
    const painIndicators = detectPainIndicators(movementHistoryRef.current, results.poseLandmarks);

    const movements: MovementMetrics = {
      jointAngles,
      rangeOfMotion,
      movementQuality,
      fatigueLevel,
      painIndicators,
      balanceScore: balance,
      symmetryScore: symmetry
    };

    // Determine exercise phase
    let exercisePhase: 'preparation' | 'execution' | 'recovery' = 'preparation';
    if (movementQuality > 50) {
      exercisePhase = 'execution';
    } else if (fatigueLevel > 5) {
      exercisePhase = 'recovery';
    }

    const feedback = generateFeedback(movements, exercisePhase);
    const confidence = Math.min(100, (movementQuality + balance + symmetry) / 3) / 100;

    // Store movement history
    movementHistoryRef.current.push({
      timestamp: Date.now(),
      landmarks: results.poseLandmarks,
      movements,
      frameCount: frameCountRef.current++
    });

    // Keep only last 100 frames
    if (movementHistoryRef.current.length > 100) {
      movementHistoryRef.current.shift();
    }

    setPoseData({
      landmarks: results.poseLandmarks,
      movements,
      isCorrectForm: movementQuality > 70 && balance > 60,
      confidence,
      feedback,
      exercisePhase
    });
  }, [exerciseType, analyzeJointAngles, calculateRangeOfMotion, assessMovementQuality, analyzeBalance, detectFatigue, detectPainIndicators, generateFeedback]);

  useEffect(() => {
    const initializePose = async () => {
      try {
        const pose = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        pose.setOptions({
          modelComplexity: 2,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5
        });

        pose.onResults(onResults);
        poseRef.current = pose;

        if (videoRef.current) {
          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (poseRef.current && videoRef.current) {
                await poseRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480
          });
          cameraRef.current = camera;
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing advanced pose detection:', error);
      }
    };

    initializePose();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, [onResults, videoRef]);

  return { poseData, isInitialized };
};
