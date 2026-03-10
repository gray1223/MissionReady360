import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { buildEpSystemPrompt } from "@/lib/upt/ep-system-prompt";
import type { EpSetupData, EpMessage, EpPhase } from "@/lib/types/ep-practice";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check uptEnabled
  const { data: profile } = await supabase
    .from("profiles")
    .select("flight_log_preferences")
    .eq("id", user.id)
    .single();

  if (!profile?.flight_log_preferences?.uptEnabled) {
    return NextResponse.json(
      { error: "UPT features not enabled" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const {
    messages,
    setupData,
    currentPhase,
  }: {
    messages: EpMessage[];
    setupData: EpSetupData;
    currentPhase: EpPhase;
  } = body;

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
