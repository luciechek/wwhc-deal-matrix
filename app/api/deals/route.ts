import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ScoreMap = Record<string, number>;

// moyenne d'une map de scores en ignorant les 0, tolérante au null/undefined
function avgScoreMap(scores: ScoreMap | null | undefined): number {
  const vals = Object.values(scores ?? {})
    .map(Number)
    .filter(v => v > 0);
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export async function GET() {
  // On récupère toutes les évaluations et on agrège côté serveur
  const rows = await prisma.evaluation.findMany({
    select: { dealName: true, scores: true, evaluator: true }
  });

  // Regroupement par deal
  const byDeal: Record<string, { sum: number; n: number }> = {};
  for (const r of rows) {
    const perUserAvg = avgScoreMap(r.scores as any);
    if (!byDeal[r.dealName]) byDeal[r.dealName] = { sum: 0, n: 0 };
    byDeal[r.dealName].sum += perUserAvg;
    byDeal[r.dealName].n += 1;
  }

  const out = Object.entries(byDeal)
    .map(([dealName, { sum, n }]) => ({
      dealName,
      avgScore: n ? sum / n : 0,
      reviewers: n
    }))
    .sort((a, b) => a.dealName.localeCompare(b.dealName));

  return NextResponse.json(out);
}
