// AI Service using Next.js API route (proxies to Hugging Face)
const AI_API_URL = "/api/ai";

interface SentimentResult {
  label: string;
  score: number;
}

interface ClassificationResult {
  sequence: string;
  labels: string[];
  scores: number[];
}

// Call the AI API route
async function callAIAPI(action: string, data: object): Promise<any> {
  const response = await fetch(AI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, data }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "AI API failed");
  }

  const result = await response.json();
  return result.result;
}

// Analyze sentiment of text
export async function analyzeSentiment(text: string): Promise<SentimentResult[]> {
  try {
    const result = await callAIAPI("sentiment", { text });
    return result || [{ label: "NEUTRAL", score: 0.5 }];
  } catch (error) {
    console.error("Sentiment analysis failed:", error);
    return [{ label: "NEUTRAL", score: 0.5 }];
  }
}

// Classify text into categories
export async function classifyText(
  text: string,
  candidateLabels: string[]
): Promise<ClassificationResult> {
  try {
    const result = await callAIAPI("classify", { text, labels: candidateLabels });
    return result;
  } catch (error) {
    console.error("Text classification failed:", error);
    return {
      sequence: text,
      labels: candidateLabels,
      scores: candidateLabels.map(() => 1 / candidateLabels.length),
    };
  }
}

// Generate AI summary for employee
export async function generateEmployeeSummary(employeeData: {
  name: string;
  role: string;
  impactScore: number;
  burnoutRisk: string;
  tasksCompleted: number;
  lateNightCommits: number;
  peerReviewScore: number;
  achievements: string[];
}): Promise<string> {
  const { name, role, impactScore, burnoutRisk, tasksCompleted, lateNightCommits, peerReviewScore, achievements } = employeeData;
  
  // Build context for analysis
  const context = `
Employee: ${name}
Role: ${role}
Impact Score: ${impactScore}/100
Burnout Risk: ${burnoutRisk}
Tasks Completed: ${tasksCompleted}
Late Night Commits: ${lateNightCommits}
Peer Review Score: ${peerReviewScore}/5
Key Achievements: ${achievements.slice(0, 3).join("; ")}
  `.trim();

  try {
    // Use zero-shot classification to understand employee profile
    const profileResult = await classifyText(context, [
      "high performer with burnout risk",
      "hidden gem undervalued employee", 
      "steady reliable contributor",
      "needs mentorship and growth",
      "team leader and mentor",
    ]);

    const topLabel = profileResult.labels[0];
    const topScore = profileResult.scores[0];

    // Generate contextual summary based on classification
    let summary = "";
    
    if (topLabel.includes("high performer") && topScore > 0.3) {
      summary = `${name} is a high-impact ${role} with an exceptional impact score of ${impactScore}%. `;
      if (burnoutRisk === "high" || lateNightCommits > 5) {
        summary += `However, there are concerning signs of potential burnout with ${lateNightCommits} late-night commits detected. `;
        summary += `Immediate attention is recommended to ensure sustainable performance. `;
      }
      summary += `Key achievements include: ${achievements[0] || "significant contributions to the team"}.`;
    } else if (topLabel.includes("hidden gem") && topScore > 0.25) {
      summary = `${name} appears to be a hidden gem in the organization. Despite a ${role} position, `;
      summary += `they consistently deliver quality work with a peer review score of ${peerReviewScore}/5. `;
      summary += `Consider increased recognition and growth opportunities.`;
    } else if (topLabel.includes("steady") && topScore > 0.25) {
      summary = `${name} is a reliable ${role} who maintains consistent performance. `;
      summary += `With ${tasksCompleted} tasks completed and an impact score of ${impactScore}%, `;
      summary += `they form a solid foundation for the team.`;
    } else if (topLabel.includes("mentorship") && topScore > 0.25) {
      summary = `${name} shows potential for growth in their ${role} position. `;
      summary += `With targeted mentorship and challenging assignments, `;
      summary += `their impact score of ${impactScore}% could improve significantly.`;
    } else {
      summary = `${name} is an experienced ${role} with ${tasksCompleted} completed tasks. `;
      summary += `Their peer review score of ${peerReviewScore}/5 reflects ${peerReviewScore >= 4 ? "excellent" : "solid"} collaboration skills. `;
      if (burnoutRisk !== "low") {
        summary += `Monitor workload to maintain work-life balance.`;
      }
    }

    return summary;
  } catch (error) {
    console.error("Summary generation failed:", error);
    return `${name} is a ${role} with an impact score of ${impactScore}% and ${tasksCompleted} completed tasks.`;
  }
}

