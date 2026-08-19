import { prisma } from "@/lib/prisma";
import { complaintSchema } from "@/lib/validation";
import { analyzeComplaint } from "@/lib/ai";
import { calculatePriority } from "@/lib/priority";


// ==========================================
// GET ALL COMPLAINTS
// ==========================================

export async function GET() {
  try {
    const complaints = await prisma.complaint.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(complaints);

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        error: "Failed to fetch complaints",
      },
      {
        status: 500,
      }
    );
  }
}


// ==========================================
// CREATE + ANALYZE COMPLAINT
// ==========================================

export async function POST(request: Request) {
  try {

    // 1. Get request body
    const body = await request.json();


    // 2. Validate user's input
    const result = complaintSchema.safeParse(body);

    if (!result.success) {

      return Response.json(
        {
          error: "Invalid complaint",
          details: result.error.issues,
        },
        {
          status: 400,
        }
      );
    }


    // 3. Send complaint to Gemini
    const analysis = await analyzeComplaint(
      result.data.text
    );
    const priority = calculatePriority(
  analysis.severity,
  analysis.sentiment
);


    // 4. Save complaint + AI analysis
    const complaint = await prisma.complaint.create({

      data: {

        text: result.data.text,

        category: analysis.category,

        sentiment: analysis.sentiment,

        severity: analysis.severity,

        summary: analysis.summary,

        suggestedAction: analysis.suggestedAction,
        priorityScore: priority.score,
    priorityReason: priority.reason,
      },
    });


    // 5. Return completed complaint
    return Response.json(
      complaint,
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        error: "Failed to analyze complaint",
      },
      {
        status: 500,
      }
    );
  }
}