-- Create a table for chat sessions
create table chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text,
  created_at timestamptz default now()
);

-- Add session_id to conversations table
alter table conversations add column session_id uuid references chat_sessions(id) on delete cascade;

-- (Optional) Policy updates may be needed if RLS is enabled
-- ENABLE ROW LEVEL SECURITY on chat_sessions;
-- CREATE POLICY "Users can see their own sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert their own sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can delete their own sessions" ON chat_sessions FOR DELETE USING (auth.uid() = user_id);
