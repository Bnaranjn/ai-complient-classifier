import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    // Get ID from URL
    const { id } = await params;

    const complaintId = Number(id);


    // Check whether ID is valid
    if (Number.isNaN(complaintId)) {

      return Response.json(
        {
          error: "Invalid complaint ID",
        },
        {
          status: 400,
        }
      );
    }


    // Find complaint
    const complaint = await prisma.complaint.findUnique({

      where: {
        id: complaintId,
      },

    });


    // Complaint doesn't exist
    if (!complaint) {

      return Response.json(
        {
          error: "Complaint not found",
        },
        {
          status: 404,
        }
      );
    }


    // Return complaint
    return Response.json(complaint);

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        error: "Failed to fetch complaint",
      },
      {
        status: 500,
      }
    );
  }
}