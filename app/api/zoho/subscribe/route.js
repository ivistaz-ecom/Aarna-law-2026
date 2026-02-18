import { NextResponse } from "next/server";

// Route segment config
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================================
// TOKEN CACHE & OAUTH MANAGEMENT
// ============================================================================

// In-memory token cache (lives while Node process runs)
// WHY: Prevents unnecessary token refresh calls, improves performance
if (!globalThis.__ZOHO_TOKEN_CACHE) {
  globalThis.__ZOHO_TOKEN_CACHE = {
    access_token: null,
    expires_at: 0,
    refreshPromise: null, // Prevents multiple simultaneous refresh calls
  };
}

/**
 * Get a valid access token using refresh token
 * WHY: Zoho tokens expire every 3600 seconds (1 hour), must be refreshed
 * Handles race conditions to prevent multiple simultaneous refresh calls
 */
async function getZohoAccessToken() {
  const cache = globalThis.__ZOHO_TOKEN_CACHE;
  const now = Date.now();

  // Return cached token if still valid (with 30 second buffer to avoid edge cases)
  // WHY: 30s buffer prevents token expiry during API calls
  if (
    cache.access_token &&
    cache.expires_at &&
    now < cache.expires_at - 30000
  ) {
    return cache.access_token;
  }

  // Prevent multiple simultaneous refresh calls (race condition protection)
  // WHY: If multiple requests come in simultaneously, only one should refresh
  if (cache.refreshPromise) {
    return await cache.refreshPromise;
  }

  // Get OAuth credentials from environment
  const refreshToken = process.env.ZOHO_CRM_REFRESH_TOKEN?.trim();
  const clientId = process.env.ZOHO_CRM_CLIENT_ID?.trim();
  const clientSecret = process.env.ZOHO_CRM_CLIENT_SECRET?.trim();
  const accountsDomain =
    process.env.ZOHO_CRM_ACCOUNTS_DOMAIN?.trim() || "https://accounts.zoho.in";

  if (!refreshToken || !clientId || !clientSecret) {
    const missing = [];
    if (!refreshToken) missing.push("ZOHO_CRM_REFRESH_TOKEN");
    if (!clientId) missing.push("ZOHO_CRM_CLIENT_ID");
    if (!clientSecret) missing.push("ZOHO_CRM_CLIENT_SECRET");
    throw new Error(
      `Missing Zoho OAuth credentials: ${missing.join(", ")}. Please set these environment variables.`,
    );
  }

  // Create refresh promise and store it to prevent concurrent refreshes
  cache.refreshPromise = (async () => {
    try {
      // Build the token refresh URL
      // WHY: Zoho requires refresh token flow for server-to-server auth
      const tokenUrl = `${accountsDomain}/oauth/v2/token?refresh_token=${encodeURIComponent(refreshToken)}&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&grant_type=refresh_token`;

      // Make the token refresh request (POST as specified by Zoho)
      const tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const tokenResponseText = await tokenResponse.text();

      let tokenData;
      try {
        tokenData = JSON.parse(tokenResponseText);
      } catch (parseError) {
        console.error("❌ Failed to parse token response:", tokenResponseText);
        throw new Error("Failed to refresh Zoho token (invalid JSON response)");
      }

      // Validate token response
      if (!tokenResponse.ok || !tokenData.access_token) {
        console.error("❌ Zoho token refresh error:", tokenData);
        const errorMsg =
          tokenData.error_description ||
          tokenData.error ||
          tokenData.message ||
          "Unknown token error";
        throw new Error(`Failed to refresh Zoho token: ${errorMsg}`);
      }

      // Cache the new access token
      // WHY: Zoho tokens expire in 3600 seconds (1 hour), cache to avoid frequent refreshes
      const accessToken = tokenData.access_token;
      const expiresIn = tokenData.expires_in || 3600; // Default to 3600 seconds as per Zoho
      cache.access_token = accessToken;
      cache.expires_at = Date.now() + expiresIn * 1000;

      return accessToken;
    } finally {
      // Clear refresh promise after completion (success or failure)
      cache.refreshPromise = null;
    }
  })();

  try {
    return await cache.refreshPromise;
  } catch (error) {
    // Clear cache on error to force refresh on next attempt
    cache.access_token = null;
    cache.expires_at = 0;
    throw error;
  }
}

// ============================================================================
// ZOHO ERROR MAPPING
// ============================================================================

/**
 * Maps Zoho error codes to user-friendly messages
 * WHY: Zoho error codes are technical, users need clear feedback
 */
