import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildEpSystemPrompt } from "@/lib/upt/ep-system-prompt";
import type { EpSetupData, EpMessage, EpPhase } from "@/lib/types/ep-practice";

const EP_PASSWORD = process.env.EP_PUBLIC_PASSWORD || "26-12penguins";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    password,
    messages,
    setupData,
    currentPhase,
  }: {
    password: string;
    messages: EpMessage[];
    setupData: EpSetupData;
    currentPhase: EpPhase;
  } = body;

  if (password !== EP_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  if (!messages || !setupData) {
    return NextResponse.json(
      { error: "Missing messages or setupData" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Anthropic API key not configured" },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey });
  const systemPrompt = buildEpSystemPrompt(setupData, currentPhase);

  // Convert our messages to Anthropic format
  // If no messages yet (session start), send a kickoff user message
  const anthropicMessages: Anthropic.MessageParam[] =
    messages.length === 0
      ? [{ role: "user", content: "Begin the EP scenario." }]
      : messages.map((msg) => ({
          role: msg.role === "ip" ? ("assistant" as const) : ("user" as const),
          content: msg.content,
        }));

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: systemPrompt,
    messages: anthropicMessages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Stream error";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
