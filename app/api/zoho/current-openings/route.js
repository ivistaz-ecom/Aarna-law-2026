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
// FILE VALIDATION & PROCESSING
// ============================================================================

/**
 * Validates file data from request
 * WHY: Security - prevent malicious files, enforce size limits, validate types
 */
function validateFileData(fileData, fileName) {
  const errors = [];

  if (!fileData) {
    return { valid: false, errors: ["File is required"] };
  }

  // Extract base64 data if it's a data URL
  let base64Data = fileData;
  if (fileData.includes(",")) {
    const parts = fileData.split(",");
    if (parts.length !== 2) {
      errors.push("Invalid file data format");
      return { valid: false, errors };
    }
    base64Data = parts[1];
  }

  // Validate base64 format
  // WHY: Ensure data is actually base64 encoded
  if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
    errors.push("Invalid file data encoding");
    return { valid: false, errors };
  }

  // Calculate file size from base64 (base64 is ~33% larger than binary)
  // WHY: Enforce 20MB limit as per Zoho's requirements
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  const estimatedSize = (base64Data.length * 3) / 4;
  if (estimatedSize > MAX_FILE_SIZE) {
    errors.push(`File size exceeds 20MB limit. Please upload a smaller file.`);
    return { valid: false, errors };
  }

  // Validate file type from filename
  // WHY: Only allow PDF and DOCX as specified
  const allowedExtensions = [".pdf", ".docx"];
  const fileExtension = fileName
    ? fileName.toLowerCase().substring(fileName.lastIndexOf("."))
    : "";

  if (!allowedExtensions.includes(fileExtension)) {
    errors.push(
      "Only PDF and DOCX files are allowed. Please upload a valid file.",
    );
    return { valid: false, errors };
  }

  // Validate MIME type if present in data URL
  if (fileData.includes("data:")) {
    const mimeMatch = fileData.match(/data:([^;]+);base64/);
    if (mimeMatch) {
      const mimeType = mimeMatch[1].toLowerCase();
      const allowedMimeTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedMimeTypes.includes(mimeType)) {
        errors.push("Invalid file type. Only PDF and DOCX files are allowed.");
        return { valid: false, errors };
      }
    }
  }

  return { valid: true, base64Data, errors: [] };
}

/**
 * Safely converts base64 data URL to Buffer
 * WHY: Safe conversion prevents buffer overflow and encoding issues
 */
function base64ToBuffer(base64Data) {
  try {
    // Validate base64 string before conversion
    if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
      throw new Error("Invalid base64 encoding");
    }
    return Buffer.from(base64Data, "base64");
  } catch (error) {
    throw new Error(`Failed to convert file data: ${error.message}`);
  }
}

// ============================================================================
// ZOHO API FUNCTIONS
// ============================================================================

/**
 * Creates a Current_Openings record in Zoho CRM
 * WHY: Separated for clarity and testability
 */
