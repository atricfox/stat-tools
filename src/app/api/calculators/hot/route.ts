import { NextRequest, NextResponse } from 'next/server';
import { calculatorsService } from '@/lib/services/calculators';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    // Get hot calculators from database
    const calculators = await calculatorsService.getHotCalculators(limit);

    return NextResponse.json(calculators);
  } catch (error) {
    console.error('Error fetching hot calculators:', error);
    return NextResponse.json({ error: 'Failed to fetch hot calculators' }, { status: 500 });
  }
}