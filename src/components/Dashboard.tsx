
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  TrendingUp, 
  Calendar, 
  Target,
  Users,
  Brain,
  Stethoscope,
  Dumbbell,
  Play,
  BookOpen,
  Settings,
  LogOut,
  Zap,
  Award,
  Sparkles
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const dashboardStats = [
    {
      title: "Active Sessions",
      value: "12",
      change: "+2.5%",
      icon: Activity,
      color: "text-blue-600"
    },
    {
      title: "Weekly Progress",
      value: "78%",
      change: "+12%",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Exercises Completed",
      value: "156",
      change: "+18",
      icon: Target,
      color: "text-purple-600"
    },
    {
      title: "Streak Days",
      value: "24",
      change: "+3",
      icon: Award,
      color: "text-orange-600"
    }
  ];

  const quickActions = [
    {
      title: "Advanced AI Features",
      description: "Experience cutting-edge AI adaptations, voice coaching, remote monitoring, and emotion analysis",
      icon: Sparkles,
      color: "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100",
      iconColor: "text-purple-600",
      badge: "Next-Gen AI",
      badgeColor: "bg-purple-100 text-purple-800",
      onClick: () => navigate('/ai-features')
    },
    {
      title: "Therapist Dashboard",
      description: "Access professional therapist tools, patient management, and analytics",
      icon: Users,
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      iconColor: "text-blue-600",
      badge: "Professional",
      badgeColor: "bg-blue-100 text-blue-800",
      onClick: () => navigate('/therapist')
    },
    {
      title: "Exercise Builder",
      description: "Create custom exercises and rehabilitation programs",
      icon: Dumbbell,
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      iconColor: "text-green-600",
      badge: "Create",
      badgeColor: "bg-green-100 text-green-800",
      onClick: () => navigate('/exercise-builder')
    },
    {
      title: "Start Exercise Session",
      description: "Begin your rehabilitation exercises with AI guidance",
      icon: Play,
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      iconColor: "text-purple-600",
      badge: "AI Powered",
      badgeColor: "bg-purple-100 text-purple-800",
      onClick: () => navigate('/exercise-session')
    },
    {
      title: "Exercise Library",
      description: "Browse available exercises and view your progress",
      icon: BookOpen,
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
      iconColor: "text-orange-600",
      badge: "Library",
      badgeColor: "bg-orange-100 text-orange-800",
      onClick: () => navigate('/exercises')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">RehabiLite AI</h1>
                  <p className="text-xs text-gray-500">Stroke Rehabilitation Platform</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <Zap className="h-3 w-3 mr-1" />
                AI Active
              </Badge>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Stethoscope className="h-4 w-4" />
                <span>Welcome, {user?.email?.split('@')[0]}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to your Rehabilitation Dashboard
          </h2>
          <p className="text-gray-600">
            Monitor your progress, access professional tools, and continue your recovery journey with AI-powered insights.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-green-600 font-medium mt-1">
                  {stat.change} from last week
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${action.color} border-2`}
              onClick={action.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg bg-white/50 ${action.iconColor}`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                      <Badge variant="secondary" className={`mt-1 ${action.badgeColor}`}>
                        {action.badge}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  Access Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Recovery Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Motor Skills</span>
                  <span className="text-sm text-gray-600">78%</span>
                </div>
                <Progress value={78} className="mb-1" />
                <p className="text-xs text-gray-500">+12% improvement this month</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Balance & Coordination</span>
                  <span className="text-sm text-gray-600">65%</span>
                </div>
                <Progress value={65} className="mb-1" />
                <p className="text-xs text-gray-500">+8% improvement this month</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Speech Therapy</span>
                  <span className="text-sm text-gray-600">82%</span>
                </div>
                <Progress value={82} className="mb-1" />
                <p className="text-xs text-gray-500">+15% improvement this month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-sm">Upper Limb Therapy</h4>
                    <p className="text-xs text-gray-600">Today, 2:00 PM</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    Scheduled
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-sm">Balance Training</h4>
                    <p className="text-xs text-gray-600">Tomorrow, 10:00 AM</p>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    AI Guided
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-sm">Speech Exercises</h4>
                    <p className="text-xs text-gray-600">Friday, 3:30 PM</p>
                  </div>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800">
                    Custom
                  </Badge>
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
