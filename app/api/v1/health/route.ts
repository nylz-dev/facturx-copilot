/**
 * GET /api/v1/health
 * Health check endpoint for RapidAPI monitoring
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'FacturXPro API',
  });
}
