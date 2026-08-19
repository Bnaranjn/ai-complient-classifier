import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const complaints = await prisma.complaint.findMany({
      select: {
        category: true,
        sentiment: true,
        severity: true,
      },
    });

    const stats = {
      total: complaints.length,

      sentiment: {
        positive: 0,
        neutral: 0,
        negative: 0,
      },

      severity: {
        low: 0,
        medium: 0,
        high: 0,
      },

      categories: {
        delivery: 0,
        billing: 0,
        product: 0,
        support: 0,
        other: 0,
      },
    };

    for (const complaint of complaints) {
      // Sentiment
      if (complaint.sentiment === "positive") {
        stats.sentiment.positive++;
      }

      if (complaint.sentiment === "neutral") {
        stats.sentiment.neutral++;
      }

      if (complaint.sentiment === "negative") {
        stats.sentiment.negative++;
      }

      // Severity
      if (complaint.severity === "low") {
        stats.severity.low++;
      }

      if (complaint.severity === "medium") {
        stats.severity.medium++;
      }

      if (complaint.severity === "high") {
        stats.severity.high++;
      }

      // Category
      if (complaint.category === "delivery") {
        stats.categories.delivery++;
      }

      if (complaint.category === "billing") {
        stats.categories.billing++;
      }

      if (complaint.category === "product") {
        stats.categories.product++;
      }

      if (complaint.category === "support") {
        stats.categories.support++;
      }

      if (complaint.category === "other") {
        stats.categories.other++;
      }
    }

    return Response.json(stats);

  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Failed to calculate complaint statistics",
      },
      {
        status: 500,
      }
    );
  }
}