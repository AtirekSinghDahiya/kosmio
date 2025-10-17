import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { User, Bell, Shield, Trash2, Sun, Moon, ArrowLeft } from 'lucide-react';
import { ChatSidebar } from '../Chat/ChatSidebar';
import { getProjects, deleteProject, renameProject } from '../../lib/chatService';

export const SettingsView: React.FC = () => {
  const { userData, currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { navigateTo } = useNavigation();
  const [notifications, setNotifications] = useState({
    email: true,
    updates: true,
    marketing: false
  });
  const [projects, setProjects] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadProjects = async () => {
      const loadedProjects = await getProjects();
      setProjects(loadedProjects);
    };
    loadProjects();
  }, []);

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId);
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const handleRenameProject = async (projectId: string, newName: string) => {
    await renameProject(projectId, newName);
    setProjects(projects.map(p => p.id === projectId ? { ...p, name: newName } : p));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        projects={projects}
        activeProjectId={null}
        onNewChat={() => navigateTo('chat')}
        onSelectProject={(id) => {
          const project = projects.find(p => p.id === id);
          if (project) navigateTo('chat');
        }}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="min-h-screen p-4 md:p-8">
          <button
            onClick={() => navigateTo('chat')}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Chat</span>
          </button>

          <h1 className="text-4xl font-bold text-white mb-8 bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] bg-clip-text text-transparent">Settings</h1>

        <div className="space-y-6 pb-8">
          <div className="glass-panel rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#00FFF0]/30 to-[#8A2BE2]/30 flex items-center justify-center border border-white/20">
                <User className="w-5 h-5 text-[#00FFF0]" />
              </div>
              <h2 className="text-xl font-bold text-white">Profile Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Display Name</label>
                <input
                  type="text"
                  defaultValue={userData?.displayName || ''}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#00FFF0] focus:border-transparent transition-all"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/50 cursor-not-allowed"
                  disabled
                />
              </div>

              <button className="px-6 py-3 bg-gradient-to-r from-[#00FFF0]/20 to-[#8A2BE2]/20 hover:from-[#00FFF0]/30 hover:to-[#8A2BE2]/30 text-white rounded-lg border border-white/10 hover:border-[#00FFF0]/50 transition-all font-medium">
                Update Profile
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-yellow-500/30 to-orange-500/30 flex items-center justify-center border border-white/20">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-yellow-400" /> : <Sun className="w-5 h-5 text-orange-400" />}
              </div>
              <h2 className="text-xl font-bold text-white">Appearance</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-all">
                <div>
                  <div className="font-medium text-white">Theme</div>
                  <div className="text-sm text-white/60">Switch between light and dark mode</div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="relative inline-flex items-center h-9 rounded-full w-16 transition-all focus:outline-none focus:ring-2 focus:ring-[#00FFF0] border border-white/10"
                  style={{ backgroundColor: theme === 'dark' ? 'rgba(138, 43, 226, 0.3)' : 'rgba(255, 165, 0, 0.3)' }}
                >
                  <span
                    className={`inline-block w-7 h-7 transform rounded-full bg-white shadow-lg transition-transform ${
                      theme === 'dark' ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  >
                    {theme === 'dark' ? (
                      <Moon className="w-4 h-4 text-purple-600 m-auto mt-1.5" />
                    ) : (
                      <Sun className="w-4 h-4 text-orange-500 m-auto mt-1.5" />
                    )}
                  </span>
                </button>
              </label>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500/30 to-pink-500/30 flex items-center justify-center border border-white/20">
                <Bell className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Notifications</h2>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-all">
                <div>
                  <div className="font-medium text-white">Email Notifications</div>
                  <div className="text-sm text-white/60">Receive email about your account activity</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  className="w-5 h-5 text-[#00FFF0] bg-white/10 border-white/20 rounded focus:ring-2 focus:ring-[#00FFF0]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-all">
                <div>
                  <div className="font-medium text-white">Product Updates</div>
                  <div className="text-sm text-white/60">News about product features and updates</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.updates}
                  onChange={(e) => setNotifications({ ...notifications, updates: e.target.checked })}
                  className="w-5 h-5 text-[#00FFF0] bg-white/10 border-white/20 rounded focus:ring-2 focus:ring-[#00FFF0]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-4 rounded-lg hover:bg-white/5 transition-all">
                <div>
                  <div className="font-medium text-white">Marketing Emails</div>
                  <div className="text-sm text-white/60">Receive tips and promotional content</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.marketing}
                  onChange={(e) => setNotifications({ ...notifications, marketing: e.target.checked })}
                  className="w-5 h-5 text-[#00FFF0] bg-white/10 border-white/20 rounded focus:ring-2 focus:ring-[#00FFF0]"
                />
              </label>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500/30 to-emerald-500/30 flex items-center justify-center border border-white/20">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Security</h2>
            </div>

            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-left transition-all">
                <div className="font-medium text-white">Change Password</div>
                <div className="text-sm text-white/60">Update your password</div>
              </button>

              <button className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-left transition-all">
                <div className="font-medium text-white">Two-Factor Authentication</div>
                <div className="text-sm text-white/60">Add an extra layer of security</div>
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-red-500/30 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500/30 to-pink-500/30 flex items-center justify-center border border-red-500/30">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Danger Zone</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="font-medium text-red-400 mb-2">Delete Account</div>
                <div className="text-sm text-red-300/70 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </div>
                <button className="px-6 py-3 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all font-medium">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
