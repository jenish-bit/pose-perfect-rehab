
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Brain, 
  Activity, 
  FileText, 
  Settings,
  Plus,
  BarChart3,
  Target,
  Calendar,
  Bell
} from 'lucide-react';

interface NavigationCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  badge?: string;
  onClick: () => void;
  color: string;
}

const NavigationCard: React.FC<NavigationCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  badge, 
  onClick, 
  color 
}) => (
  <Card 
    className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-l-4 ${color}`}
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg ${color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={`h-6 w-6 ${color.replace('border-l-', 'text-')}`} />
        </div>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </CardContent>
  </Card>
);

interface TherapistNavigationProps {
  onNavigate: (section: string) => void;
  patientCount: number;
  alertCount: number;
}

const TherapistNavigation: React.FC<TherapistNavigationProps> = ({ 
  onNavigate, 
  patientCount, 
  alertCount 
}) => {
  const navigationCards = [
    {
      title: 'Patient Management',
      description: 'Monitor patient progress, view detailed analytics, and manage treatment plans',
      icon: Users,
      badge: `${patientCount} Active`,
      color: 'border-l-blue-500',
      section: 'patients'
    },
    {
      title: 'Exercise Builder',
      description: 'Create custom exercises, design therapy programs, and set patient goals',
      icon: Target,
      badge: 'New',
      color: 'border-l-green-500',
      section: 'builder'
    },
    {
      title: 'AI Analytics',
      description: 'Advanced AI insights, movement analysis, and recovery predictions',
      icon: Brain,
      badge: 'Beta',
      color: 'border-l-purple-500',
      section: 'analytics'
    },
    {
      title: 'Session Reports',
      description: 'Comprehensive session data, progress tracking, and performance metrics',
      icon: BarChart3,
      color: 'border-l-orange-500',
      section: 'reports'
    },
    {
      title: 'Treatment Plans',
      description: 'Weekly schedules, exercise assignments, and therapy roadmaps',
      icon: Calendar,
      color: 'border-l-teal-500',
      section: 'plans'
    },
    {
      title: 'Alerts & Notifications',
      description: 'Patient alerts, system notifications, and urgent attention items',
      icon: Bell,
      badge: alertCount > 0 ? `${alertCount} New` : undefined,
      color: 'border-l-red-500',
      section: 'alerts'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Therapist Control Center</h2>
        <p className="text-gray-600">Manage patients, create exercises, and monitor rehabilitation progress</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {navigationCards.map((card, index) => (
          <NavigationCard
            key={index}
            title={card.title}
            description={card.description}
            icon={card.icon}
            badge={card.badge}
            color={card.color}
            onClick={() => onNavigate(card.section)}
          />
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick Actions</h3>
            <p className="text-sm text-gray-600">Common tasks for efficient workflow</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm" onClick={() => onNavigate('new-patient')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate('builder')}>
              <Target className="h-4 w-4 mr-2" />
              New Exercise
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate('settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistNavigation;
