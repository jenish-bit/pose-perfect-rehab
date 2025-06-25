import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Brain,
  Calendar,
  FileText,
  Settings,
  Plus,
  Eye,
  MessageSquare
} from 'lucide-react';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  age: number;
  severity_level: string;
  last_session: string;
  total_sessions: number;
  avg_accuracy: number;
  progress_trend: number;
}

interface SessionData {
  id: string;
  patient_name: string;
  exercise_title: string;
  accuracy_score: number;
  reps_completed: number;
  completed_at: string;
  movement_quality: number;
  fatigue_level: number;
  pain_indicators: string[];
}

const TherapistDashboard: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [recentSessions, setRecentSessions] = useState<SessionData[]>([]);
  const [customExercises, setCustomExercises] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalPatients: 0,
    activeSessions: 0,
    avgImprovement: 0,
    alertsCount: 0
  });
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch patients (mock data for now - in real implementation, you'd have a patients table)
      const patientsData = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          age: 65,
          severity_level: 'moderate',
          last_session: '2024-01-15',
          total_sessions: 45,
          avg_accuracy: 78,
          progress_trend: 12
        },
        {
          id: '2',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
          age: 58,
          severity_level: 'mild',
          last_session: '2024-01-14',
          total_sessions: 32,
          avg_accuracy: 85,
          progress_trend: 8
        }
      ];
      setPatients(patientsData);

      // Fetch recent sessions with movement analysis
      const { data: sessions, error: sessionsError } = await supabase
        .from('exercise_sessions')
        .select(`
          id,
          reps_completed,
          accuracy_score,
          completed_at,
          exercises (title),
          movement_analysis (
            movement_quality_score,
            fatigue_level,
            pain_indicators
          )
        `)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (sessionsError) throw sessionsError;

      const formattedSessions = sessions?.map(session => {
        // Safely handle pain_indicators which comes from the database as Json type
        let painIndicators: string[] = [];
        const painData = session.movement_analysis?.[0]?.pain_indicators;
        
        if (Array.isArray(painData)) {
          painIndicators = painData.map(item => String(item));
        } else if (typeof painData === 'string') {
          try {
            const parsed = JSON.parse(painData);
            painIndicators = Array.isArray(parsed) ? parsed.map(item => String(item)) : [];
          } catch {
            painIndicators = [];
          }
        }

        return {
          id: session.id,
          patient_name: 'Patient', // Would be fetched from patient data
          exercise_title: session.exercises?.title || 'Unknown Exercise',
          accuracy_score: session.accuracy_score || 0,
          reps_completed: session.reps_completed || 0,
          completed_at: session.completed_at,
          movement_quality: (session.movement_analysis?.[0]?.movement_quality_score || 0) * 100,
          fatigue_level: session.movement_analysis?.[0]?.fatigue_level || 0,
          pain_indicators: painIndicators
        };
      }) || [];

      setRecentSessions(formattedSessions);

      // Fetch custom exercises
      const { data: exercises, error: exercisesError } = await supabase
        .from('custom_exercises')
        .select('*')
        .eq('therapist_id', user?.id)
        .order('created_at', { ascending: false });

      if (exercisesError) throw exercisesError;
      setCustomExercises(exercises || []);

      // Calculate analytics
      setAnalytics({
        totalPatients: patientsData.length,
        activeSessions: formattedSessions.filter(s => 
          new Date(s.completed_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
        avgImprovement: Math.round(patientsData.reduce((acc, p) => acc + p.progress_trend, 0) / patientsData.length),
        alertsCount: formattedSessions.filter(s => s.pain_indicators.length > 0 || s.fatigue_level > 7).length
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const PatientCard = ({ patient }: { patient: Patient }) => (
    <Card className={`cursor-pointer transition-all hover:shadow-md ${
      selectedPatient === patient.id ? 'ring-2 ring-blue-500' : ''
    }`} onClick={() => setSelectedPatient(patient.id)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold">{patient.first_name} {patient.last_name}</h3>
            <p className="text-sm text-gray-600">Age: {patient.age}</p>
          </div>
          <Badge variant={patient.severity_level === 'mild' ? 'default' : 
                         patient.severity_level === 'moderate' ? 'secondary' : 'destructive'}>
            {patient.severity_level}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-semibold">{patient.avg_accuracy}%</span>
          </div>
          <Progress value={patient.avg_accuracy} />
          
          <div className="flex justify-between text-xs text-gray-600">
            <span>{patient.total_sessions} sessions</span>
            <span className={`font-semibold ${patient.progress_trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {patient.progress_trend > 0 ? '+' : ''}{patient.progress_trend}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Therapist Dashboard</h1>
              <p className="text-sm text-gray-500">Monitor patient progress and manage treatments</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Exercise
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Active patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeSessions}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Improvement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{analytics.avgImprovement}%</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{analytics.alertsCount}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
            <TabsTrigger value="exercises">Custom Exercises</TabsTrigger>
            <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Patient List</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {patients.map(patient => (
                      <PatientCard key={patient.id} patient={patient} />
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                {selectedPatient ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Patient Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const patient = patients.find(p => p.id === selectedPatient);
                        if (!patient) return null;
                        
                        return (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {patient.first_name} {patient.last_name}
                                </h3>
                                <p className="text-gray-600">{patient.email}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="mb-2">
                                  {patient.severity_level} severity
                                </Badge>
                                <p className="text-sm text-gray-600">Age: {patient.age}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{patient.total_sessions}</div>
                                <div className="text-sm text-gray-600">Total Sessions</div>
                              </div>
                              <div className="p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{patient.avg_accuracy}%</div>
                                <div className="text-sm text-gray-600">Avg Accuracy</div>
                              </div>
                              <div className="p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">+{patient.progress_trend}%</div>
                                <div className="text-sm text-gray-600">Improvement</div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="font-semibold">Recent Progress</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Movement Quality</span>
                                  <span>85%</span>
                                </div>
                                <Progress value={85} />
                                <div className="flex justify-between text-sm">
                                  <span>Exercise Compliance</span>
                                  <span>92%</span>
                                </div>
                                <Progress value={92} />
                                <div className="flex justify-between text-sm">
                                  <span>Recovery Rate</span>
                                  <span>78%</span>
                                </div>
                                <Progress value={78} />
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Send Message
                              </Button>
                              <Button variant="outline" size="sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Session
                              </Button>
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                View Reports
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-96">
                      <div className="text-center text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a patient to view details</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Exercise Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.map(session => (
                    <div key={session.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{session.patient_name}</h3>
                          <p className="text-sm text-gray-600">{session.exercise_title}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={session.accuracy_score > 0.8 ? "default" : "secondary"}>
                            {Math.round(session.accuracy_score * 100)}% accuracy
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(session.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Reps:</span>
                          <span className="font-semibold ml-1">{session.reps_completed}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Quality:</span>
                          <span className="font-semibold ml-1">{Math.round(session.movement_quality)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Fatigue:</span>
                          <span className="font-semibold ml-1">{session.fatigue_level}/10</span>
                        </div>
                        <div>
                          {session.pain_indicators.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Pain Detected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercises" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Custom Exercises</CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customExercises.map((exercise: any) => (
                    <Card key={exercise.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{exercise.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">
                            Level {exercise.difficulty_level}
                          </Badge>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-1">Recovery Prediction</h4>
                      <p className="text-sm text-blue-700">
                        Based on current progress, Patient John Doe is predicted to achieve 85% 
                        functional recovery within 3 months.
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-1">Exercise Recommendation</h4>
                      <p className="text-sm text-green-700">
                        Increase balance training intensity for improved stability scores.
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-1">Attention Required</h4>
                      <p className="text-sm text-orange-700">
                        Patient Jane Smith shows fatigue patterns. Consider rest intervals.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Overall Improvement</span>
                        <span className="text-sm text-green-600 font-semibold">+15%</span>
                      </div>
                      <Progress value={85} className="mb-1" />
                      <p className="text-xs text-gray-600">Compared to last month</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Exercise Compliance</span>
                        <span className="text-sm text-blue-600 font-semibold">92%</span>
                      </div>
                      <Progress value={92} className="mb-1" />
                      <p className="text-xs text-gray-600">Patients completing assigned exercises</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Session Quality</span>
                        <span className="text-sm text-purple-600 font-semibold">78%</span>
                      </div>
                      <Progress value={78} className="mb-1" />
                      <p className="text-xs text-gray-600">Average movement quality score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TherapistDashboard;
