import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// moyenne d'une map en ignorant les 0
function avgScoreMap(scores: Record<string, number> | null | undefined): number {
  const vals = Object.values(scores ?? {}).map(Number).filter(v => v > 0);
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

// GET /api/my-scores?evaluator=Lucie
// -> renvoie tous les deals scorés par "evaluator" avec la moyenne par deal
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const evaluator = (searchParams.get('evaluator') || '').trim();
    if (!evaluator) return NextResponse.json([], { status: 200 });

    const rows = await prisma.evaluation.findMany({
      where: { evaluator: { equals: evaluator, mode: 'insensitive' } },
      orderBy: { updatedAt: 'desc' },
      select: { dealName: true, scores: true, updatedAt: true },
    });

    const out = rows.map(r => ({
      dealName: r.dealName,
      avgScore: avgScoreMap(r.scores as Record<string, number>),
      updatedAt: r.updatedAt,
    }));

    return NextResponse.json(out, { status: 200 });
  } catch (err: any) {
    console.error('GET /api/my-scores error:', err);
    return NextResponse.json({ error: err?.message ?? 'GET failed' }, { status: 500 });
  }
}
