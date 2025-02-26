import { NextResponse, NextRequest } from 'next/server';
import { notionApi } from '@/lib/notionApi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sortOrder = 'desc',
      page,
      limit,
      tags, // string[] : 복수 태그 필터
      search, // string : 제목/내용 검색
    } = body;

    let posts;
    if (tags && Array.isArray(tags) && tags.length > 0) {
      posts = await notionApi.getPostsByTag(tags, sortOrder, page, limit);
    } else if (search && typeof search === 'string' && search.trim() !== '') {
      posts = await notionApi.getPostsBySearch(search, sortOrder, page, limit);
    } else {
      posts = await notionApi.getPosts(sortOrder, page, limit);
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
