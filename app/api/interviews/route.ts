import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { interviewSchema } from '@/lib/validations'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')

    let query = supabase
      .from('interviews')
      .select('*')
      .eq('user_id', user.id)
      .order('interview_date', { ascending: true })

    if (applicationId) {
      query = query.eq('application_id', applicationId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = interviewSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten().fieldErrors }, { status: 400 })
    }

    const applicationId = body.application_id
    if (!applicationId) {
      return NextResponse.json({ error: 'application_id is required' }, { status: 400 })
    }

    // Verify application belongs to user
    const { data: appData, error: appError } = await supabase
      .from('job_applications')
      .select('id')
      .eq('id', applicationId)
      .eq('user_id', user.id)
      .single()

    if (appError || !appData) {
      return NextResponse.json({ error: 'Job application not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('interviews')
      .insert({
        ...validated.data,
        application_id: applicationId,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Automatically update the application status to 'interview' if it's currently 'saved' or 'applied'
    const { data: currentApp } = await supabase
      .from('job_applications')
      .select('status')
      .eq('id', applicationId)
      .single()

    if (currentApp && (currentApp.status === 'saved' || currentApp.status === 'applied')) {
      await supabase
        .from('job_applications')
        .update({ status: 'interview' })
        .eq('id', applicationId)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
