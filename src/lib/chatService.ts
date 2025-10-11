import { supabase, Project, Message } from './supabaseClient';
import { auth } from './firebase';

// Get current user ID from Firebase Auth
export const getCurrentUserId = (): string | null => {
  return auth.currentUser?.uid || null;
};

// Create a new project
export const createProject = async (
  name: string,
  type: 'chat' | 'code' | 'design' | 'video' = 'chat',
  description?: string
): Promise<Project> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name,
      type,
      description: description || '',
      ai_model: 'openai',
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all projects for current user
export const getProjects = async (): Promise<Project[]> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Subscribe to projects (real-time)
export const subscribeToProjects = (callback: (projects: Project[]) => void) => {
  const loadProjects = async () => {
    const projects = await getProjects();
    callback(projects);
  };

  loadProjects();

  const channel = supabase
    .channel('projects-changes')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
      },
      () => {
        loadProjects();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Add message to project
export const addMessage = async (
  projectId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<Message> => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      project_id: projectId,
      role,
      content,
    })
    .select()
    .single();

  if (error) throw error;

  // Update project updated_at
  await supabase
    .from('projects')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', projectId);

  return data;
};

// Get messages for a project
export const getMessages = async (projectId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Subscribe to messages (real-time)
export const subscribeToMessages = (
  projectId: string,
  callback: (messages: Message[]) => void
) => {
  const loadMessages = async () => {
    const messages = await getMessages(projectId);
    callback(messages);
  };

  loadMessages();

  const channel = supabase
    .channel(`messages-${projectId}`)
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`,
      },
      () => {
        loadMessages();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Delete project
export const deleteProject = async (projectId: string): Promise<void> => {
  // Delete all messages first
  await supabase.from('messages').delete().eq('project_id', projectId);

  // Delete project
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) throw error;
};
