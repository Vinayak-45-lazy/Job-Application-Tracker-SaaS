import { z } from 'zod'

export const applicationSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  job_title: z.string().min(1, 'Job title is required'),
  job_description: z.string().optional().nullable(),
  job_url: z.string()
    .url('Invalid URL')
    .or(z.literal(''))
    .optional()
    .nullable(),
  location: z.string().optional().nullable(),
  salary_range: z.string().optional().nullable(),
  status: z.enum(['saved', 'applied', 'interview', 'offer', 'rejected']),
  applied_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  resume_url: z.string().optional().nullable(),
  cover_letter_url: z.string().optional().nullable(),
})

export const interviewSchema = z.object({
  interview_date: z.string().min(1, 'Interview date and time is required'),
  interview_type: z.enum(['phone', 'technical', 'behavioral', 'onsite', 'other']),
  notes: z.string().optional().nullable(),
})

export const settingsSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
})

export const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})

export type ApplicationFormValues = z.infer<typeof applicationSchema>
export type InterviewFormValues = z.infer<typeof interviewSchema>
export type SettingsFormValues = z.infer<typeof settingsSchema>
export type PasswordFormValues = z.infer<typeof passwordSchema>