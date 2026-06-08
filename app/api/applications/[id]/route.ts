import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applicationSchema } from '@/lib/validations'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validated = applicationSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten().fieldErrors }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('job_applications')
      .update(validated.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch the application
    const { data: app, error: appError } = await supabase
      .from('job_applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (appError || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (!app.resume_url || !app.job_description) {
      return NextResponse.json({ error: 'Resume and job description are required' }, { status: 400 })
    }

    // Fetch resume text from storage URL
    const resumeRes = await fetch(app.resume_url)
    const resumeBuffer = Buffer.from(await resumeRes.arrayBuffer())

    let resumeText = ''
    if (app.resume_url.endsWith('.pdf')) {
      const PDFParser = require('pdf2json')
      resumeText = await new Promise<string>((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1)
        pdfParser.on('pdfParser_dataReady', () => resolve(pdfParser.getRawTextContent()))
        pdfParser.on('pdfParser_dataError', reject)
        pdfParser.parseBuffer(resumeBuffer)
      })
    } else if (app.resume_url.includes('.docx')) {
      const mammoth = require('mammoth')
      const result = await mammoth.extractRawText({ buffer: resumeBuffer })
      resumeText = result.value
    } else {
      resumeText = resumeBuffer.toString('utf-8')
    }

    // Call AI scoring
    const { groq } = await import('@/lib/groq')
    const truncatedResume = resumeText.slice(0, 3000)
    const truncatedJD = app.job_description.slice(0, 2000)

    const prompt = `You are an ATS resume scoring expert. Analyze the resume against the job description below.

RESUME:
${truncatedResume}

JOB DESCRIPTION:
${truncatedJD}

Respond with ONLY a valid JSON object. No explanation, no markdown, no extra text. Just the raw JSON:
{"matchScore":75,"missingKeywords":["keyword1"],"foundKeywords":["skill1"],"suggestions":["suggestion1","suggestion2","suggestion3","suggestion4","suggestion5"],"atsRating":"Good"}`

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

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI returned invalid response' }, { status: 500 })
    }

    const aiResult = JSON.parse(jsonMatch[0])

    // Save AI results back to the application
    const { data: updated, error: updateError } = await supabase
      .from('job_applications')
      .update({
        ai_match_score: aiResult.matchScore,
        ai_missing_keywords: aiResult.missingKeywords,
        ai_suggestions: aiResult.suggestions,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error during AI analysis' }, { status: 500 })
  }
}