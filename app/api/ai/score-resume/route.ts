import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { groq } from '@/lib/groq'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resumeText, jobDescription } = await request.json()

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: 'resumeText and jobDescription are required' }, { status: 400 })
    }

    // Truncate to avoid token limit issues
    const truncatedResume = resumeText.slice(0, 3000)
    const truncatedJD = jobDescription.slice(0, 2000)

    const prompt = `You are an ATS resume scoring expert. Analyze the resume against the job description below.

RESUME:
${truncatedResume}

JOB DESCRIPTION:
${truncatedJD}

Respond with ONLY a valid JSON object. No explanation, no markdown, no extra text. Just the raw JSON:
{"matchScore":75,"missingKeywords":["keyword1","keyword2"],"foundKeywords":["skill1","skill2"],"suggestions":["suggestion1","suggestion2","suggestion3","suggestion4","suggestion5"],"atsRating":"Good"}`

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an ATS scoring API. You only respond with valid raw JSON. Never add markdown, backticks, or explanation.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: 'AI failed to return feedback' }, { status: 500 })
    }

    // Extract JSON from response even if wrapped in text
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI returned invalid response' }, { status: 500 })
    }
    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error during AI scoring' }, { status: 500 })
  }
}