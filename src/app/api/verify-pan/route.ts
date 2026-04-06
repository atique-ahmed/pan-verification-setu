import { NextRequest, NextResponse } from "next/server";
import { SetuPANResponse, FormattedResponse } from "@/types/pan";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pan, name } = body;

    // Validate PAN format
    if (
      !pan ||
      pan.length !== 10 ||
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid PAN format. PAN should be 10 characters (e.g., ABCDE1234F)",
        },
        { status: 400 },
      );
    }

    const clientId = process.env.SETU_CLIENT_ID;
    const clientSecret = process.env.SETU_CLIENT_SECRET;
    const productInstanceId = process.env.SETU_PRODUCT_INSTANCE_ID;
    const apiUrl = process.env.SETU_API_URL;

    if (!clientId || !clientSecret || !productInstanceId) {
      console.error("Missing Setu credentials");
      return NextResponse.json(
        { success: false, error: "API configuration error" },
        { status: 500 },
      );
    }

    // Call Setu PAN Verification API
    const response = await fetch(apiUrl!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "x-client-secret": clientSecret,
        "x-product-instance-id": productInstanceId,
      },
      body: JSON.stringify({
        pan: pan.toUpperCase(),
        consent: "Y",
        reason: name
          ? `PAN verification for user ${name} during onboarding`
          : "PAN verification for user onboarding",
      }),
    });

    const data: SetuPANResponse = await response.json();

    console.log("data", data);

    // Handle API errors
    if (!response.ok) {
      console.error("Setu API error:", data);

      // Check for specific error cases
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          status: "not_found",
          error: "PAN not found in government records",
        } as FormattedResponse);
      }

      return NextResponse.json(
        {
          success: false,
          status: "error",
          error: data.error || data.message || "Verification failed",
        } as FormattedResponse,
        { status: response.status },
      );
    }

    // Format successful response
    const isVerified = data.verification?.toLowerCase() === "success";
    const formattedResponse: FormattedResponse = {
      success: isVerified,
      pan: pan.toUpperCase(),
      status: isVerified ? "valid" : "invalid",
      full_name: data.data?.full_name,
      category: data.data?.category,
      aadhaar_linked: data.data?.aadhaar_seeding_status === "LINKED",
      message: data.message,
    };

    // Check name match if name was provided
    if (name && data.data?.full_name) {
      const normalizedInput = name.trim().toLowerCase();
      const normalizedFull = data.data.full_name.toLowerCase();
      formattedResponse.name_match = normalizedInput === normalizedFull;
    }

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("PAN verification error:", error);
    return NextResponse.json(
      {
        success: false,
        status: "error",
        error:
          error instanceof Error ? error.message : "Network error occurred",
      } as FormattedResponse,
      { status: 500 },
    );
  }
}
