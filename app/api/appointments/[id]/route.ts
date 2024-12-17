import { NextResponse } from 'next/server'
import { updateAppointment } from '@/lib/appointments'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()

    console.log('Updating appointment:', { id, body })

    if (!body.start || !body.end) {
      return NextResponse.json(
        { error: 'Missing start or end time' },
        { status: 400 }
      )
    }

    const result = await updateAppointment({
      ...body,
      id,
      start: new Date(body.start),
      end: new Date(body.end)
    })

    console.log('Update result:', result)

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update appointment in database' },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update appointment' },
      { status: 500 }
    )
  }
}
