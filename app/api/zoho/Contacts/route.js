import { NextResponse } from 'next/server';

// Route segment config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory token cache (lives while Node process runs)
if (!globalThis.__ZOHO_TOKEN_CACHE) {
    globalThis.__ZOHO_TOKEN_CACHE = { access_token: null, expires_at: 0 };
}

/**
 * Get a valid access token using refresh token
 * Tokens expire every 3600 seconds (1 hour) and are automatically refreshed
 * Uses the exact OAuth refresh token flow as specified by Zoho
 */
async function getAccessToken() {
    const cache = globalThis.__ZOHO_TOKEN_CACHE;
    const now = Date.now();

    // Return cached token if still valid (with 30 second buffer to avoid edge cases)
    if (cache.access_token && cache.expires_at && now < cache.expires_at - 30000) {
        const remainingSeconds = Math.floor((cache.expires_at - now) / 1000);
        console.log(`✅ Using cached access token (expires in ${remainingSeconds}s)`);
        return cache.access_token;
    }

    // Get OAuth credentials from environment
    const refreshToken = process.env.ZOHO_CRM_REFRESH_TOKEN?.trim();
    const clientId = process.env.ZOHO_CRM_CLIENT_ID?.trim();
    const clientSecret = process.env.ZOHO_CRM_CLIENT_SECRET?.trim();
    const accountsDomain = process.env.ZOHO_CRM_ACCOUNTS_DOMAIN?.trim() || 'https://accounts.zoho.in';

    if (!refreshToken || !clientId || !clientSecret) {
        throw new Error('Missing Zoho OAuth credentials. Set ZOHO_CRM_REFRESH_TOKEN, ZOHO_CRM_CLIENT_ID, and ZOHO_CRM_CLIENT_SECRET.');
    }

    console.log('🔄 Refreshing access token (expires every 3600 seconds / 1 hour)...');
    console.log('📍 Accounts URL:', accountsDomain);
    console.log('🔑 Client ID:', clientId.substring(0, 20) + '...');
    console.log('🔑 Refresh Token:', refreshToken.substring(0, 20) + '...');

    // Build the token refresh URL exactly as per your curl example
    // Format: https://accounts.zoho.in/oauth/v2/token?refresh_token={refresh_token}&client_id={client_id}&client_secret={client_secret}&grant_type=refresh_token
    // Note: No redirect_uri in the query string as per your curl example
    const tokenUrl = `${accountsDomain}/oauth/v2/token?refresh_token=${encodeURIComponent(refreshToken)}&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&grant_type=refresh_token`;

    console.log('🌐 Token Refresh URL:', tokenUrl.replace(/client_secret=[^&]+/, 'client_secret=***'));
    console.log('📋 Request Type: POST');

    // Make the token refresh request (POST as specified)
    const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    const tokenResponseText = await tokenResponse.text();
    console.log('📥 Token Response Status:', tokenResponse.status, tokenResponse.statusText);
    console.log('📥 Token Response Text:', tokenResponseText.substring(0, 200));

    let tokenData;
    try {
        tokenData = JSON.parse(tokenResponseText);
    } catch (parseError) {
        console.error('❌ Failed to parse token response:', tokenResponseText);
        throw new Error('Failed to refresh Zoho token (invalid response)');
    }

    if (!tokenResponse.ok || !tokenData.access_token) {
        console.error('❌ Zoho token refresh error:', tokenData);
        const errorMsg = tokenData.error_description || tokenData.error || tokenData.message || 'Unknown token error';
        throw new Error(`Failed to refresh Zoho token: ${errorMsg}`);
    }

    // Cache the new access token
    // Zoho tokens expire in 3600 seconds (1 hour)
    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in || 3600; // Default to 3600 seconds (1 hour) as per Zoho
    cache.access_token = accessToken;
    cache.expires_at = Date.now() + (expiresIn * 1000);

    console.log('✅ Successfully refreshed access token');
    console.log('⏰ Token expires in:', expiresIn, 'seconds (', Math.floor(expiresIn / 60), 'minutes )');
    console.log('🕐 Token will expire at:', new Date(cache.expires_at).toISOString());

    return accessToken;
}

