import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Small helper: average of a record of numbers, ignoring zeros
function avgScoreMap(scores: Record<string, number> | null | undefined): number {
  const vals = Object.values(scores ?? {})
    .map(Number)
    .filter(v => v > 0);
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/**
 * GET /api/evaluations?dealName=Deal%201
 * Returns the list of rows for a given deal (evaluator, scores, notes)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dealName = searchParams.get('dealName') ?? '';

  if (!dealName.trim()) {
    return NextResponse.json([], { status: 200 });
  }

  const rows = await prisma.evaluation.findMany({
    where: { dealName },
    orderBy: { createdAt: 'asc' },
    select: {
      evaluator: true,     // ⚠️ your Prisma model uses `evaluator`
      scores: true,
      notes: true,
    },
  });

  return NextResponse.json(rows);
}

/**
 * POST /api/evaluations
 * Body: { dealName, evaluatorName, scores, notes }
 * Upserts one row for (dealName, evaluator) pair.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const dealName: string = (body.dealName ?? '').trim();
  const evaluatorName: string = (body.evaluatorName ?? '').trim();
  const scores = body.scores ?? {};
  const notes = body.notes ?? {};

  if (!dealName || !evaluatorName) {
    return NextResponse.json({ error: 'Missing dealName or evaluatorName' }, { status: 400 });
  }

  // If you DO NOT have a unique composite key, use upsert via find+update or create:
  const existing = await prisma.evaluation.findFirst({
    where: { dealName, evaluator: evaluatorName },
    select: { id: true },
  });

  const saved = existing
    ? await prisma.evaluation.update({
        where: { id: existing.id },
        data: { scores, notes },
      })
    : await prisma.evaluation.create({
        data: { dealName, evaluator: evaluatorName, scores, notes },
      });

  return NextResponse.json(saved);
}

/**
 * DELETE /api/evaluations
 * Body (preferred) or query: { dealName, evaluatorName }
 * Deletes all rows that match that pair (safe if there’s no unique constraint).
 */
export async function DELETE(request: Request) {
  let dealName = '';
  let evaluatorName = '';

  // Accept either JSON body OR query parameters (helps if a client forbids DELETE body)
  try {
    const body = await request.json().catch(() => null);
    if (body) {
      dealName = (body.dealName ?? '').trim();
      evaluatorName = (body.evaluatorName ?? '').trim();
    }
  } catch {
    /* ignore */
  }

  const { searchParams } = new URL(request.url);
  if (!dealName) dealName = (searchParams.get('dealName') ?? '').trim();
  if (!evaluatorName) evaluatorName = (searchParams.get('evaluatorName') ?? '').trim();

  if (!dealName || !evaluatorName) {
    return NextResponse.json({ error: 'Missing dealName or evaluatorName' }, { status: 400 });
  }

  const result = await prisma.evaluation.deleteMany({
    where: { dealName, evaluator: evaluatorName },
  });

  return NextResponse.json({ deleted: result.count });
}