function mapZohoError(errorCode, errorMessage, errorDetails) {
  const defaultMessage =
    errorMessage || "Failed to subscribe. Please try again.";

  switch (errorCode) {
    case "DUPLICATE_DATA":
      // Check if the duplicate is specifically for email field
      let duplicateField = null;
      let userFriendlyMessage =
        "This email address is already subscribed. Please use a different email address.";

      // Check errorDetails for api_name to identify which field is duplicate
      if (errorDetails?.api_name) {
        const apiName = errorDetails.api_name.toLowerCase();
        if (apiName === "email" || apiName.includes("email")) {
          duplicateField = "Email";
          userFriendlyMessage =
            "This email address is already subscribed. Please use a different email address.";
        }
      }

      // Also check the error message for hints if api_name didn't help
      if (!duplicateField && /email/i.test(errorMessage)) {
        duplicateField = "Email";
        userFriendlyMessage =
          "This email address is already subscribed. Please use a different email address.";
      }

      // If we can't identify the field but it's a duplicate, assume it's email
      if (!duplicateField) {
        duplicateField = "Email";
      }

      return {
        message: userFriendlyMessage,
        duplicateField: duplicateField,
        status: 409,
      };
    case "MANDATORY_NOT_FOUND":
      return {
        message:
          "Required information is missing. Please fill all required fields.",
        status: 400,
      };
    case "INVALID_DATA":
      return {
        message:
          "Invalid information provided. Please check your input and try again.",
        status: 400,
      };
    case "AUTHENTICATION_FAILURE":
      return {
        message: "Authentication error. Please contact support.",
        status: 401,
      };
    default:
      return {
        message: defaultMessage,
        status: errorCode === "DUPLICATE_DATA" ? 409 : 400,
      };
  }
}

// ============================================================================
// API HANDLERS
// ============================================================================

/**
 * GET handler for testing
 * WHY: Allows verification that the endpoint is accessible
 */
export async function GET() {
  return NextResponse.json({
    message: "Zoho Subscribe API route is accessible",
    endpoint: "/api/zoho/subscribe",
    method: "POST",
    timestamp: new Date().toISOString(),
    zohoApiUrl: "https://www.zohoapis.in/crm/v8/Subscribe_to_Newsletter",
  });
}

/**
 * POST handler for newsletter subscription
 * WHY: Creates a record in Zoho CRM Subscribe_to_Newsletter module
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate request body structure
    if (!body.data || !Array.isArray(body.data) || body.data.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid request format. Expected { data: [...] }",
        },
        { status: 400 },
      );
    }

    // Get access token
    let accessToken;
    try {
      accessToken = await getZohoAccessToken();
    } catch (tokenError) {
      console.error("❌ Failed to get access token:", tokenError);
      return NextResponse.json(
        {
          error: "Authentication failed. Unable to get access token.",
          details: tokenError.message,
        },
        { status: 401 },
      );
    }

    // Prepare payload for Zoho CRM
    // WHY: Map frontend field names to Zoho CRM field names
    // Zoho expects Pick_Your_Interests as an array, not a string
    const payload = {
      data: body.data.map((item) => {
        const payloadItem = {
          Name: item.Name?.trim(),
          Email: item.Email?.trim(),
          Lead_Source: "Website"
        };

        // Handle Interests: convert string to array or keep as array
        // Zoho expects Pick_Your_Interests as an array format
        let interestsArray = [];

        if (item.Interests) {
          if (typeof item.Interests === "string") {
            // If it's a comma-separated string, convert to array
            interestsArray = item.Interests.split(",")
              .map((i) => i.trim())
              .filter((i) => i.length > 0);
          } else if (Array.isArray(item.Interests)) {
            // If it's already an array, use it directly (filter out empty values)
            interestsArray = item.Interests.map((i) =>
              typeof i === "string" ? i.trim() : i,
            ).filter((i) => i && i.length > 0);
          }
        }

        // Always include Pick_Your_Interests field (as array, even if empty)
        // WHY: Zoho stores it as an array, empty array [] when no interests selected
        payloadItem.Pick_Your_Interests = interestsArray;

        return payloadItem;
      }),
    };

    // Zoho CRM API endpoint for Subscribe_to_Newsletter module (v8)
    const zohoApiUrl = "https://www.zohoapis.in/crm/v8/Subscribe_to_Newsletter";

    // Make API call to Zoho CRM
    const response = await fetch(zohoApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Parse response
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Failed to parse Zoho response:", responseText);
      return NextResponse.json(
        {
          error: "Invalid response from Zoho API",
          details: responseText.substring(0, 200),
        },
        { status: 500 },
      );
    }

    // Check for success response
    const responseItem = responseData.data?.[0];
    const errorCode = responseItem?.code;
    const errorStatus = responseItem?.status;
    const errorMessage = responseItem?.message || responseData.message;
    const errorDetails = responseItem?.details;

    const isSuccess =
      errorCode === "SUCCESS" ||
      errorStatus === "success" ||
      (errorMessage && /record added|success/i.test(errorMessage));

    // Handle success
    if (isSuccess) {
      const recordId = responseItem?.details?.id;
      return NextResponse.json(
        {
          success: true,
          data: responseData,
          zohoResponse: responseData,
          recordId: recordId,
          message: "Successfully subscribed to newsletter",
        },
        { status: 200 },
      );
    }

    // Handle error response
    const errorMapping = mapZohoError(errorCode, errorMessage, errorDetails);
    console.error("❌ Zoho API Error:", {
      code: errorCode,
      message: errorMessage,
      details: errorDetails,
    });

    return NextResponse.json(
      {
        error: errorMapping.message,
        duplicateField: errorMapping.duplicateField,
        zohoResponse: responseData,
        zohoErrorCode: errorCode,
      },
      { status: errorMapping.status },
    );
  } catch (error) {
    // Catch-all error handler
    // WHY: Prevents unhandled exceptions from crashing the API
    console.error("❌ Error in Zoho Subscribe API route:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);

    return NextResponse.json(
      {
        error: "Internal server error. Please try again later.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
