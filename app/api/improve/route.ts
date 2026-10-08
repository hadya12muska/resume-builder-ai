
import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const text = body?.text;

    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "No resume text provided." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional resume writer. Improve resume content so it is clear, professional, concise, achievement-focused, and ATS-friendly. Do not invent experience, skills, education, companies, dates, or achievements. Preserve the user's original meaning. Return only the improved resume text.",
        },
        {
          role: "user",
          content: `Improve the following resume content:\n\n${text}`,
        },
      ],
    });

    const improvedText =
      completion.choices[0]?.message?.content?.trim() || "";

    if (!improvedText) {
      return NextResponse.json(
        { error: "The AI returned an empty response. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ improvedText });
  } catch (error) {
    console.error("AI improvement error:", error);

    return NextResponse.json(
      { error: "Failed to improve resume content. Please try again." },
      { status: 500 }
    );
  }
}