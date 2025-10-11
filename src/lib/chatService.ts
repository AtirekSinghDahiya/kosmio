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
  console.log('📝 addMessage called:', { projectId, role, contentLength: content.length });
  console.log('📝 Content preview:', content.substring(0, 100));

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        project_id: projectId,
        role,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error adding message:', error);
      throw error;
    }

    console.log('✅ Message inserted successfully:', data);

    // Update project updated_at
    const { error: updateError } = await supabase
      .from('projects')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', projectId);

    if (updateError) {
      console.warn('⚠️ Failed to update project timestamp:', updateError);
    }

    console.log('✅ addMessage complete');
    return data;
  } catch (error) {
    console.error('❌ Unexpected error in addMessage:', error);
    throw error;
  }
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

// Delete project (with CASCADE, automatically deletes related data)
export const deleteProject = async (projectId: string): Promise<void> => {
  console.log('🗑️ Deleting project:', projectId);

  try {
    // With CASCADE constraints, just delete the project
    // All related messages, assets, video_jobs, and conversations will be deleted automatically
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('❌ Delete failed:', error);
      throw new Error(`Failed to delete project: ${error.message}`);
    }

    console.log('✅ Project and all related data deleted successfully');
  } catch (error: any) {
    console.error('❌ Delete error:', error);
    throw error;
  }
};
