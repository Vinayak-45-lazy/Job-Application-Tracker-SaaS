import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import mammoth from 'mammoth'
import PDFParser from 'pdf2json'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const applicationId = formData.get('applicationId') as string || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let extractedText = ''

    if (file.name.endsWith('.pdf')) {
      try {
        extractedText = await new Promise<string>((resolve, reject) => {
          const pdfParser = new (PDFParser as any)(null, 1)
          pdfParser.on('pdfParser_dataReady', () => {
            resolve(pdfParser.getRawTextContent())
          })
          pdfParser.on('pdfParser_dataError', (err: any) => {
            reject(err)
          })
          pdfParser.parseBuffer(buffer)
        })
      } catch (pdfErr) {
        return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 400 })
      }
    } else if (file.name.endsWith('.docx')) {
      try {
        const docxResult = await mammoth.extractRawText({ buffer })
        extractedText = docxResult.value
      } catch {
        return NextResponse.json({ error: 'Failed to parse DOCX' }, { status: 400 })
      }
    } else if (file.name.endsWith('.txt')) {
      extractedText = buffer.toString('utf-8')
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Use PDF, DOCX, or TXT.' }, { status: 400 })
    }

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${user.id}/${applicationId}/${Date.now()}_${cleanFileName}`

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath)

    return NextResponse.json({
      url: publicUrl,
      text: extractedText,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}