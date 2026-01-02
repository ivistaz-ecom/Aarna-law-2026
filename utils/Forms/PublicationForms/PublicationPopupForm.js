import { useState, useEffect } from "react";
import configData from "../../../config.json";

const PublicationPopupForm = ({ onSubmit, item, onClose }) => {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading");
  const [error, setError] = useState("");

  useEffect(() => {
    // Disable body scroll when the popup is open
    document.body.style.overflow = "hidden";

    // Re-enable scroll when the popup is closed
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem("publication_user_email");
    const lastSubmission = localStorage.getItem("publication_form_submission");

    if (
      storedEmail &&
      lastSubmission &&
      Date.now() - parseInt(lastSubmission, 10) < 90 * 24 * 60 * 60 * 1000
    ) {
      setLoading(true); // Show loading state
      let dotsCount = 0;
      const interval = setInterval(() => {
        setLoadingText((prev) => {
          // Cycle through loading text (Loading, Loading., Loading.., Loading...)
          dotsCount = (dotsCount + 1) % 4;
          return "Loading" + ".".repeat(dotsCount);
        });
      }, 500); // Update every 500ms

      setTimeout(() => {
        clearInterval(interval); // Stop the loading animation after the redirect
        if (item?.acf?.publication_url) {
          window.location.href = item.acf.publication_url;
        } else if (item?.slug) {
          window.location.href = `/publications/${item.slug}`;
        }
      }, 1000); // Redirect after 2 seconds
    } else {
      setShouldShow(true);
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!formData.name || !formData.email) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    const formPayload = new FormData();
    formPayload.append("your-name", formData.name);
    formPayload.append("your-email", formData.email);

    try {
      // Check Zoho CRM first for duplicate email
      // WHY: Validate email before proceeding with WordPress submission
      try {
        const zohoPayload = {
          data: [
            {
              Name: formData.name.trim(),
              Email: formData.email.trim(),
            },
          ],
        };

        const zohoResponse = await fetch("/api/zoho/publications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(zohoPayload),
        });

        const zohoData = await zohoResponse.json();

        // Check if Zoho returned a duplicate email error
        if (!zohoResponse.ok || zohoData.error) {
          const duplicateField = zohoData.duplicateField;
          const zohoErrorCode = zohoData.zohoErrorCode;

          if (
            duplicateField === "Email" ||
            zohoErrorCode === "DUPLICATE_DATA"
          ) {
            setError(
              zohoData.error ||
                "This email address is already registered. Please use a different email address.",
            );
            setLoading(false);
            return; // Stop here, don't proceed with WordPress
          }
        }
      } catch (zohoError) {
        // If Zoho check fails, log but continue (non-blocking)
        console.error("Failed to check Zoho CRM:", zohoError);
      }

      // Send to WordPress/Parley (existing functionality)
      const wordpressResponse = await fetch(
        `${configData.PUBLICATION_USER_FORM}`,
        {
          method: "POST",
          body: formPayload,
        },
      );

      if (wordpressResponse.ok) {
        localStorage.setItem("publication_user_email", formData.email);
        localStorage.setItem(
          "publication_form_submission",
          Date.now().toString(),
        );

        // Redirect to publication link after form submission
        if (item?.acf?.publication_url) {
          window.location.href = item.acf.publication_url;
        } else if (item?.slug) {
          window.location.href = `/publications/${item.slug}`;
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("An error occurred. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex w-1/4 flex-col items-center justify-center rounded-lg p-6">
        <div className="spinner-border size-8 animate-spin rounded-full border-t-2 border-solid border-white text-white"></div>
        <h2 className="mt-4 text-xl font-semibold text-white">{loadingText}</h2>
      </div>
    );
  }

  if (!shouldShow) return null;

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-6 md:w-1/4 lg:m-0">
      <h2 className="mb-4 text-xl font-semibold">Enter Your Details</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            className={`w-full rounded border px-3 py-2 ${
              error && error.includes("email")
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              setError(""); // Clear error when user types
            }}
            required
          />
          {error && error.includes("email") && (
            <p className="mt-1 text-xs text-red-600">{error}</p>
          )}
        </div>
        {error && !error.includes("email") && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <div className="flex justify-between">
          <button
            type="submit"
            className="rounded bg-red-500 px-4 py-2 text-white"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            className="rounded bg-gray-500 px-4 py-2 text-white"
            onClick={onClose} // Close the popup on click
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublicationPopupForm;
