import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function avgScoreMap(scores: Record<string, number> | null | undefined): number {
  const vals = Object.values(scores ?? {}).map(Number).filter(v => v > 0)
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export async function GET() {
  const rows = await prisma.evaluation.findMany({
    select: { dealName: true, scores: true },
  })

  const byDeal: Record<string, { sum: number; n: number }> = {}
  for (const r of rows) {
    const userAvg = avgScoreMap(r.scores as any)
    if (!byDeal[r.dealName]) byDeal[r.dealName] = { sum: 0, n: 0 }
    byDeal[r.dealName].sum += userAvg
    byDeal[r.dealName].n += 1
  }

  const out = Object.entries(byDeal).map(([dealName, { sum, n }]) => ({
    dealName,
    avgScore: n ? sum / n : 0,
    reviewers: n,
  })).sort((a, b) => a.dealName.localeCompare(b.dealName))

  return NextResponse.json(out)
}
