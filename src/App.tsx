import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { checkSubscriptionExpiration } from './lib/subscriptionService';
import { ToastProvider } from './contexts/ToastContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LandingRouter } from './components/Landing/LandingRouter';
import { LoginPage } from './components/Auth/LoginPage';
import { Sidebar } from './components/Layout/Sidebar';
import { FloatingNavbar } from './components/Layout/FloatingNavbar';
import { CosmicBackground } from './components/Layout/CosmicBackground';
import { MainChat } from './components/Chat/MainChat';
import { ProjectsView } from './components/Projects/ProjectsView';
import { VoiceStudio } from './components/Studio/VoiceStudio';
import { CodeStudio } from './components/Studio/CodeStudio';
import { DesignStudio } from './components/Studio/DesignStudio';
import { VideoStudio } from './components/Studio/VideoStudio';
import { BillingView } from './components/Billing/BillingView';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { SettingsView } from './components/Settings/SettingsView';
import { Project } from './types';

const MainApp: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const { currentView, activeProject, navigateTo } = useNavigation();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (currentUser) {
      checkSubscriptionExpiration();
      const interval = setInterval(() => {
        checkSubscriptionExpiration();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Dynamic page title based on current view
  useEffect(() => {
    const titles: Record<string, string> = {
      chat: 'KroniQ - AI Chat',
      projects: 'KroniQ - My Projects',
      voice: 'KroniQ - Voice Studio',
      code: 'KroniQ - Code Studio',
      design: 'KroniQ - Design Studio',
      video: 'KroniQ - Video Studio',
      billing: 'KroniQ - Billing',
      admin: 'KroniQ - Admin Dashboard',
      settings: 'KroniQ - Settings',
    };
    document.title = titles[currentView] || 'KroniQ - AI Development Studio';
  }, [currentView]);

  // Show public landing page for non-authenticated users
  if (!currentUser) {
    if (showLogin) {
      return <LoginPage />;
    }
    return <LandingRouter onGetStarted={() => setShowLogin(true)} />;
  }

  const handleOpenProject = (project: Project) => {
    const typeToView: Record<string, typeof currentView> = {
      voice: 'voice',
      code: 'code',
      design: 'design',
      video: 'video',
      chat: 'chat',
    };
    const view = typeToView[project.type] || 'chat';
    navigateTo(view, project);
  };

  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return <MainChat />;
      case 'projects':
        return <ProjectsView onOpenProject={handleOpenProject} />;
      case 'voice':
        return <VoiceStudio projectId={activeProject?.id} />;
      case 'code':
        return <CodeStudio projectId={activeProject?.id} />;
      case 'design':
        return <DesignStudio projectId={activeProject?.id} />;
      case 'video':
        return <VideoStudio projectId={activeProject?.id} />;
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

  // Studios render independently (no sidebar/navbar)
  if (['voice', 'code', 'design', 'video'].includes(currentView)) {
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
        {currentView === 'chat' || currentView === 'settings' ? (
          renderView()
        ) : (
          <div className="flex h-screen">
            <Sidebar currentView={currentView} onViewChange={(view) => navigateTo(view as any)} />
            <div className="flex-1 ml-0 md:ml-16">
              <FloatingNavbar />
              <div className="pt-16 md:pt-0">
                {renderView()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <NavigationProvider>
            <MainApp />
          </NavigationProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
