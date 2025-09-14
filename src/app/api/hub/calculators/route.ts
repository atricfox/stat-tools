import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/db-utils';
import { createCalculatorsService } from '@/lib/db/calculators-service';
import { CalculatorsJson } from '@/lib/hub/calculatorsSchema';
import { calculatorsCache } from '@/lib/cache/calculators-cache';

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
  try {
    const cacheKey = 'calculators-hub-data';
    const clientEtag = request.headers.get('if-none-match');

    // Check cache first
    const cachedEntry = calculatorsCache.get(cacheKey);
    if (cachedEntry) {
      if (clientEtag === cachedEntry.etag) {
        return new NextResponse(null, { status: 304 });
      }
    }

    // Fetch fresh data
    const db = getDb();
    const service = createCalculatorsService(db);
    const data = await service.getCalculatorsData();

    // Validate data with Zod schema
    const validationResult = CalculatorsJson.safeParse(data);
    if (!validationResult.success) {
      console.error('Data validation error:', validationResult.error);
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 500 }
      );
    }

    // Cache the response
    const etag = calculatorsCache.set(cacheKey, validationResult.data);

    // Add cache headers
    const response = NextResponse.json(validationResult.data);
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=1800');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=3600');
    response.headers.set('ETag', etag);

    return response;
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calculators data' },
      { status: 500 }
    );
  }
}