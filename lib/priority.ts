export function calculatePriority(
  severity: string,
  sentiment: string
) {
  let score = 0;

  //severity contributes most to priority
  if (severity === "high") {
    score += 70;
  } else if (severity === "medium") {
    score += 45;
  } else if (severity === "low") {
    score += 20;
  }

  //negative sentiment increases urgency
  if (sentiment === "negative") {
    score += 25;
  } else if (sentiment === "neutral") {
    score += 10;
  }

  //positive complaints are generally low priority
  if (sentiment === "positive") {
    score -= 10;
  }

  // keeps score between 0 and 100
  score = Math.max(0, Math.min(score, 100));

  let reason = "";

  if (score >= 80) {
    reason =
      "High-priority complaint requiring immediate attention.";
  } else if (score >= 50) {
    reason =
      "Complaint requires attention but is not immediately critical.";
  } else {
    reason =
      "Lower-priority complaint that can be handled during normal operations.";
  }

  return {
    score,
    reason,
  };
}