// app/api/claude/route.js
// Proxy sécurisé vers l'API Anthropic — Next.js App Router

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { messages, max_tokens = 1000 } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages requis' }, { status: 400 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { error: err.error?.message || 'erreur anthropic' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (err) {
    console.error('Claude proxy error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
