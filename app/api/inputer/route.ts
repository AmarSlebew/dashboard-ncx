import { NextRequest, NextResponse } from 'next/server';
import { getInputerData } from '@/lib/data-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const now = new Date();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    const currentYear = now.getFullYear().toString();

    const bulan = searchParams.get('bulan') || currentMonth;
    const tahun = searchParams.get('tahun') || currentYear;

    const data = await getInputerData(bulan, tahun);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
