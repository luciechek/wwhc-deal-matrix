import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Petite aide : moyenne d'une map (on ignore les 0)
function avgScoreMap(scores: Record<string, number> | null | undefined): number {
  const vals = Object.values(scores ?? {}).map(Number).filter(v => v > 0);
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

// GET /api/evaluations?dealName=...
// -> renvoie toutes les lignes (évaluateurs) pour un deal
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dealName = (searchParams.get('dealName') || '').trim();
    if (!dealName) {
      return NextResponse.json([], { status: 200 });
    }

    const rows = await prisma.evaluation.findMany({
      where: { dealName },
      orderBy: { updatedAt: 'desc' },
      select: { evaluator: true, scores: true, notes: true },
    });

    return NextResponse.json(
      rows.map(r => ({
        evaluator: r.evaluator,
        scores: (r.scores as Record<string, number>) ?? {},
        notes: (r.notes as Record<string, string> | null) ?? {},
      })),
      { status: 200 }
    );
  } catch (err: any) {
    console.error('GET /api/evaluations error:', err);
    return NextResponse.json({ error: err?.message ?? 'GET failed' }, { status: 500 });
  }
}

// POST /api/evaluations
// { dealName, evaluatorName, scores, notes } -> upsert (create or update)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dealName = (body?.dealName || '').trim();
    const evaluatorName = (body?.evaluatorName || '').trim();
    const scores = (body?.scores ?? {}) as Record<string, number>;
    const notes = (body?.notes ?? {}) as Record<string, string>;

    if (!dealName || !evaluatorName) {
      return NextResponse.json({ error: 'Missing dealName or evaluatorName' }, { status: 400 });
    }

    const row = await prisma.evaluation.upsert({
      where: { dealName_evaluator: { dealName, evaluator: evaluatorName } },
      create: { dealName, evaluator: evaluatorName, scores, notes },
      update: { scores, notes },
      select: { dealName: true, evaluator: true, scores: true, notes: true, updatedAt: true },
    });

    return NextResponse.json(row, { status: 200 });
  } catch (err: any) {
    console.error('POST /api/evaluations error:', err);
    return NextResponse.json({ error: err?.message ?? 'POST failed' }, { status: 500 });
  }
}

// DELETE /api/evaluations
// { dealName, evaluatorName } -> supprime la ligne correspondante
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const dealName = (body?.dealName || '').trim();
    const evaluatorName = (body?.evaluatorName || '').trim();

    if (!dealName || !evaluatorName) {
      return NextResponse.json({ error: 'Missing dealName or evaluatorName' }, { status: 400 });
    }

    await prisma.evaluation.delete({
      where: { dealName_evaluator: { dealName, evaluator: evaluatorName } },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error('DELETE /api/evaluations error:', err);
    return NextResponse.json({ error: err?.message ?? 'DELETE failed' }, { status: 500 });
  }
}