// Analyze burnout risk using AI
export async function analyzeBurnoutRisk(employeeData: {
  lateNightCommits: number;
  weekendActivity: number;
  vacationDaysUnused: number;
  sentimentTrend: number;
  chatLogs: { message: string; sentiment: string }[];
}): Promise<{ score: number; factors: string[]; recommendation: string }> {
  const { lateNightCommits, weekendActivity, vacationDaysUnused, sentimentTrend, chatLogs } = employeeData;

  const factors: string[] = [];
  let riskScore = 0;

  // Analyze work patterns
  if (lateNightCommits > 10) {
    factors.push(`High frequency of late-night commits (${lateNightCommits})`);
    riskScore += 25;
  } else if (lateNightCommits > 5) {
    factors.push(`Moderate late-night activity (${lateNightCommits} commits)`);
    riskScore += 15;
  }

  if (weekendActivity > 5) {
    factors.push(`Frequent weekend work (${weekendActivity} activities)`);
    riskScore += 20;
  }

  if (vacationDaysUnused > 10) {
    factors.push(`${vacationDaysUnused} unused vacation days`);
    riskScore += 15;
  }

  // Analyze sentiment from chat logs using AI
  if (chatLogs.length > 0) {
    try {
      const recentMessages = chatLogs.slice(-5).map((c) => c.message).join(" ");
      const sentimentResult = await analyzeSentiment(recentMessages);
      
      const negativeScore = sentimentResult.find((s) => s.label === "negative")?.score || 0;
      if (negativeScore > 0.5) {
        factors.push("Recent communications show signs of stress");
        riskScore += 20;
      }
    } catch (e) {
      // Fallback to existing sentiment data
      if (sentimentTrend < -0.1) {
        factors.push("Declining sentiment trend detected");
        riskScore += 15;
      }
    }
  }

  // Generate recommendation based on risk
  let recommendation = "";
  if (riskScore >= 60) {
    recommendation = "Immediate intervention recommended. Consider workload redistribution and mandatory time off.";
  } else if (riskScore >= 40) {
    recommendation = "Monitor closely. Schedule a wellness check-in and review current assignments.";
  } else if (riskScore >= 20) {
    recommendation = "Low-moderate risk. Encourage regular breaks and vacation time usage.";
  } else {
    recommendation = "Healthy work patterns observed. Continue supporting work-life balance.";
  }

  return { score: Math.min(100, riskScore), factors, recommendation };
}

// Generate AI-powered insights and recommendations
export async function generateInsights(employees: {
  id: string;
  name: string;
  role: string;
  impactScore: number;
  burnoutRisk: string;
  peerReviewScore: number;
  tasksCompleted: number;
  lateNightCommits: number;
  achievements: string[];
}[]): Promise<{
  recommendations: {
    type: "recognition" | "warning" | "growth" | "support";
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    employeeId?: string;
    employeeName?: string;
  }[];
  hiddenGems: string[];
  atRiskEmployees: string[];
}> {
  const recommendations: any[] = [];
  const hiddenGems: string[] = [];
  const atRiskEmployees: string[] = [];

  for (const emp of employees) {
    // Classify employee situation
    const context = `${emp.name} has impact score ${emp.impactScore}, burnout risk ${emp.burnoutRisk}, ${emp.lateNightCommits} late night commits, peer review ${emp.peerReviewScore}`;
    
    try {
      const classification = await classifyText(context, [
        "needs immediate burnout intervention",
        "deserves recognition and promotion",
        "hidden talent needs visibility",
        "requires mentorship support",
        "performing as expected",
      ]);

      const topLabel = classification.labels[0];
      const confidence = classification.scores[0];

      if (topLabel.includes("burnout") && confidence > 0.25) {
        atRiskEmployees.push(emp.id);
        recommendations.push({
          type: "warning",
          priority: "high",
          title: `Burnout Alert: ${emp.name}`,
          description: `AI analysis indicates high burnout risk. ${emp.lateNightCommits} late-night commits and ${emp.burnoutRisk} risk level detected. Immediate workload review recommended.`,
          employeeId: emp.id,
          employeeName: emp.name,
        });
      }

      if (topLabel.includes("recognition") && confidence > 0.25) {
        recommendations.push({
          type: "recognition",
          priority: "medium",
          title: `Recognize ${emp.name}`,
          description: `AI identifies ${emp.name} as a top performer with ${emp.impactScore}% impact and ${emp.peerReviewScore}/5 peer rating. Consider public recognition or promotion.`,
          employeeId: emp.id,
          employeeName: emp.name,
        });
      }

      if (topLabel.includes("hidden") && confidence > 0.25) {
        hiddenGems.push(emp.id);
        recommendations.push({
          type: "growth",
          priority: "medium",
          title: `Hidden Gem: ${emp.name}`,
          description: `AI detected undervalued contribution. ${emp.name}'s work quality exceeds visibility. Recommend increased exposure and stretch assignments.`,
          employeeId: emp.id,
          employeeName: emp.name,
        });
      }

      if (topLabel.includes("mentorship") && confidence > 0.25) {
        recommendations.push({
          type: "support",
          priority: "low",
          title: `Growth Opportunity: ${emp.name}`,
          description: `${emp.name} would benefit from mentorship. Pair with senior team member to accelerate development.`,
          employeeId: emp.id,
          employeeName: emp.name,
        });
      }
    } catch (error) {
      // Fallback logic if AI fails
      if (emp.burnoutRisk === "high") {
        atRiskEmployees.push(emp.id);
        recommendations.push({
          type: "warning",
          priority: "high",
          title: `Burnout Alert: ${emp.name}`,
          description: `High burnout risk detected with ${emp.lateNightCommits} late-night commits.`,
          employeeId: emp.id,
          employeeName: emp.name,
        });
      }
      if (emp.impactScore >= 85 && emp.peerReviewScore >= 4.5) {
        recommendations.push({
          type: "recognition",
          priority: "medium",
          title: `Recognize ${emp.name}`,
          description: `Top performer with ${emp.impactScore}% impact score.`,
          employeeId: emp.id,
          employeeName: emp.name,
        });
      }
    }
  }

  return { recommendations, hiddenGems, atRiskEmployees };
}

