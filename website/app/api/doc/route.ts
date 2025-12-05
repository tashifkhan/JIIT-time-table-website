import { getApiDocs } from '@/lib/swagger';
import { NextResponse } from 'next/server';

export async function GET() {
  const spec = await getApiDocs();
  return NextResponse.json(spec);
}
