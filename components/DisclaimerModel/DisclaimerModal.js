"use client";

import { useState, useEffect } from "react";
import Model from "./model";

const DisclaimerModal = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Show modal every time on page load
    setTimeout(() => setShowModal(true), 500);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const handleAgree = () => {
    // Just close the modal without storing consent
    setShowModal(false);
  };

  const handleDisagree = () => {
    window.location.href = "https://www.google.com";
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-out dark:bg-gray-700">
        {/* Modal Header */}
        <div className="flex items-center justify-center border-b px-6 pb-4 pt-6 dark:border-gray-600">
          <h3 className="text-2xl font-semibold text-custom-red dark:text-custom-red">
            Disclaimer
          </h3>
        </div>

        {/* Modal Body */}
        <div
          className="overflow-y-auto p-6 text-gray-700 dark:text-gray-300"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          <Model />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-4 border-t bg-gray-50 px-6 py-4 dark:border-gray-600 dark:bg-gray-800">
          <button
            onClick={handleDisagree}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-base font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-gray-700"
          >
            Disagree
          </button>
          <button
            onClick={handleAgree}
            className="rounded-lg border border-transparent bg-custom-red px-6 py-2.5 text-base font-medium text-white transition-colors duration-200 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
