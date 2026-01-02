"use client";
import React, { useState } from "react";

const initial = {
  Name: "",
  Email: "",
  Interests: [], // Array to store selected interests
};

// Available interest options
const interestOptions = ["Corporate Advisory", "HR Compliance", "Others"];

export default function SubscribeForm({ id }) {
  const [formData, setFormData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));

    // Clear validation errors when user starts typing
    if (
      submitStatus?.validationErrors ||
      submitStatus?.duplicateField === name
    ) {
      setSubmitStatus(null);
    }
  };

  const handleInterestChange = (interest) => {
    setFormData((p) => {
      const currentInterests = p.Interests || [];
      const isSelected = currentInterests.includes(interest);

      if (isSelected) {
        // Remove interest if already selected
        return {
          ...p,
          Interests: currentInterests.filter((i) => i !== interest),
        };
      } else {
        // Add interest if not selected
        return {
          ...p,
          Interests: [...currentInterests, interest],
        };
      }
    });

    // Clear validation errors when user selects/deselects
    if (submitStatus?.validationErrors) {
      setSubmitStatus(null);
    }
  };

  const validate = (d) => {
    const errors = [];
    const fieldErrors = {};

    if (!d.Name.trim()) {
      errors.push("Name is required");
      fieldErrors.Name = "Name is required";
    }
    if (!d.Email.trim()) {
      errors.push("Email is required");
      fieldErrors.Email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(d.Email)) {
        errors.push("Please enter a valid email address");
        fieldErrors.Email = "Please enter a valid email address";
      }
    }
    if (!d.Interests || d.Interests.length === 0) {
      errors.push("Please select at least one interest");
      fieldErrors.Interests = "Please select at least one interest";
    }

    return { errors, fieldErrors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);

    const validation = validate(formData);
    if (validation.errors.length > 0) {
      setSubmitStatus({
        type: "error",
        message: "Please fix the following errors:",
        allErrors: validation.errors,
        validationErrors: true,
        fieldErrors: validation.fieldErrors,
      });
      return;
    }

    setLoading(true);

    try {
      // Convert interests array to comma-separated string for Zoho
      const interestsString = formData.Interests.join(", ");

      const payload = {
        data: [
          {
            Name: formData.Name.trim(),
            Email: formData.Email.trim(),
            Interests: interestsString, // Send as string to Zoho
          },
        ],
      };

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      const res = await fetch("/api/zoho/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      const text = await res.text();
      let json = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Invalid server response");
      }

      // Check Zoho response data
      const zohoData = json?.zohoResponse?.data?.[0] || json?.data?.[0];
      const zohoCode = zohoData?.code;
      const zohoStatus = zohoData?.status;
      const zohoMessage = zohoData?.message;
      const duplicateField = json?.duplicateField;

      // Check if it's a SUCCESS response from Zoho
      const isZohoSuccess =
        zohoCode === "SUCCESS" ||
        zohoStatus === "success" ||
        (zohoMessage && /record added|success/i.test(zohoMessage));

      // Check for errors
      const hasError =
        !res.ok ||
        json?.error ||
        ((zohoCode === "DUPLICATE_DATA" || zohoStatus === "error") &&
          !isZohoSuccess);

      if (hasError && !isZohoSuccess) {
        const allErrors = [];

        if (
          zohoCode === "AUTHENTICATION_FAILURE" ||
          (json?.error && /auth/i.test(json.error))
        ) {
          allErrors.push("Authentication error — contact admin.");
          setSubmitStatus({
            type: "error",
            message: "Authentication error — contact admin.",
            allErrors: allErrors,
          });
        } else if (duplicateField) {
          if (duplicateField === "Email") {
            allErrors.push(
              "This email address is already registered. Please use a different email address.",
            );
          }
          setSubmitStatus({
            type: "error",
            message: "Please fix the following errors:",
            allErrors: allErrors,
            duplicateField: duplicateField,
          });
        } else {
          allErrors.push(json?.error || json?.message || "Submission failed");
          setSubmitStatus({
            type: "error",
            message: "Please fix the following errors:",
            allErrors: allErrors,
          });
        }
      } else if (isZohoSuccess || json?.success === true) {
        // Show success and reset form
        setSubmitStatus({
          type: "success",
          message: "Successfully subscribed to newsletter!",
        });
        setFormData(initial);
      } else {
        setSubmitStatus({
          type: "error",
          message: "Submission failed. Please try again.",
        });
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setSubmitStatus({
          type: "error",
          message: "Request timed out. Please try again.",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: "An error occurred. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id={id} className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="Name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="Name"
            name="Name"
            type="text"
            value={formData.Name}
            onChange={handleChange}
            required
            className={`w-full rounded border px-3 py-2 text-sm ${
              submitStatus?.fieldErrors?.Name
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
          />
          {submitStatus?.fieldErrors?.Name && (
            <p className="mt-1 text-xs text-red-600">
              {submitStatus.fieldErrors.Name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="Email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="Email"
            name="Email"
            type="email"
            value={formData.Email}
            onChange={handleChange}
            required
            className={`w-full rounded border px-3 py-2 text-sm ${
              submitStatus?.fieldErrors?.Email ||
              submitStatus?.duplicateField === "Email"
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
          />
          {(submitStatus?.fieldErrors?.Email ||
            (submitStatus?.duplicateField === "Email" &&
              submitStatus?.allErrors?.[0])) && (
            <p className="mt-1 text-xs text-red-600">
              {submitStatus.fieldErrors?.Email || submitStatus.allErrors?.[0]}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Pick Your Interests <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {interestOptions.map((interest) => {
              const isChecked = formData.Interests?.includes(interest) || false;
              return (
                <label
                  key={interest}
                  className="flex cursor-pointer items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleInterestChange(interest)}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-custom-red focus:ring-2 focus:ring-custom-red"
                  />
                  <span className="text-sm text-gray-700">{interest}</span>
                </label>
              );
            })}
          </div>
          {submitStatus?.fieldErrors?.Interests && (
            <p className="mt-1 text-xs text-red-600">
              {submitStatus.fieldErrors.Interests}
            </p>
          )}
        </div>

        {submitStatus && (
          <div
            className={`rounded p-3 text-sm ${
              submitStatus.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {submitStatus.message && (
              <p className="font-medium">{submitStatus.message}</p>
            )}
            {submitStatus.allErrors && submitStatus.allErrors.length > 0 && (
              <ul className="mt-2 list-inside list-disc">
                {submitStatus.allErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-custom-red px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
