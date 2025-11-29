import { NextRequest, NextResponse } from "next/server";

const HF_TOKEN = process.env.HF_TOKEN || "";

async function queryHuggingFace(model: string, payload: object, retries = 3): Promise<any> {
  const url = `https://router.huggingface.co/hf-inference/models/${model}`;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${HF_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 503) {
        const data = await response.json();
        const waitTime = data.estimated_time || 20;
        await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HF API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "sentiment": {
        const result = await queryHuggingFace(
          "cardiffnlp/twitter-roberta-base-sentiment-latest",
          { inputs: data.text }
        );
        return NextResponse.json({ result: result[0] || [] });
      }

      case "classify": {
        const result = await queryHuggingFace(
          "facebook/bart-large-mnli",
          { inputs: data.text, parameters: { candidate_labels: data.labels } }
        );
        return NextResponse.json({ result });
      }

      case "analyzeEmployee": {
        const { name, role, impactScore, burnoutRisk, tasksCompleted, lateNightCommits, peerReviewScore, achievements } = data;
        
        const context = `
Employee: ${name}
Role: ${role}
Impact Score: ${impactScore}/100
Burnout Risk: ${burnoutRisk}
Tasks Completed: ${tasksCompleted}
Late Night Commits: ${lateNightCommits}
Peer Review Score: ${peerReviewScore}/5
Key Achievements: ${(achievements || []).slice(0, 3).join("; ")}
        `.trim();

        const profileResult = await queryHuggingFace(
          "facebook/bart-large-mnli",
          {
            inputs: context,
            parameters: {
              candidate_labels: [
                "high performer with burnout risk",
                "hidden gem undervalued employee",
                "steady reliable contributor",
                "needs mentorship and growth",
                "team leader and mentor",
              ],
            },
          }
        );

        return NextResponse.json({ result: profileResult });
      }

      case "analyzeDepartment": {
        const { department, avgImpact, avgTasks, avgPeerReview } = data;
        
        const context = `${department} department: average impact ${avgImpact.toFixed(0)}%, ${avgTasks.toFixed(0)} tasks per person, peer review ${avgPeerReview.toFixed(1)}/5`;

        const result = await queryHuggingFace(
          "facebook/bart-large-mnli",
          {
            inputs: context,
            parameters: {
              candidate_labels: [
                "high performing team exceeding expectations",
                "stable team meeting targets",
                "team needs improvement and support",
                "team showing growth potential",
              ],
            },
          }
        );

        return NextResponse.json({ result });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI processing failed" },
      { status: 500 }
    );
  }
}
