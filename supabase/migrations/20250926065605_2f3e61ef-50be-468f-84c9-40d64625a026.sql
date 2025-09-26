-- Create stretching_sessions table
CREATE TABLE public.stretching_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercises_completed JSONB NOT NULL DEFAULT '[]',
  total_exercises INTEGER NOT NULL DEFAULT 6,
  completed_count INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, session_date)
);

-- Enable Row Level Security
ALTER TABLE public.stretching_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for stretching_sessions
CREATE POLICY "Users can view their own stretching sessions" 
ON public.stretching_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stretching sessions" 
ON public.stretching_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stretching sessions" 
ON public.stretching_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stretching sessions" 
ON public.stretching_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_stretching_sessions_updated_at
BEFORE UPDATE ON public.stretching_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_stretching_sessions_user_date ON public.stretching_sessions(user_id, session_date);