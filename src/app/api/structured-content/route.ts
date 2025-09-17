import { NextRequest, NextResponse } from 'next/server';
import { structuredContentService } from '@/lib/services/structured-content';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'howto' | 'case' | null;
    const query = searchParams.get('q');
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    // Get specific content by ID
    if (id) {
      const contentId = parseInt(id);
      if (isNaN(contentId)) {
        return NextResponse.json({ error: 'Invalid content ID' }, { status: 400 });
      }

      let content;
      if (type === 'howto') {
        content = await structuredContentService.getHowtoWithSteps(contentId);
      } else if (type === 'case') {
        content = await structuredContentService.getCaseStudyWithDetails(contentId);
      } else {
        // Try to get content and determine type
        const basicContent = await structuredContentService.getStructuredContentBySlug(''); // This won't work, need to fix
        return NextResponse.json({ error: 'Type parameter required when fetching by ID' }, { status: 400 });
      }

      if (!content) {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 });
      }

      return NextResponse.json(content);
    }

    // Get specific content by slug
    if (slug) {
      const content = await structuredContentService.getStructuredContentBySlug(slug);
      if (!content) {
        return NextResponse.json({ error: 'Content not found' }, { status: 404 });
      }
      return NextResponse.json(content);
    }

    // Search content
    if (query) {
      const results = await structuredContentService.searchStructuredContent(query, type || undefined);
      return NextResponse.json({
        query,
        type: type || 'all',
        results,
        count: results.length
      });
    }

    // Get all content by type
    if (type === 'howto') {
      const howtos = await structuredContentService.getAllHowtoWithSteps();
      return NextResponse.json({
        type: 'howto',
        items: howtos,
        count: howtos.length
      });
    }

    if (type === 'case') {
      const cases = await structuredContentService.getAllCaseStudiesWithDetails();
      return NextResponse.json({
        type: 'case',
        items: cases,
        count: cases.length
      });
    }

    // Get statistics
    const stats = await structuredContentService.getStructuredContentStats();
    return NextResponse.json(stats);

  } catch (error) {
    console.error('Structured content API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}