// Analyze team performance patterns
export async function analyzeTeamPerformance(employees: {
  name: string;
  department: string;
  impactScore: number;
  tasksCompleted: number;
  peerReviewScore: number;
}[]): Promise<{
  departmentInsights: { department: string; insight: string; trend: "up" | "down" | "stable" }[];
  overallHealth: string;
}> {
  const deptMap = new Map<string, typeof employees>();
  
  employees.forEach((emp) => {
    const dept = emp.department;
    if (!deptMap.has(dept)) deptMap.set(dept, []);
    deptMap.get(dept)!.push(emp);
  });

  const departmentInsights: { department: string; insight: string; trend: "up" | "down" | "stable" }[] = [];

  for (const [dept, emps] of deptMap) {
    const avgImpact = emps.reduce((sum, e) => sum + e.impactScore, 0) / emps.length;
    const avgTasks = emps.reduce((sum, e) => sum + e.tasksCompleted, 0) / emps.length;
    const avgPeerReview = emps.reduce((sum, e) => sum + e.peerReviewScore, 0) / emps.length;

    const context = `${dept} department: average impact ${avgImpact.toFixed(0)}%, ${avgTasks.toFixed(0)} tasks per person, peer review ${avgPeerReview.toFixed(1)}/5`;

    try {
      const classification = await classifyText(context, [
        "high performing team exceeding expectations",
        "stable team meeting targets",
        "team needs improvement and support",
        "team showing growth potential",
      ]);

      const topLabel = classification.labels[0];
      let trend: "up" | "down" | "stable" = "stable";
      let insight = "";

      if (topLabel.includes("high performing")) {
        trend = "up";
        insight = `${dept} is excelling with ${avgImpact.toFixed(0)}% avg impact. Consider as model for other teams.`;
      } else if (topLabel.includes("needs improvement")) {
        trend = "down";
        insight = `${dept} requires attention. Review workload distribution and provide additional resources.`;
      } else if (topLabel.includes("growth")) {
        trend = "up";
        insight = `${dept} shows promising growth trajectory. Continue current initiatives.`;
      } else {
        insight = `${dept} maintains steady performance with ${avgTasks.toFixed(0)} tasks avg per member.`;
      }

      departmentInsights.push({ department: dept, insight, trend });
    } catch (error) {
      departmentInsights.push({
        department: dept,
        insight: `${dept}: ${emps.length} members, ${avgImpact.toFixed(0)}% avg impact`,
        trend: avgImpact >= 70 ? "up" : avgImpact >= 50 ? "stable" : "down",
      });
    }
  }

  const overallAvgImpact = employees.reduce((sum, e) => sum + e.impactScore, 0) / employees.length;
  const overallHealth = overallAvgImpact >= 75 
    ? "Excellent overall team health. High engagement and productivity across departments."
    : overallAvgImpact >= 60
    ? "Good team health with room for improvement in specific areas."
    : "Team health needs attention. Consider organization-wide wellness initiatives.";

  return { departmentInsights, overallHealth };
}

export const aiService = {
  analyzeSentiment,
  classifyText,
  generateEmployeeSummary,
  analyzeBurnoutRisk,
  generateInsights,
  analyzeTeamPerformance,
};

export default aiService;
