import { NextRequest, NextResponse } from 'next/server';
import { saveCalculation } from '@/lib/storage';
import { EstateState } from '@/types/iht';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const state = body.state as EstateState;
    const title = body.title as string | undefined;
    const id = body.id as string | undefined;

    if (!state) {
      return NextResponse.json({ error: 'Missing calculation state' }, { status: 400 });
    }

    const record = await saveCalculation(state, title, id);
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const url = `${protocol}://${host}/c/${record.id}`;

    return NextResponse.json({
      success: true,
      id: record.id,
      url,
      record,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save calculation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
