import { useState, useEffect } from "react";
import { HiX } from "react-icons/hi";
import configData from "../../../config.json";

const PublicationPopupForm = ({
  onSubmit,
  item,
  onClose,
  embedded = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // SHOW FORM DIRECTLY
  useEffect(() => {
    setShouldShow(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.name || !formData.email) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    const formPayload = new FormData();

    formPayload.append("your-name", formData.name);
    formPayload.append("your-email", formData.email);

    try {
      // ZOHO CHECK
      try {
        const zohoPayload = {
          data: [
            {
              Name: formData.name.trim(),
              Email: formData.email.trim(),
            },
          ],
        };

        const zohoResponse = await fetch(
          "/api/zoho/publications",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(zohoPayload),
          }
        );

        const zohoData = await zohoResponse.json();

        if (!zohoResponse.ok || zohoData.error) {
          const duplicateField =
            zohoData.duplicateField;

          const zohoErrorCode =
            zohoData.zohoErrorCode;

          if (
            duplicateField === "Email" ||
            zohoErrorCode === "DUPLICATE_DATA"
          ) {
            setError(
              zohoData.error ||
                "This email address is already registered. Please use a different email address."
            );

            setLoading(false);

            return;
          }
        }
      } catch (zohoError) {
        console.error(
          "Failed to check Zoho CRM:",
          zohoError
        );
      }

      // WORDPRESS SUBMIT
      const wordpressResponse = await fetch(
        `${configData.PUBLICATION_USER_FORM}`,
        {
          method: "POST",
          body: formPayload,
        }
      );

      if (wordpressResponse.ok) {
        // SAVE EMAIL
        localStorage.setItem(
          "publication_user_email",
          formData.email
        );

        // SAVE SEPARATELY FOR EACH PUBLICATION
        if (item?.acf?.publication_url) {
          localStorage.setItem(
            `publication_form_submission_${item.acf.publication_url}`,
            Date.now().toString()
          );
        }

        // KEEP FORM VISIBLE
        // ONLY CHANGE BUTTON TEXT

        // SAME TAB IMMEDIATE REDIRECT
        if (item?.acf?.publication_url) {
          window.location.replace(
            item.acf.publication_url
          );
        } else if (item?.slug) {
          window.location.replace(
            `/publications/${item.slug}`
          );
        }

        return;
      }
    } catch (error) {
      setError(
        "An error occurred. Please try again."
      );

      console.error(
        "An error occurred. Please try again.",
        error
      );

      setLoading(false);
    }
  };

  if (!shouldShow) return null;

  return (
    <div
      className={
        embedded
          ? "w-full"
          : "w-full max-w-md rounded-lg bg-white p-6 md:w-1/4 lg:m-0"
      }
    >
      {!embedded && (
        <div className="-mx-6 -mt-6 mb-6 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            Enter Your Details
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close popup"
            disabled={loading}
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="mb-2 block text-sm font-medium"
            htmlFor="name"
          >
            Name
          </label>

          <input
            type="text"
            id="name"
            className="w-full rounded border border-gray-300 px-3 py-2"
            value={formData.name}
            disabled={loading}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
            required
          />
        </div>

        <div className="mb-4">
          <label
            className="mb-2 block text-sm font-medium"
            htmlFor="email"
          >
            Email
          </label>

          <input
            type="email"
            id="email"
            className={`w-full rounded border px-3 py-2 ${
              error &&
              error.includes("email")
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            value={formData.email}
            disabled={loading}
            onChange={(e) => {
              setFormData({
                ...formData,
                email: e.target.value,
              });

              setError("");
            }}
            required
          />

          {error &&
            error.includes("email") && (
              <p className="mt-1 text-xs text-red-600">
                {error}
              </p>
            )}
        </div>

        {error &&
          !error.includes("email") && (
            <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

        <div className="flex">
          <button
            type="submit"
            disabled={loading}
            className="border border-custom-red px-6 py-2 text-custom-red transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 md:px-4 md:py-1.5 md:text-sm md:hover:bg-custom-red md:hover:text-white lg:px-6 lg:py-2 lg:text-base"
          >
            {loading
              ? "Loading..."
              : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublicationPopupForm;