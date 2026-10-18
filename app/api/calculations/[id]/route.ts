import { NextRequest, NextResponse } from 'next/server';
import { getCalculation } from '@/lib/storage';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing calculation ID' }, { status: 400 });
    }

    const record = await getCalculation(id);
    if (!record) {
      return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve calculation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