async function createCurrentOpeningRecord(payload, accessToken) {
  const zohoApiUrl = "https://www.zohoapis.in/crm/v2/Current_Openings";
  const authHeader = `Zoho-oauthtoken ${accessToken}`;

  const response = await fetch(zohoApiUrl, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let responseData;

  try {
    responseData = JSON.parse(responseText);
  } catch (parseError) {
    console.error("❌ Failed to parse Zoho response as JSON:", parseError);
    throw new Error("Invalid JSON response from Zoho API");
  }

  return { response, responseData };
}

/**
 * Attaches a file to an existing Zoho CRM record and updates the File field
 * WHY: Files must be attached AFTER record creation (Zoho requirement)
 * Uses form-data library for proper multipart/form-data encoding
 * After attachment, updates the record's File field with the file ID
 */
async function attachFileToRecord(recordId, fileData, fileName, accessToken) {
  try {
    // Validate file data first
    const validation = validateFileData(fileData, fileName);
    if (!validation.valid) {
      throw new Error(validation.errors.join(", "));
    }

    // Safely convert base64 to buffer
    const fileBuffer = base64ToBuffer(validation.base64Data);

    // Zoho attachment endpoint
    // WHY: Zoho requires attaching files via separate endpoint after record creation
    const attachUrl = `https://www.zohoapis.in/crm/v2/Current_Openings/${recordId}/Attachments`;

    // Construct multipart/form-data manually for Node.js compatibility
    // WHY: Node.js fetch doesn't handle form-data library streams correctly
    // We manually construct the multipart body with proper boundaries
    const boundary = `----WebKitFormBoundary${Date.now()}${Math.random().toString(36).substring(2, 15)}`;
    const CRLF = "\r\n";

    // Build multipart form data body
    const formDataParts = [
      Buffer.from(`--${boundary}${CRLF}`),
      Buffer.from(
        `Content-Disposition: form-data; name="file"; filename="${fileName}"${CRLF}`,
      ),
      Buffer.from(`Content-Type: application/octet-stream${CRLF}${CRLF}`),
      fileBuffer,
      Buffer.from(`${CRLF}--${boundary}--${CRLF}`),
    ];

    const formDataBody = Buffer.concat(formDataParts);

    const attachResponse = await fetch(attachUrl, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": formDataBody.length.toString(),
      },
      body: formDataBody,
    });

    const attachResult = await attachResponse.json();

    // Check if attachment was successful
    if (!attachResponse.ok) {
      const errorMsg =
        attachResult.data?.[0]?.message ||
        attachResult.message ||
        "Failed to attach file";
      throw new Error(errorMsg);
    }

    // Extract file ID from attachment response
    // WHY: Zoho returns file details including ID, which we need for the File field
    const attachmentDetails = attachResult.data?.[0]?.details || {};
    let fileId =
      attachmentDetails.id ||
      attachmentDetails.file_id ||
      attachResult.data?.[0]?.id ||
      attachResult.id;

    // Fetch the attachments list to get file hash
    // WHY: File_Id__s requires the file hash (not numeric ID) based on Zoho documentation
    // NOTE: Single attachment detail endpoint returns file content, not JSON, so we use list endpoint
    let fileHash = null;
    if (fileId) {
      const attachmentsUrl = `https://www.zohoapis.in/crm/v2/Current_Openings/${recordId}/Attachments`;
      const attachmentsResponse = await fetch(attachmentsUrl, {
        method: "GET",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      });

      if (attachmentsResponse.ok) {
        const responseText = await attachmentsResponse.text();
        let attachmentsResult;

        try {
          attachmentsResult = JSON.parse(responseText);
        } catch (parseError) {
          attachmentsResult = null;
        }

        if (
          attachmentsResult &&
          attachmentsResult.data &&
          attachmentsResult.data.length > 0
        ) {
          // Find the attachment matching our file ID
          const matchingAttachment =
            attachmentsResult.data.find(
              (att) =>
                att.id === fileId || att.id?.toString() === fileId?.toString(),
            ) || attachmentsResult.data[0]; // Fallback to first if not found

          // Extract file hash - Zoho uses $file_id for the hash
          // WHY: File_Id__s requires the file hash (like "fdy6b48c3715ee93a4086ba7cec5bb11fdd57"), not numeric ID
          fileHash =
            matchingAttachment.$file_id || // This is the hash we need!
            matchingAttachment.file_hash ||
            matchingAttachment.hash ||
            matchingAttachment.File_Id__s ||
            matchingAttachment.file_id;
        }
      }
    }

    // Use file hash if available, otherwise use file ID
    // WHY: Based on Zoho documentation, File_Id__s appears to be a hash string, not numeric ID
    // But if hash is not available, we'll try with the numeric ID
    const fileIdentifier = fileHash || fileId;

    if (fileIdentifier) {
      // Update the record to set the File field with file ID
      // WHY: The File field expects an array with File_Name__s and File_Id__s
      const updateUrl = `https://www.zohoapis.in/crm/v2/Current_Openings/${recordId}`;
      const updatePayload = {
        data: [
          {
            id: recordId, // Include record ID in update payload
            File: [
              {
                File_Name__s: fileName,
                File_Id__s: fileIdentifier.toString(), // Use hash if available, otherwise ID
              },
            ],
          },
        ],
      };

      const updateResponse = await fetch(updateUrl, {
        method: "PUT",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      const updateResult = await updateResponse.json();

      if (!updateResponse.ok || updateResult.data?.[0]?.code !== "SUCCESS") {
        // Don't throw - file is attached, just File field not updated
      }
    }

    return attachResult;
  } catch (error) {
    console.error("❌ File attachment error:", error);
    throw error; // Re-throw to allow caller to handle
  }
}

// ============================================================================
// ERROR HANDLING & MAPPING
// ============================================================================

/**
 * Maps Zoho error codes to user-friendly messages
 * WHY: Zoho returns technical error codes, we need user-friendly messages
 */
function mapZohoError(errorCode, errorMessage, errorDetails) {
  const errorMap = {
    DUPLICATE_DATA: {
      message: "This information already exists in our system.",
      status: 409,
    },
    MANDATORY_NOT_FOUND: {
      message: "Required information is missing.",
      status: 400,
    },
    INVALID_DATA: {
      message: "Invalid data provided. Please check your information.",
      status: 400,
    },
    AUTHENTICATION_FAILURE: {
      message: "Authentication failed. Please contact support.",
      status: 401,
    },
    INVALID_TOKEN: {
      message: "Session expired. Please try again.",
      status: 401,
    },
  };

  // Check for duplicate field
  let duplicateField = null;
  if (errorCode === "DUPLICATE_DATA" && errorDetails?.api_name) {
    const apiName = errorDetails.api_name.toLowerCase();
    if (apiName === "email" || apiName.includes("email")) {
      duplicateField = "Email";
      return {
        message:
          "This email address already exists in our system. Please use a different email address.",
        status: 409,
        duplicateField: "Email",
      };
    } else if (
      apiName === "mobile" ||
      apiName === "phone" ||
      apiName === "phone_number" ||
      apiName.includes("mobile") ||
      apiName.includes("phone")
    ) {
      duplicateField = "Mobile";
      return {
        message:
          "This mobile number already exists in our system. Please use a different mobile number.",
        status: 409,
        duplicateField: "Mobile",
      };
    }
  }

  // Use mapped error or fallback
  const mapped = errorMap[errorCode];
  if (mapped) {
    return {
      message: mapped.message,
      status: mapped.status,
      duplicateField,
    };
  }

  // Fallback to error message or generic message
  return {
    message: errorMessage || "Failed to submit application. Please try again.",
    status: 400,
    duplicateField,
  };
}

// ============================================================================
// API ROUTE HANDLERS
// ============================================================================

// GET handler for testing
export async function GET() {
  const hasRefreshToken = !!process.env.ZOHO_CRM_REFRESH_TOKEN;
  const hasClientId = !!process.env.ZOHO_CRM_CLIENT_ID;
  const hasClientSecret = !!process.env.ZOHO_CRM_CLIENT_SECRET;

  return NextResponse.json({
    message: "Zoho Current Openings API route is accessible",
    endpoint: "/api/zoho/current-openings",
    method: "POST",
    timestamp: new Date().toISOString(),
    oauthConfigured: hasRefreshToken && hasClientId && hasClientSecret,
    zohoApiUrl: "https://www.zohoapis.in/crm/v2/Current_Openings",
  });
}

export async function POST(request) {
  try {
    // Parse request body
    // WHY: Next.js automatically parses JSON, but we validate structure
    const body = await request.json();

    // Validate request structure
    if (!body.data || !Array.isArray(body.data) || body.data.length === 0) {
      return NextResponse.json(
        { error: "Invalid request format. Expected { data: [...] }" },
        { status: 400 },
      );
    }

    // Get access token with error handling
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

    // Prepare payload - map form fields to Zoho field names
    // WHY: Zoho uses specific field names that must match exactly
    const payload = {
      data: body.data.map((item) => ({
        Name: `${item.First_Name} ${item.Last_Name}`.trim(), // Required by Zoho
        First_Name: item.First_Name,
        Last_Name: item.Last_Name,
        Email: item.Email,
        Phone_number: item.Mobile || item.Phone_Number, // Zoho field name
        College: item.College || "",
        Role: item.Role || "",
        Number_of_years_of_post_qualification_experience:
          item.Years_of_Experience || "", // Full Zoho field name
        // Note: File is attached separately after record creation
        Lead_Source: "Website"
      })),
    };

    // Create the record in Zoho
    let response, responseData;
    try {
      const result = await createCurrentOpeningRecord(payload, accessToken);
      response = result.response;
      responseData = result.responseData;
    } catch (apiError) {
      console.error("❌ Zoho API call failed:", apiError);
      return NextResponse.json(
        {
          error: "Failed to connect to Zoho CRM. Please try again later.",
          details: apiError.message,
        },
        { status: 500 },
      );
    }

    // Parse Zoho response
    const errorData = responseData.data?.[0];
    const errorCode = errorData?.code;
    const errorStatus = errorData?.status;
    const errorMessage = errorData?.message || responseData.message;
    const errorDetails = errorData?.details;

    // Check if it's a success response
    // WHY: Zoho sometimes returns 200/202 with success code in body
    const isSuccess =
      errorCode === "SUCCESS" ||
      errorStatus === "success" ||
      (errorMessage && /record added|success/i.test(errorMessage));

    // Handle success response
    if (isSuccess) {
      const recordId = errorData?.details?.id;

      // Attach file if provided (non-blocking)
      // WHY: File attachment is separate operation, shouldn't block success response
      if (recordId && body.data[0]?.Resume) {
        // Attach file asynchronously (don't await to keep response fast)
        attachFileToRecord(
          recordId,
          body.data[0].Resume,
          body.data[0].ResumeFileName || "resume.pdf",
          accessToken,
        ).catch((fileError) => {
          // Log error but don't fail the request
          // WHY: Record is already created, file attachment failure is non-critical
          console.error(
            "⚠️ Failed to attach file, but record was created:",
            fileError.message,
          );
        });
      }

      return NextResponse.json(
        {
          success: true,
          data: responseData,
          zohoResponse: responseData,
          recordId: recordId,
          message: "Application submitted successfully",
        },
        { status: 200 },
      );
    }

    // Handle error response
    // WHY: Zoho returns various error codes that need user-friendly mapping
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
    console.error("❌ Error in Zoho Current Openings API route:", error);
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
