
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Activity, Calendar, Target, TrendingUp, Play, Dumbbell, Camera } from 'lucide-react';

interface Exercise {
  id: string;
  title: string;
  category: string;
  difficulty_level: string;
}

interface ExerciseSession {
  id: string;
  reps_completed: number;
  accuracy_score: number;
  completed_at: string;
  exercises: Exercise;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [recentSessions, setRecentSessions] = useState<ExerciseSession[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent exercise sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('exercise_sessions')
        .select(`
          id,
          reps_completed,
          accuracy_score,
          completed_at,
          exercises (
            id,
            title,
            category,
            difficulty_level
          )
        `)
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false })
        .limit(5);

      if (sessionsError) throw sessionsError;
      setRecentSessions(sessions || []);

      // Calculate weekly progress (sessions this week)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      
      const { data: weekSessions, error: weekError } = await supabase
        .from('exercise_sessions')
        .select('id')
        .eq('user_id', user?.id)
        .gte('completed_at', weekStart.toISOString());

      if (weekError) throw weekError;
      setWeeklyProgress(weekSessions?.length || 0);

      // Get total sessions count
      const { count, error: countError } = await supabase
        .from('exercise_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      if (countError) throw countError;
      setTotalSessions(count || 0);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SR</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">StrokeRehabPro</h1>
                <p className="text-sm text-gray-500">AI-Powered Recovery Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.user_metadata?.first_name || user?.email?.split('@')[0]}
              </span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Recovery Dashboard</h2>
          <p className="text-gray-600">Track your progress and continue your rehabilitation journey with AI assistance</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/exercises')}>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Dumbbell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Browse Exercises</h3>
                <p className="text-sm text-gray-600">Explore exercise library</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/exercises')}>
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Camera className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Coach Session</h3>
                <p className="text-sm text-gray-600">Start AI-guided exercise</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="flex items-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View Progress</h3>
                <p className="text-sm text-gray-600">Track your improvement</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                Exercises completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weeklyProgress}</div>
              <p className="text-xs text-muted-foreground">
                Sessions this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentSessions.length > 0 
                  ? Math.round(recentSessions.reduce((acc, session) => acc + (session.accuracy_score || 0), 0) / recentSessions.length * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Form accuracy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                Day streak
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Exercise Sessions</CardTitle>
              <CardDescription>Your latest rehabilitation activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.length > 0 ? (
                  recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{session.exercises.title}</p>
                        <p className="text-sm text-gray-600">
                          {session.reps_completed} reps • {session.exercises.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={session.accuracy_score && session.accuracy_score > 0.8 ? "default" : "secondary"}>
                          {session.accuracy_score ? Math.round(session.accuracy_score * 100) : 0}% accuracy
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(session.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No exercise sessions yet</p>
                    <Button onClick={() => navigate('/exercises')}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Your First Exercise
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Goal */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Goal</CardTitle>
              <CardDescription>Progress towards your weekly target</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Exercise Sessions</span>
                    <span className="text-sm text-gray-600">{weeklyProgress}/7</span>
                  </div>
                  <Progress value={(weeklyProgress / 7) * 100} className="h-2" />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Ready to Exercise?</h4>
                  <p className="text-blue-700 text-sm mb-3">
                    Start an AI-guided exercise session with real-time feedback and form analysis.
                  </p>
                  <Button size="sm" onClick={() => navigate('/exercises')} className="bg-blue-600 hover:bg-blue-700">
                    <Camera className="h-4 w-4 mr-2" />
                    Start AI Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