// GET handler for testing
export async function GET() {
    console.log('=== ZOHO API ROUTE GET TEST ===');

    const hasRefreshToken = !!process.env.ZOHO_CRM_REFRESH_TOKEN;
    const hasClientId = !!process.env.ZOHO_CRM_CLIENT_ID;
    const hasClientSecret = !!process.env.ZOHO_CRM_CLIENT_SECRET;

    return NextResponse.json({
        message: 'Zoho API route is accessible',
        endpoint: '/api/zoho/Contacts',
        method: 'POST',
        timestamp: new Date().toISOString(),
        oauthConfigured: hasRefreshToken && hasClientId && hasClientSecret,
        zohoApiUrl: 'https://www.zohoapis.in/crm/v2/Contacts'
    });
}

export async function POST(request) {
    console.log('=== ZOHO API ROUTE CALLED ===');
    console.log('📍 Route: /api/zoho/Contacts');
    console.log('🕐 Timestamp:', new Date().toISOString());

    try {
        const body = await request.json();
        console.log('📥 Received request body:', JSON.stringify(body, null, 2));

        // Validate the request body
        if (!body.data || !Array.isArray(body.data) || body.data.length === 0) {
            console.error('❌ Invalid request format');
            return NextResponse.json(
                { error: 'Invalid request format. Expected { data: [...] }' },
                { status: 400 }
            );
        }

        // Get access token using refresh token flow
        let accessToken;
        try {
            accessToken = await getAccessToken();
            console.log('✅ Access token obtained:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT SET');
        } catch (tokenError) {
            console.error('❌ Failed to get access token:', tokenError);
            return NextResponse.json(
                { error: 'Authentication failed. Unable to get access token.', details: tokenError.message },
                { status: 401 }
            );
        }

        // Prepare the request payload - using the exact field names from your form
        const payload = {
            data: body.data.map(item => ({
                First_Name: item.First_Name,
                Last_Name: item.Last_Name,
                Email: item.Email,
                Mobile: item.Mobile,
                Message: item.Message,
                Lead_Source: "Website"
            }))
        };
        console.log('📤 Sending to Zoho API:', JSON.stringify(payload, null, 2));

        // Zoho Leads API endpoint as specified
        const zohoApiUrl = 'https://www.zohoapis.in/crm/v2/Contacts';
        console.log('🌐 Zoho API URL:', zohoApiUrl);
        console.log('📋 Method: POST');

        // Verify Authorization header format
        const authHeader = `Zoho-oauthtoken ${accessToken}`;
        console.log('🔐 Authorization header format:', authHeader.substring(0, 30) + '...');

        // Log before making the API call
        console.log('═══════════════════════════════════════════════════════');
        console.log('🚀 ABOUT TO CALL ZOHO API');
        console.log('📍 URL:', zohoApiUrl);
        console.log('📋 Method: POST');
        console.log('📦 Payload:', JSON.stringify(payload, null, 2));
        console.log('🔑 Has Access Token:', !!accessToken);
        console.log('═══════════════════════════════════════════════════════');

        // Make the API call to Zoho CRM Leads endpoint
        console.log('⏳ Making fetch request to Zoho API...');
        const fetchStartTime = Date.now();

        let response;
        try {
            response = await fetch(zohoApiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const fetchEndTime = Date.now();
            console.log(`⏱️ Fetch completed in ${fetchEndTime - fetchStartTime}ms`);
            console.log('✅ Fetch request successful - response received');
        } catch (fetchError) {
            console.error('❌❌❌ FETCH ERROR - Request failed to reach Zoho API ❌❌❌');
            console.error('Error type:', fetchError.name);
            console.error('Error message:', fetchError.message);
            console.error('Error stack:', fetchError.stack);
            throw new Error(`Failed to reach Zoho API: ${fetchError.message}`);
        }

        console.log('═══════════════════════════════════════════════════════');
        console.log('📡 ZOHO API RESPONSE RECEIVED');
        console.log('📍 Status:', response.status, response.statusText);
        console.log('📍 URL:', response.url);
        console.log('📍 Status Text:', response.statusText);
        console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
        console.log('═══════════════════════════════════════════════════════');

        // Get response text first to handle both JSON and non-JSON responses
        const responseText = await response.text();
        console.log('📥 Zoho API Raw Response:', responseText);

        let responseData;
        try {
            responseData = JSON.parse(responseText);
            console.log('📥 Zoho API Parsed Response Data:', JSON.stringify(responseData, null, 2));
        } catch (parseError) {
            console.error('❌ Failed to parse Zoho response as JSON:', parseError);
            console.error('Raw response:', responseText);
            return NextResponse.json(
                { error: 'Invalid response from Zoho API', details: responseText.substring(0, 200) },
                { status: 500 }
            );
        }

        // Check for errors in response data (Zoho sometimes returns 200 with error in body)
        const errorData = responseData.data?.[0];
        const errorCode = errorData?.code;
        const errorStatus = errorData?.status;
        const errorMessage = errorData?.message || responseData.message;
        const errorDetails = errorData?.details;

        // Check if it's a success response
        const isSuccess = errorCode === 'SUCCESS' || errorStatus === 'success' || (errorMessage && /record added|success/i.test(errorMessage));

        // Check if there's an error (either HTTP error or error in response body)
        // Only treat as error if it's NOT a success response
        const hasError = !response.ok || (!isSuccess && (errorCode === 'DUPLICATE_DATA' || errorStatus === 'error' || errorCode));

        // Handle success response
        if (isSuccess) {
            console.log('✅ Successfully created lead in Zoho CRM');
            const leadId = errorData?.details?.id;
            return NextResponse.json(
                {
                    success: true,
                    data: responseData,
                    zohoResponse: responseData,
                    leadId: leadId,
                    message: 'record added'
                },
                { status: 200 }
            );
        }

        // Handle error response
        if (hasError) {
            console.error('❌ Zoho API Error:', responseData);

            // Detect duplicate email or mobile
            let duplicateField = null;
            let userFriendlyMessage = errorMessage || 'Failed to create lead in Zoho CRM';

            if (errorCode === 'DUPLICATE_DATA' || (errorMessage && /duplicate/i.test(errorMessage))) {
                console.log('🔍 Detected duplicate data error');
                console.log('📋 Error details:', errorDetails);

                // Check which field is duplicate from api_name
                if (errorDetails?.api_name) {
                    const apiName = errorDetails.api_name.toLowerCase();
                    console.log('🔍 Checking api_name:', apiName);

                    if (apiName === 'email' || apiName.includes('email')) {
                        duplicateField = 'Email';
                        userFriendlyMessage = 'This email address already exists in our system. Please use a different email address.';
                        console.log('✅ Identified duplicate: Email');
                    } else if (apiName === 'mobile' || apiName === 'phone' || apiName.includes('mobile') || apiName.includes('phone')) {
                        duplicateField = 'Mobile';
                        userFriendlyMessage = 'This mobile number already exists in our system. Please use a different mobile number.';
                        console.log('✅ Identified duplicate: Mobile');
                    }
                }

                // Also check the error message for hints if api_name didn't help
                if (!duplicateField) {
                    if (/email/i.test(errorMessage)) {
                        duplicateField = 'Email';
                        userFriendlyMessage = 'This email address already exists in our system. Please use a different email address.';
                    } else if (/mobile|phone/i.test(errorMessage)) {
                        duplicateField = 'Mobile';
                        userFriendlyMessage = 'This mobile number already exists in our system. Please use a different mobile number.';
                    }
                }

                // Generic duplicate message if we can't identify the field
                if (!duplicateField && /duplicate/i.test(errorMessage)) {
                    userFriendlyMessage = 'This information already exists in our system. Please check your email or mobile number.';
                }
            }

            return NextResponse.json(
                {
                    error: userFriendlyMessage,
                    duplicateField: duplicateField,
                    zohoResponse: responseData,
                    zohoErrorCode: errorCode
                },
                { status: errorCode === 'DUPLICATE_DATA' ? 409 : (response.status || 400) } // Use 409 for duplicates
            );
        }

        // Fallback: if we can't determine success or error, treat as success if we have an ID
        const leadId = errorData?.details?.id;
        if (leadId) {
            console.log('✅ Lead created (fallback detection)');
            return NextResponse.json(
                {
                    success: true,
                    data: responseData,
                    zohoResponse: responseData,
                    leadId: leadId
                },
                { status: 200 }
            );
        }

        // Unknown response
        console.warn('⚠️ Unknown response format from Zoho');
        return NextResponse.json(
            { error: 'Unknown response from Zoho API', zohoResponse: responseData },
            { status: 500 }
        );

    } catch (error) {
        console.error('❌ Error in Zoho API route:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
