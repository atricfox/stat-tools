import { NextResponse } from 'next/server';
import { glossaryService } from '@/lib/services/glossary';

/**
 * Glossary Categories API - 获取所有术语分类
 */
export async function GET() {
    try {
        const categories = await glossaryService.getCategories();

        return NextResponse.json({
            success: true,
            data: categories,
            meta: {
                count: categories.length
            }
        });

    } catch (error) {
        console.error('Glossary Categories API Error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch glossary categories',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}