export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

export type JobApplicationStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

export interface JobApplication {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  job_description: string | null;
  job_url: string | null;
  location: string | null;
  salary_range: string | null;
  status: JobApplicationStatus;
  applied_date: string | null;
  notes: string | null;
  resume_url: string | null;
  cover_letter_url: string | null;
  ai_match_score: number | null;
  ai_missing_keywords: string[] | null;
  ai_suggestions: string[] | null;
  created_at: string;
  updated_at: string;
}

export type InterviewType = 'phone' | 'technical' | 'behavioral' | 'onsite' | 'other';

export interface Interview {
  id: string;
  application_id: string;
  user_id: string;
  interview_date: string | null;
  interview_type: InterviewType | null;
  notes: string | null;
  created_at: string;
}

export interface AIScoreResult {
  match_score: number;
  found_keywords: string[];
  missing_keywords: string[];
  suggestions: string[];
  ats_rating: 'Poor' | 'Fair' | 'Good' | 'Excellent';
}

export interface DashboardMetrics {
  totalApplications: number;
  interviewsScheduled: number;
  offersReceived: number;
  successRate: number;
}