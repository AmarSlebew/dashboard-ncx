import { NextResponse } from 'next/server';
import { getGlobalKPIs } from '@/lib/data-service';

export async function GET() {
  try {
    const kpis = await getGlobalKPIs();
    return NextResponse.json(kpis);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
