"use client";
import React, { useState } from "react";

const initial = {
  First_Name: "",
  Last_Name: "",
  Email: "",
  Phone_Number: "",
  College: "",
  Role: "",
  Years_of_Experience: "",
  Resume: null,
};

// Static list of roles
const roleOptions = ["Legal", "Administration", "Finance"];

export default function InternshipForm({ id }) {
  const [formData, setFormData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For Phone_Number field: only allow numbers
    if (name === "Phone_Number") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((p) => ({ ...p, [name]: numericValue }));
    } else if (name === "Years_of_Experience") {
      // For experience: only allow numbers
      const numericValue = value.replace(/\D/g, "");
      setFormData((p) => ({ ...p, [name]: numericValue }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }

    // Clear validation errors and duplicate error when user starts typing
    if (
      submitStatus?.validationErrors ||
      submitStatus?.duplicateField === name
    ) {
      setSubmitStatus(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        setSubmitStatus({
          type: "error",
          message: "File size must be less than 5MB",
          allErrors: ["File size must be less than 5MB"],
        });
        return;
      }

      // Check file type (PDF and DOCX only - DOC not allowed)
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      // Also check file extension as fallback
      const fileName = file.name.toLowerCase();
      const hasValidExtension =
        fileName.endsWith(".pdf") || fileName.endsWith(".docx");

      if (!allowedTypes.includes(file.type) && !hasValidExtension) {
        setSubmitStatus({
          type: "error",
          message: "Only PDF and DOCX files are allowed",
          allErrors: ["Only PDF and DOCX files are allowed"],
        });
        return;
      }

      setFormData((p) => ({ ...p, Resume: file }));
      setFileName(file.name);
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
    if (!d.Phone_Number.trim()) {
      errors.push("Phone number is required");
      fieldErrors.Phone_Number = "Phone number is required";
    } else {
      const phoneDigits = d.Phone_Number.replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        errors.push("Phone number must be at least 10 digits");
        fieldErrors.Phone_Number = "Phone number must be at least 10 digits";
      }
      if (phoneDigits.length > 15) {
        errors.push("Phone number cannot exceed 15 digits");
        fieldErrors.Phone_Number = "Phone number cannot exceed 15 digits";
      }
    }
    if (!d.Role || d.Role === "") {
      errors.push("Please select a role");
      fieldErrors.Role = "Please select a role";
    }
    if (!d.College || d.College.trim() === "") {
      errors.push("College name is required");
      fieldErrors.College = "College name is required";
    } else if (d.College.trim().length < 2) {
      errors.push("College name must be at least 2 characters");
      fieldErrors.College = "College name must be at least 2 characters";
    }
    if (!d.Resume) {
      errors.push("Please upload your resume");
      fieldErrors.Resume = "Please upload your resume";
    }

    return errors.length > 0 ? { errors, fieldErrors } : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const trimmed = {
      ...formData,
      First_Name: formData.First_Name.trim(),
      Last_Name: formData.Last_Name.trim(),
      Email: formData.Email.trim(),
      Phone_Number: formData.Phone_Number.trim(),
      College: formData.College.trim(),
      Role: formData.Role,
      Years_of_Experience: formData.Years_of_Experience.trim(),
    };

    const validationResult = validate(trimmed);
    if (validationResult) {
      setSubmitStatus({
        type: "error",
        message: "Please fix the following errors:",
        allErrors: validationResult.errors,
        validationErrors: validationResult.errors,
        fieldErrors: validationResult.fieldErrors,
      });
      return;
    }

    setLoading(true);
    setSubmitStatus(null);

    try {
      // Convert file to base64 for sending
      let resumeBase64 = "";
      if (formData.Resume) {
        resumeBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result.split(",")[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(formData.Resume);
        });
      }

      const payload = {
        data: [
          {
            First_Name: trimmed.First_Name,
            Last_Name: trimmed.Last_Name,
            Email: trimmed.Email,
            Mobile: trimmed.Phone_Number,
            College: trimmed.College,
            Role: trimmed.Role,
            Years_of_Experience: trimmed.Years_of_Experience,
            Resume: resumeBase64
              ? `data:${formData.Resume.type};base64,${resumeBase64}`
              : "",
            ResumeFileName: formData.Resume ? formData.Resume.name : "",
          },
        ],
      };

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout for file upload

      const res = await fetch("/api/zoho/internships", {
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
          } else if (duplicateField === "Mobile") {
            allErrors.push(
              "This mobile number is already registered. Please use a different mobile number.",
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
          message: "Application submitted successfully!",
        });
        setFormData(initial);
        setFileName("");
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
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="First_Name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              First name <span className="text-red-500">*</span>
            </label>
            <input
              id="First_Name"
              name="First_Name"
              type="text"
              value={formData.First_Name}
              onChange={handleChange}
              required
              className={`w-full rounded border px-3 py-2 text-sm ${submitStatus?.fieldErrors?.First_Name
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
                }`}
            />
            {submitStatus?.fieldErrors?.First_Name && (
              <p className="mt-1 text-xs text-red-600">
                {submitStatus.fieldErrors.First_Name}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="Last_Name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Last name <span className="text-red-500">*</span>
            </label>
            <input
              id="Last_Name"
              name="Last_Name"
              type="text"
              value={formData.Last_Name}
              onChange={handleChange}
              required
              className={`w-full rounded border px-3 py-2 text-sm ${submitStatus?.fieldErrors?.Last_Name
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
                }`}
            />
            {submitStatus?.fieldErrors?.Last_Name && (
              <p className="mt-1 text-xs text-red-600">
                {submitStatus.fieldErrors.Last_Name}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="Phone_Number"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Phone number <span className="text-red-500">*</span>
            </label>
            <input
              id="Phone_Number"
              name="Phone_Number"
              type="tel"
              value={formData.Phone_Number}
              onChange={handleChange}
              required
              minLength={10}
              maxLength={15}
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="Enter phone number"
              className={`w-full rounded border px-3 py-2 text-sm ${submitStatus?.duplicateField === "Mobile" ||
                submitStatus?.fieldErrors?.Phone_Number
                ? "border-red-500 bg-red-50 ring-2 ring-red-200"
                : "border-gray-300"
                }`}
            />
            {submitStatus?.fieldErrors?.Phone_Number && (
              <p className="mt-1 text-xs text-red-600">
                {submitStatus.fieldErrors.Phone_Number}
              </p>
            )}
            {submitStatus?.duplicateField === "Mobile" &&
              !submitStatus?.fieldErrors?.Phone_Number && (
                <p className="mt-1 text-xs text-red-600">
                  This phone number already exists
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
              className={`w-full rounded border px-3 py-2 text-sm ${submitStatus?.duplicateField === "Email" ||
                submitStatus?.fieldErrors?.Email
                ? "border-red-500 bg-red-50 ring-2 ring-red-200"
                : "border-gray-300"
                }`}
            />
            {submitStatus?.fieldErrors?.Email && (
              <p className="mt-1 text-xs text-red-600">
                {submitStatus.fieldErrors.Email}
              </p>
            )}
            {submitStatus?.duplicateField === "Email" &&
              !submitStatus?.fieldErrors?.Email && (
                <p className="mt-1 text-xs text-red-600">
                  This email already exists
                </p>
              )}
          </div>
        </div>

        <div>
          <label
            htmlFor="College"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            College <span className="text-red-500">*</span>
          </label>
          <input
            id="College"
            name="College"
            type="text"
            value={formData.College}
            onChange={handleChange}
            required
            className={`w-full rounded border px-3 py-2 text-sm ${submitStatus?.fieldErrors?.College
              ? "border-red-500 bg-red-50"
              : "border-gray-300"
              }`}
          />
          {submitStatus?.fieldErrors?.College && (
            <p className="mt-1 text-xs text-red-600">
              {submitStatus.fieldErrors.College}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="Role"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Pick a Role <span className="text-red-500">*</span>
          </label>
          <select
            id="Role"
            name="Role"
            value={formData.Role}
            onChange={handleChange}
            required
            className={`w-full rounded border px-3 py-2 text-sm ${submitStatus?.fieldErrors?.Role
              ? "border-red-500 bg-red-50"
              : "border-gray-300"
              }`}
          >
            <option value="">Please Select</option>
            {roleOptions.map((role, index) => (
              <option key={index} value={role}>
                {role}
              </option>
            ))}
          </select>
          {submitStatus?.fieldErrors?.Role && (
            <p className="mt-1 text-xs text-red-600">
              {submitStatus.fieldErrors.Role}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="Years_of_Experience"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Number of years of post qualification experience
          </label>
          <input
            id="Years_of_Experience"
            name="Years_of_Experience"
            type="text"
            value={formData.Years_of_Experience}
            onChange={handleChange}
            placeholder="Enter years of experience"
            inputMode="numeric"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="Resume"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Choose a file <span className="text-red-500">*</span>
          </label>
          <div
            className={`relative rounded-lg border-2 border-dashed p-3 text-center transition-colors ${submitStatus?.fieldErrors?.Resume
              ? "border-red-500 bg-red-50"
              : fileName
                ? "border-green-400 bg-green-50"
                : "border-gray-300 bg-gray-50 hover:border-custom-blue hover:bg-blue-50"
              }`}
          >
            <input
              id="Resume"
              name="Resume"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              required
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <div className="pointer-events-none">
              {fileName ? (
                <div className="flex flex-col items-center gap-1">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="max-w-full truncate text-xs font-semibold text-gray-700">
                    {fileName}
                  </p>
                  <p className="text-xs text-gray-500">Click to change file</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-xs font-medium text-gray-700">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOCX (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>
          {submitStatus?.fieldErrors?.Resume && (
            <p className="mt-2 text-xs text-red-600">
              {submitStatus.fieldErrors.Resume}
            </p>
          )}
        </div>

        {submitStatus && (
          <div
            role="status"
            aria-live="polite"
            className={`rounded border p-4 text-sm ${submitStatus.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
              }`}
          >
            {submitStatus.allErrors && submitStatus.allErrors.length > 0 ? (
              <div>
                <p className="mb-2 font-semibold">
                  {submitStatus.message || "Please fix the following errors:"}
                </p>
                <ul className="list-inside list-disc space-y-1">
                  {submitStatus.allErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : submitStatus.validationErrors &&
              submitStatus.validationErrors.length > 0 ? (
              <div>
                <p className="mb-2 font-semibold">
                  {submitStatus.message || "Please fix the following errors:"}
                </p>
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
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full rounded border border-custom-red px-6 py-2 text-base text-custom-red md:px-4 md:py-1.5 md:hover:bg-custom-red md:hover:text-white lg:px-6 lg:py-2"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
