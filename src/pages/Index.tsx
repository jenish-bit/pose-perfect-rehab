
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowDown, ArrowUp, Activity, Heart, Users, Target } from "lucide-react";

const Index = () => {
  const [currentSection, setCurrentSection] = useState('hero');

  const exerciseCategories = [
    {
      icon: Users,
      title: "Arm & Shoulder",
      count: 24,
      description: "Improve range of motion and strength",
      color: "bg-blue-100 text-blue-700"
    },
    {
      icon: Activity,
      title: "Leg & Mobility",
      count: 18,
      description: "Walking, balance, and lower body strength",
      color: "bg-green-100 text-green-700"
    },
    {
      icon: Target,
      title: "Balance & Coordination",
      count: 16,
      description: "Fall prevention and stability training",
      color: "bg-purple-100 text-purple-700"
    },
    {
      icon: Heart,
      title: "Core & Posture",
      count: 12,
      description: "Core strength and postural control",
      color: "bg-orange-100 text-orange-700"
    }
  ];

  const progressData = [
    { week: "Week 1", completed: 85 },
    { week: "Week 2", completed: 92 },
    { week: "Week 3", completed: 78 },
    { week: "Week 4", completed: 96 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SR</span>
              </div>
              <span className="text-xl font-bold text-gray-900">StrokeRehabPro</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#exercises" className="text-gray-600 hover:text-blue-600 transition-colors">Exercises</a>
              <a href="#dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</a>
              <Button variant="outline" className="mr-2">Sign In</Button>
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
              🎯 AI-Powered Rehabilitation
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Recovery,
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Real Progress</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Personalized stroke rehabilitation with real-time AI feedback, guided exercises, 
              and progress tracking. Recover at your own pace with intelligent posture correction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-8 py-3">
                Start Your Recovery Journey
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3">
                Watch Demo Video
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16" id="features">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-blue-600 rounded"></div>
                </div>
                <CardTitle className="text-xl">Real-Time AI Feedback</CardTitle>
                <CardDescription>
                  Advanced pose detection counts reps and corrects your form in real-time using your webcam
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-green-600 rounded"></div>
                </div>
                <CardTitle className="text-xl">Personalized Plans</CardTitle>
                <CardDescription>
                  Custom exercise programs tailored to your specific needs, severity level, and recovery goals
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-purple-600 rounded"></div>
                </div>
                <CardTitle className="text-xl">Progress Tracking</CardTitle>
                <CardDescription>
                  Detailed analytics and reports to track your improvement and share with caregivers
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Exercise Library */}
      <section className="py-16 bg-white" id="exercises">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Exercise Library
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Over 70 guided exercises designed by rehabilitation specialists for every stage of recovery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {exerciseCategories.map((category, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <category.icon size={24} />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                  <Badge variant="secondary" className="w-fit mx-auto mt-2">
                    {category.count} exercises
                  </Badge>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Exercise Preview */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Try a Sample Exercise</CardTitle>
              <CardDescription>Experience our AI feedback system with a simple arm raise exercise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-6">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowUp size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Webcam Feed & AI Analysis</h3>
                  <p className="text-gray-300">Your live pose detection will appear here</p>
                  <Badge className="mt-4 bg-green-600">Ready to start tracking</Badge>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3">Exercise Instructions</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Sit comfortably with back straight
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Slowly raise your affected arm up
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Hold for 3 seconds at the top
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Lower arm slowly and repeat
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3">AI Feedback</h4>
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-green-700 font-medium">✓ Great posture!</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <span className="text-blue-700 font-medium">Rep count: 8/10</span>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <span className="text-orange-700 font-medium">💡 Try lifting a bit higher</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 bg-gray-50" id="dashboard">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Track Your Progress
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Detailed insights into your recovery journey with shareable reports for your care team
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Weekly Progress</CardTitle>
                <CardDescription>Your exercise completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.map((week, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{week.week}</span>
                        <span className="text-sm text-gray-600">{week.completed}%</span>
                      </div>
                      <Progress value={week.completed} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Recovery Milestones</CardTitle>
                <CardDescription>Celebrate your achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-green-800">First Week Complete!</p>
                      <p className="text-sm text-green-600">Completed 7 days of exercises</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">Range of Motion Improved</p>
                      <p className="text-sm text-blue-600">15% increase in arm mobility</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🎯</span>
                    </div>
                    <div>
                      <p className="font-medium text-purple-800">Consistency Champion</p>
                      <p className="text-sm text-purple-600">14-day exercise streak</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your Recovery Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of stroke survivors who are regaining strength and independence with StrokeRehabPro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 font-semibold">
              Start Free 14-Day Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
              Schedule Demo Call
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SR</span>
                </div>
                <span className="text-xl font-bold">StrokeRehabPro</span>
              </div>
              <p className="text-gray-400">
                Empowering stroke survivors with intelligent rehabilitation technology.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Exercise Library</li>
                <li>AI Feedback</li>
                <li>Progress Tracking</li>
                <li>Caregiver Dashboard</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Community Forum</li>
                <li>Medical Resources</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Accessibility</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StrokeRehabPro. All rights reserved. Built with care for stroke survivors.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
