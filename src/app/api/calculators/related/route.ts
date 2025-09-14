import { NextRequest, NextResponse } from 'next/server';
import { calculatorsService } from '@/lib/services/calculators';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUrl = searchParams.get('currentUrl');

    if (!currentUrl) {
      return NextResponse.json({ error: 'currentUrl is required' }, { status: 400 });
    }

    // Get current calculator info by URL
    const current = await calculatorsService.getCalculatorByUrl(currentUrl);

    if (current) {
      // Get calculators from the same group
      const result = await calculatorsService.getCalculators({
        groupId: current.group_id,
        pageSize: 10
      });

      // Filter out current calculator and limit to 3
      const filtered = result.calculators
        .filter(calc => calc.id !== current.id)
        .slice(0, 3);

      return NextResponse.json(filtered);
    } else {
      // Fallback: get any 3 calculators
      const result = await calculatorsService.getCalculators({
        pageSize: 4
      });

      const filtered = result.calculators
        .filter(calc => !calc.url.includes(currentUrl))
        .slice(0, 3);

      return NextResponse.json(filtered);
    }
  } catch (error) {
    console.error('Error fetching related calculators:', error);
    return NextResponse.json({ error: 'Failed to fetch related calculators' }, { status: 500 });
  }
}