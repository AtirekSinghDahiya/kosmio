import React, { useState } from 'react';
import { Plus, Search, LogOut, MessageSquare, Code, Palette, Video, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Project } from '../../types';
import { ConfirmDialog } from '../Common/ConfirmDialog';

interface ChatSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onNewChat: () => void;
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  projects,
  activeProjectId,
  onNewChat,
  onSelectProject,
  onDeleteProject,
  onRenameProject,
}) => {
  const { signOut, userData } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'code': return Code;
      case 'design': return Palette;
      case 'video': return Video;
      default: return MessageSquare;
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedProjects = filteredProjects.reduce((groups, project) => {
    const today = new Date();
    const projectDate = (project as any).updatedAt?.toDate ? (project as any).updatedAt.toDate() : new Date();
    const diffDays = Math.floor((today.getTime() - projectDate.getTime()) / (1000 * 60 * 60 * 24));

    let group = 'Older';
    if (diffDays === 0) group = 'Today';
    else if (diffDays === 1) group = 'Yesterday';
    else if (diffDays < 7) group = 'This Week';

    if (!groups[group]) groups[group] = [];
    groups[group].push(project);
    return groups;
  }, {} as Record<string, Project[]>);

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Older'];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`h-screen glass-panel border-r border-white/10 flex flex-col transition-all duration-300 ${
        isHovered ? 'w-64' : 'w-16'
      }`}
    >
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00FFF0]/30 to-[#8A2BE2]/30 flex items-center justify-center flex-shrink-0 p-1">
            <img
              src="/Black Geometric Tech Business Logo.png"
              alt="Kosmio"
              className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(0,255,240,0.5)]"
            />
          </div>
          {isHovered && (
            <span className="text-white font-bold text-base whitespace-nowrap animate-fade-in bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] bg-clip-text text-transparent">
              Kosmio
            </span>
          )}
        </div>
      </div>

      <div className="p-3">
        <button
          onClick={onNewChat}
          className={`w-full flex items-center gap-2 bg-gradient-to-r from-[#00FFF0]/20 to-[#8A2BE2]/20 hover:from-[#00FFF0]/30 hover:to-[#8A2BE2]/30 rounded-xl text-white text-sm font-medium transition-all border border-white/10 hover:border-[#00FFF0]/50 button-press ${
            isHovered ? 'px-3 py-2.5 justify-start' : 'p-2.5 justify-center'
          }`}
          title={!isHovered ? 'New Chat' : ''}
        >
          <Plus className="w-5 h-5 flex-shrink-0" />
          {isHovered && <span className="animate-fade-in">New Chat</span>}
        </button>
      </div>

      {isHovered && projects.length > 0 && (
        <div className="px-3 pb-3 animate-fade-in">
          <div className="relative glass-panel rounded-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-2 bg-transparent border-none text-white text-sm placeholder-white/40 focus:outline-none"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
        {projects.length === 0 ? (
          <div className="flex items-center justify-center h-32 px-4">
            {isHovered && (
              <p className="text-white/40 text-xs text-center animate-fade-in">
                Start a new chat to begin
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {groupOrder.map(group => {
              const groupProjects = groupedProjects[group];
              if (!groupProjects || groupProjects.length === 0) return null;

              return (
                <div key={group}>
                  {isHovered && (
                    <div className="px-2 py-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider animate-fade-in">
                      {group}
                    </div>
                  )}
                  <div className="space-y-1">
                    {groupProjects.map((project) => {
                      const Icon = getProjectIcon(project.type);
                      const isActive = activeProjectId === project.id;

                      return (
                        <div key={project.id} className="relative group/item">
                          <button
                            onClick={() => onSelectProject(project.id)}
                            className={`w-full flex items-start gap-2 rounded-lg transition-all group text-left button-press border ${
                              isActive
                                ? 'bg-white/10 text-white border-[#00FFF0]/30'
                                : 'text-white/70 hover:bg-white/10 hover:text-white border-transparent hover:border-white/10'
                            } ${isHovered ? 'px-3 py-2 pr-20' : 'p-2 justify-center'}`}
                            title={!isHovered ? project.name : ''}
                          >
                            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-colors ${
                              isActive ? 'text-[#00FFF0]' : 'group-hover:text-[#00FFF0]'
                            }`} />
                            {isHovered && (
                              <div className="flex-1 min-w-0 animate-fade-in">
                                <p className="text-xs font-medium truncate">{project.name}</p>
                                <p className="text-[10px] text-white/40 mt-0.5 capitalize">{project.type} Project</p>
                              </div>
                            )}
                          </button>
                          {isHovered && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-item/item:opacity-100 group-hover/item:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingProjectId(project.id);
                                  setEditingName(project.name);
                                }}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all duration-200"
                                title="Rename project"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('🗑️ Delete button clicked for project:', project.id, project.name);
                                  setProjectToDelete({ id: project.id, name: project.name || 'this project' });
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-white/40 hover:text-white transition-all duration-200"
                                title="Delete project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/10 space-y-2">
        {userData && isHovered && (
          <div className="glass-panel rounded-xl p-3 border-white/10 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/70 font-medium">Token Usage</span>
              <span className="text-xs font-bold text-[#00FFF0] uppercase tracking-wide">
                {userData.plan}
              </span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(((userData.tokensUsed || 0) / (userData.tokensLimit || 1)) * 100, 100)}%`
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>{(userData.tokensUsed || 0).toLocaleString()}</span>
                <span>{(userData.tokensLimit || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={signOut}
          className={`w-full flex items-center gap-2 rounded-xl text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm border border-transparent hover:border-red-500/30 button-press ${
            isHovered ? 'px-3 py-2.5 justify-start' : 'p-2.5 justify-center'
          }`}
          title={!isHovered ? 'Sign Out' : ''}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {isHovered && <span className="animate-fade-in">Sign Out</span>}
        </button>
      </div>

      {projectToDelete && (
        <ConfirmDialog
          title="Delete Project"
          message={`Are you sure you want to delete "${projectToDelete.name}"?\n\nThis action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={() => {
            onDeleteProject(projectToDelete.id);
            setProjectToDelete(null);
          }}
          onCancel={() => setProjectToDelete(null)}
        />
      )}

      {editingProjectId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel rounded-2xl p-6 max-w-md w-full mx-4 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Rename Project</h3>
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && editingName.trim()) {
                  onRenameProject(editingProjectId, editingName.trim());
                  setEditingProjectId(null);
                }
                if (e.key === 'Escape') {
                  setEditingProjectId(null);
                }
              }}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#00FFF0]/50 mb-4"
              placeholder="Enter new project name"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setEditingProjectId(null)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingName.trim()) {
                    onRenameProject(editingProjectId, editingName.trim());
                    setEditingProjectId(null);
                  }
                }}
                disabled={!editingName.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#00FFF0]/20"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
