"use client";
import React, { useState } from "react";

const initial = { First_Name: "", Last_Name: "", Email: "", Mobile: "", Message: "" };

export default function ZohoContactForm() {
    const [formData, setFormData] = useState(initial);
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // For Mobile field: only allow numbers
        if (name === "Mobile") {
            // Remove all non-numeric characters
            const numericValue = value.replace(/\D/g, "");
            setFormData(p => ({ ...p, [name]: numericValue }));
        } else {
            setFormData(p => ({ ...p, [name]: value }));
        }

        // Clear validation errors and duplicate error when user starts typing
        if (submitStatus?.validationErrors || submitStatus?.duplicateField === name) {
            setSubmitStatus(null);
        }
    };

    const validate = (d) => {
        const errors = [];
        const fieldErrors = {};

        if (!d.First_Name.trim()) {
            errors.push("First name is required");
            fieldErrors.First_Name = "First name is required";
        }
        if (!d.Last_Name.trim()) {
            errors.push("Last name is required");
            fieldErrors.Last_Name = "Last name is required";
        }
        if (!d.Email.trim()) {
            errors.push("Email is required");
            fieldErrors.Email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.Email.trim())) {
            errors.push("Invalid email format");
            fieldErrors.Email = "Invalid email format";
        }
        if (!d.Mobile.trim()) {
            errors.push("Mobile is required");
            fieldErrors.Mobile = "Mobile is required";
        } else {
            // Mobile: minimum 10 digits, only numbers
            const mobileDigits = d.Mobile.replace(/\D/g, "");
            if (mobileDigits.length < 10) {
                errors.push("Mobile number must be at least 10 digits");
                fieldErrors.Mobile = "Mobile number must be at least 10 digits";
            }
            if (mobileDigits.length > 15) {
                errors.push("Mobile number cannot exceed 15 digits");
                fieldErrors.Mobile = "Mobile number cannot exceed 15 digits";
            }
        }
        if (!d.Message.trim()) {
            errors.push("Message is required");
            fieldErrors.Message = "Message is required";
        }

        return errors.length > 0 ? { errors, fieldErrors } : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        const trimmed = Object.fromEntries(Object.entries(formData).map(([k, v]) => [k, (v || "").trim()]));
        const validationResult = validate(trimmed);
        if (validationResult) {
            // Show all validation errors together
            setSubmitStatus({
                type: "error",
                message: "Please fix the following errors:",
                allErrors: validationResult.errors,
                validationErrors: validationResult.errors,
                fieldErrors: validationResult.fieldErrors
            });
            return;
        }

        setLoading(true);
        setSubmitStatus(null);

        const payload = { data: [{ ...trimmed, Description: trimmed.Message }] };

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);

        try {
            const res = await fetch("/api/zoho/Contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timer);

            const text = await res.text();
            let json = {};
            try { json = text ? JSON.parse(text) : {}; } catch { throw new Error("Invalid server response"); }

            // Check Zoho response data
            const zohoData = json?.zohoResponse?.data?.[0] || json?.data?.[0];
            const zohoCode = zohoData?.code;
            const zohoStatus = zohoData?.status;
            const zohoMessage = zohoData?.message;
            const duplicateField = json?.duplicateField;

            // Check if it's a SUCCESS response from Zoho
            const isZohoSuccess = zohoCode === 'SUCCESS' || zohoStatus === 'success' || (zohoMessage && /record added|success/i.test(zohoMessage));

            // Check for errors - either HTTP error or error in response body
            const hasError = !res.ok || json?.error || (zohoCode === 'DUPLICATE_DATA' || zohoStatus === 'error') && !isZohoSuccess;

            if (hasError && !isZohoSuccess) {
                const allErrors = [];

                if (zohoCode === "AUTHENTICATION_FAILURE" || (json?.error && /auth/i.test(json.error))) {
                    allErrors.push("Authentication error — contact admin.");
                    setSubmitStatus({ type: "error", message: "Authentication error — contact admin.", allErrors: allErrors });
                } else if (duplicateField) {
                    // Add duplicate error to the list
                    if (duplicateField === "Email") {
                        allErrors.push("This email address is already registered. Please use a different email address.");
                    } else if (duplicateField === "Mobile") {
                        allErrors.push("This mobile number is already registered. Please use a different mobile number.");
                    }
                    setSubmitStatus({
                        type: "error",
                        message: "Please fix the following errors:",
                        allErrors: allErrors,
                        duplicateField: duplicateField
                    });
                } else {
                    allErrors.push(json?.error || json?.message || "Submission failed");
                    setSubmitStatus({ type: "error", message: "Please fix the following errors:", allErrors: allErrors });
                }
            } else if (isZohoSuccess || json?.success === true) {
                // Show success and reset form when record is actually created
                setSubmitStatus({ type: "success", message: "Form submitted successfully!" });
                setFormData(initial);
            } else {
                // If no clear success or error, show generic error
                setSubmitStatus({ type: "error", message: "Submission failed. Please try again." });
            }
        } catch (err) {
            if (err.name === "AbortError") setSubmitStatus({ type: "error", message: "Request timed out. Try again." });
            else setSubmitStatus({ type: "error", message: "An error occurred. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 md:px-0">
            <h2 className="mb-6 text-2xl font-semibold text-custom-blue">Contact Us</h2>
            <div className="rounded-lg bg-white p-8 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="First_Name" className="mb-2 block text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
                            <input
                                id="First_Name"
                                name="First_Name"
                                value={formData.First_Name}
                                onChange={handleChange}
                                required
                                className={`w-full rounded border px-3 py-2 ${submitStatus?.fieldErrors?.First_Name
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                    }`}
                            />
                            {submitStatus?.fieldErrors?.First_Name && (
                                <p className="mt-1 text-sm text-red-600">{submitStatus.fieldErrors.First_Name}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="Last_Name" className="mb-2 block text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label>
                            <input
                                id="Last_Name"
                                name="Last_Name"
                                value={formData.Last_Name}
                                onChange={handleChange}
                                required
                                className={`w-full rounded border px-3 py-2 ${submitStatus?.fieldErrors?.Last_Name
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                    }`}
                            />
                            {submitStatus?.fieldErrors?.Last_Name && (
                                <p className="mt-1 text-sm text-red-600">{submitStatus.fieldErrors.Last_Name}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="Email" className="mb-2 block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                            <input
                                id="Email"
                                name="Email"
                                type="email"
                                value={formData.Email}
                                onChange={handleChange}
                                required
                                className={`w-full rounded border px-3 py-2 ${submitStatus?.duplicateField === "Email" || submitStatus?.fieldErrors?.Email
                                    ? "border-red-500 bg-red-50 ring-2 ring-red-200"
                                    : "border-gray-300"
                                    }`}
                            />
                            {submitStatus?.fieldErrors?.Email && (
                                <p className="mt-1 text-sm text-red-600">{submitStatus.fieldErrors.Email}</p>
                            )}
                            {submitStatus?.duplicateField === "Email" && !submitStatus?.fieldErrors?.Email && (
                                <p className="mt-1 text-sm text-red-600">This email already exists</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="Mobile" className="mb-2 block text-sm font-medium text-gray-700">Mobile <span className="text-red-500">*</span></label>
                            <input
                                id="Mobile"
                                name="Mobile"
                                type="tel"
                                value={formData.Mobile}
                                onChange={handleChange}
                                required
                                minLength={10}
                                maxLength={15}
                                pattern="[0-9]*"
                                inputMode="numeric"
                                placeholder="Enter 10 digit mobile number"
                                className={`w-full rounded border px-3 py-2 ${submitStatus?.duplicateField === "Mobile" || submitStatus?.fieldErrors?.Mobile
                                    ? "border-red-500 bg-red-50 ring-2 ring-red-200"
                                    : "border-gray-300"
                                    }`}
                            />
                            {submitStatus?.fieldErrors?.Mobile && (
                                <p className="mt-1 text-sm text-red-600">{submitStatus.fieldErrors.Mobile}</p>
                            )}
                            {submitStatus?.duplicateField === "Mobile" && !submitStatus?.fieldErrors?.Mobile && (
                                <p className="mt-1 text-sm text-red-600">This mobile number already exists</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="Message" className="mb-2 block text-sm font-medium text-gray-700">Message <span className="text-red-500">*</span></label>
                        <textarea
                            id="Message"
                            name="Message"
                            rows={5}
                            value={formData.Message}
                            onChange={handleChange}
                            required
                            className={`w-full rounded border px-3 py-2 ${submitStatus?.fieldErrors?.Message
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300"
                                }`}
                        />
                        {submitStatus?.fieldErrors?.Message && (
                            <p className="mt-1 text-sm text-red-600">{submitStatus.fieldErrors.Message}</p>
                        )}
                    </div>

                    {submitStatus && (
                        <div role="status" aria-live="polite" className={`rounded border p-4 ${submitStatus.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
                            {submitStatus.allErrors && submitStatus.allErrors.length > 0 ? (
                                <div>
                                    <p className="mb-2 font-semibold">{submitStatus.message || "Please fix the following errors:"}</p>
                                    <ul className="list-inside list-disc space-y-1">
                                        {submitStatus.allErrors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : submitStatus.validationErrors && submitStatus.validationErrors.length > 0 ? (
                                <div>
                                    <p className="mb-2 font-semibold">{submitStatus.message || "Please fix the following errors:"}</p>
                                    <ul className="list-inside list-disc space-y-1">
                                        {submitStatus.validationErrors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p>{submitStatus.message}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <button type="submit" disabled={loading} aria-busy={loading} className="rounded bg-custom-blue px-6 py-2 font-semibold text-white disabled:opacity-60">
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
