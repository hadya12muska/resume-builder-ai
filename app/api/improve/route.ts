import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const text = body.text;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "No resume text provided." },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional resume writer. Improve resume content so it is clear, professional, concise, achievement-focused, and ATS-friendly. Do not invent experience, skills, education, companies, dates, or achievements. Return only the improved text.",
        },
        {
          role: "user",
          content: `Improve the following resume content:\n\n${text}`,
        },
      ],
    });

    const improvedText =
      completion.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({
      improvedText,
    });
  } catch (error) {
    console.error("AI improvement error:", error);

    return NextResponse.json(
      { error: "Failed to improve resume content." },
      { status: 500 }
    );
  }
}