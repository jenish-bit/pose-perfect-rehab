
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap,
  Target,
  Heart,
  AlertTriangle
} from 'lucide-react';

interface PerformanceMetrics {
  repSpeed: number;
  consistency: number;
  accuracy: number;
  fatigue: number;
  tremor: number;
  posture: number;
}

interface AdaptiveSettings {
  targetReps: number;
  restInterval: number;
  difficulty: number;
  assistanceLevel: number;
}

interface NeuroAdaptEngineProps {
  poseData: any;
  currentExercise: string;
  onSettingsChange: (settings: AdaptiveSettings) => void;
  isActive: boolean;
}

export const NeuroAdaptEngine: React.FC<NeuroAdaptEngineProps> = ({
  poseData,
  currentExercise,
  onSettingsChange,
  isActive
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    repSpeed: 75,
    consistency: 80,
    accuracy: 85,
    fatigue: 20,
    tremor: 15,
    posture: 90
  });

  const [adaptiveSettings, setAdaptiveSettings] = useState<AdaptiveSettings>({
    targetReps: 10,
    restInterval: 30,
    difficulty: 5,
    assistanceLevel: 0
  });

  const [adaptationHistory, setAdaptationHistory] = useState<Array<{
    timestamp: Date;
    reason: string;
    change: string;
    metrics: PerformanceMetrics;
  }>>([]);

  const [neuroplasticityScore, setNeuroplasticityScore] = useState(75);
  const [adaptationMode, setAdaptationMode] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  // Analyze performance trends
  const analyzePerformance = useCallback(() => {
    if (!poseData || !isActive) return;

    const newMetrics: PerformanceMetrics = {
      repSpeed: Math.max(0, Math.min(100, poseData.movements?.movementQuality * 0.8 + Math.random() * 20)),
      consistency: Math.max(0, Math.min(100, poseData.movements?.symmetryScore * 0.9 + Math.random() * 20)),
      accuracy: Math.max(0, Math.min(100, poseData.confidence * 100)),
      fatigue: Math.max(0, Math.min(100, poseData.movements?.fatigueLevel * 10)),
      tremor: Math.max(0, Math.min(100, Math.random() * 30)),
      posture: Math.max(0, Math.min(100, poseData.movements?.balanceScore))
    };

    setMetrics(newMetrics);

    // Calculate neuroplasticity potential
    const plasticityScore = (
      newMetrics.consistency * 0.3 +
      newMetrics.accuracy * 0.25 +
      (100 - newMetrics.fatigue) * 0.2 +
      newMetrics.repSpeed * 0.15 +
      newMetrics.posture * 0.1
    );
    setNeuroplasticityScore(plasticityScore);

    // Trigger adaptive adjustments
    performAdaptiveAdjustment(newMetrics);
  }, [poseData, isActive, adaptationMode]);

  // Core adaptive logic
  const performAdaptiveAdjustment = useCallback((currentMetrics: PerformanceMetrics) => {
    const { fatigue, accuracy, consistency, repSpeed } = currentMetrics;
    let newSettings = { ...adaptiveSettings };
    let adaptationReason = '';
    let adaptationChange = '';

    // Fatigue-based adjustments
    if (fatigue > 70) {
      newSettings.targetReps = Math.max(3, newSettings.targetReps - 2);
      newSettings.restInterval = Math.min(120, newSettings.restInterval + 15);
      newSettings.assistanceLevel = Math.min(5, newSettings.assistanceLevel + 1);
      adaptationReason = 'High fatigue detected';
      adaptationChange = 'Reduced reps, increased rest';
    } else if (fatigue < 30 && accuracy > 85 && consistency > 80) {
      newSettings.targetReps = Math.min(20, newSettings.targetReps + 1);
      newSettings.difficulty = Math.min(10, newSettings.difficulty + 0.5);
      adaptationReason = 'Excellent performance';
      adaptationChange = 'Increased challenge level';
    }

    // Accuracy-based adjustments
    if (accuracy < 60) {
      newSettings.difficulty = Math.max(1, newSettings.difficulty - 1);
      newSettings.assistanceLevel = Math.min(5, newSettings.assistanceLevel + 1);
      adaptationReason = 'Low accuracy detected';
      adaptationChange = 'Simplified movement pattern';
    }

    // Consistency-based adjustments
    if (consistency < 50) {
      newSettings.restInterval = Math.min(90, newSettings.restInterval + 10);
      adaptationReason = 'Movement inconsistency';
      adaptationChange = 'Extended recovery time';
    }

    // Apply changes if significant
    if (JSON.stringify(newSettings) !== JSON.stringify(adaptiveSettings)) {
      setAdaptiveSettings(newSettings);
      onSettingsChange(newSettings);

      // Log adaptation
      setAdaptationHistory(prev => [...prev.slice(-9), {
        timestamp: new Date(),
        reason: adaptationReason,
        change: adaptationChange,
        metrics: currentMetrics
      }]);
    }
  }, [adaptiveSettings, onSettingsChange]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(analyzePerformance, 2000);
      return () => clearInterval(interval);
    }
  }, [analyzePerformance, isActive]);

  const getAdaptationStatus = () => {
    const recentAdaptations = adaptationHistory.slice(-3);
    if (recentAdaptations.length === 0) return 'stable';
    if (recentAdaptations.some(a => a.reason.includes('fatigue'))) return 'reducing';
    if (recentAdaptations.some(a => a.reason.includes('performance'))) return 'increasing';
    return 'adjusting';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reducing': return 'text-orange-600 bg-orange-100';
      case 'increasing': return 'text-green-600 bg-green-100';
      case 'adjusting': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main NeuroAdapt Control Panel */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">NeuroAdapt AI Engine</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isActive ? 'default' : 'secondary'}>
                  {isActive ? 'Active' : 'Standby'}
                </Badge>
                <Badge className={getStatusColor(getAdaptationStatus())}>
                  {getAdaptationStatus()}
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Neuroplasticity Score */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Neuroplasticity Potential
              </span>
              <span className="text-2xl font-bold text-purple-600">
                {Math.round(neuroplasticityScore)}%
              </span>
            </div>
            <Progress value={neuroplasticityScore} className="mb-2" />
            <p className="text-xs text-gray-600">
              Based on movement consistency, accuracy, and adaptation rate
            </p>
          </div>

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { key: 'repSpeed', label: 'Rep Speed', icon: Activity, value: metrics.repSpeed },
              { key: 'consistency', label: 'Consistency', icon: Target, value: metrics.consistency },
              { key: 'accuracy', label: 'Accuracy', icon: TrendingUp, value: metrics.accuracy },
              { key: 'fatigue', label: 'Fatigue', icon: Heart, value: metrics.fatigue, invert: true },
              { key: 'tremor', label: 'Tremor', icon: AlertTriangle, value: metrics.tremor, invert: true },
              { key: 'posture', label: 'Posture', icon: TrendingUp, value: metrics.posture },
            ].map(({ key, label, icon: Icon, value, invert }) => (
              <div key={key} className="bg-white p-3 rounded-lg text-center border">
                <Icon className={`h-5 w-5 mx-auto mb-2 ${
                  invert 
                    ? (value > 60 ? 'text-red-500' : 'text-green-500')
                    : (value > 70 ? 'text-green-500' : 'text-orange-500')
                }`} />
                <div className="text-lg font-bold">{Math.round(value)}%</div>
                <div className="text-xs text-gray-600">{label}</div>
              </div>
            ))}
          </div>

          {/* Current Adaptive Settings */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Current Adaptive Settings
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Target Reps:</span>
                <div className="font-semibold">{adaptiveSettings.targetReps}</div>
              </div>
              <div>
                <span className="text-gray-600">Rest Interval:</span>
                <div className="font-semibold">{adaptiveSettings.restInterval}s</div>
              </div>
              <div>
                <span className="text-gray-600">Difficulty:</span>
                <div className="font-semibold">{adaptiveSettings.difficulty}/10</div>
              </div>
              <div>
                <span className="text-gray-600">Assistance:</span>
                <div className="font-semibold">{adaptiveSettings.assistanceLevel}/5</div>
              </div>
            </div>
          </div>

          {/* Adaptation Mode Controls */}
          <div className="flex gap-2">
            {(['conservative', 'moderate', 'aggressive'] as const).map((mode) => (
              <Button
                key={mode}
                variant={adaptationMode === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAdaptationMode(mode)}
                className="capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Adaptations Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent AI Adaptations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {adaptationHistory.slice(-5).reverse().map((adaptation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{adaptation.reason}</div>
                      <div className="text-xs text-gray-600">{adaptation.change}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {adaptation.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {adaptationHistory.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>AI adaptations will appear here as you exercise</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
