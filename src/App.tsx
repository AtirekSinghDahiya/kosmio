import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { LoginPage } from './components/Auth/LoginPage';
import { Sidebar } from './components/Layout/Sidebar';
import { FloatingNavbar } from './components/Layout/FloatingNavbar';
import { CosmicBackground } from './components/Layout/CosmicBackground';
import { MainChat } from './components/Chat/MainChat';
import { ProjectsView } from './components/Projects/ProjectsView';
import { VoiceStudio } from './components/Studio/VoiceStudio';
import { BillingView } from './components/Billing/BillingView';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { SettingsView } from './components/Settings/SettingsView';
import { Project } from './types';

const MainApp: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const { currentView, activeProject, navigateTo } = useNavigation();

  if (!currentUser) {
    return <LoginPage />;
  }

  const handleOpenProject = (project: Project) => {
    if (project.type === 'voice') {
      navigateTo('voice', project);
    } else {
      navigateTo('chat', project);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return <MainChat />;
      case 'projects':
        return <ProjectsView onOpenProject={handleOpenProject} />;
      case 'voice':
        return <VoiceStudio projectId={activeProject?.id} />;
      case 'billing':
        return <BillingView />;
      case 'admin':
        return userData?.plan === 'enterprise' ? <AdminDashboard /> : <MainChat />;
      case 'settings':
        return <SettingsView />;
      default:
        return <MainChat />;
    }
  };

  // Voice Studio renders independently (no sidebar/navbar)
  if (currentView === 'voice') {
    return (
      <div className="h-screen overflow-hidden relative">
        <CosmicBackground />
        <div className="relative z-10 h-screen">
          {renderView()}
        </div>
      </div>
    );
  }

  // Other views use sidebar
  return (
    <div className="h-screen overflow-hidden gradient-background relative">
      <CosmicBackground />
      <div className="relative z-10 h-screen">
        {currentView === 'chat' ? (
          <MainChat />
        ) : (
          <div className="flex h-screen">
            <Sidebar currentView={currentView} onViewChange={(view) => navigateTo(view as 'chat' | 'projects' | 'voice' | 'billing' | 'admin' | 'settings')} />
            <div className="flex-1 ml-16">
              <FloatingNavbar />
              {renderView()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NavigationProvider>
          <MainApp />
        </NavigationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
