"use client";
import React, { useState, useRef } from "react";
import { IoIosArrowDown } from "react-icons/io";

const Faq = ({ faqs = [], className = "" }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const contentRefs = useRef([]);

  const toggleFAQ = (index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const renderAnswer = (answer) => {
    const hasList = /<ul>|<li>|•/i.test(answer);
    const hasParagraphs = /<p>/i.test(answer);
  
    let cleanedAnswer = answer
      .replace(/<p>(\s*)<\/p>/gi, "")
      .replace(/<p>(.*?)<p>/gi, "<p>$1</p><p>")
      .replace(/<\/p>\s*<\/p>/gi, "</p>")
      .replace(/•/g, ""); // remove literal bullet characters
  
    if (hasList) {
     
  
      return (
        <div
          className="mt-3 text-gray-700 text-sm sm:text-base"
          dangerouslySetInnerHTML={{ __html: cleanedAnswer }}
        />
      );
    }
  
    if (hasParagraphs) {
      return (
        <div
          className="mt-3 text-gray-700 text-sm sm:text-base space-y-3"
          dangerouslySetInnerHTML={{ __html: cleanedAnswer }}
        />
      );
    }
  
    const paragraphs = cleanedAnswer.split(/\n\s*\n/);
    return (
      <div className="mt-3 text-gray-700 text-sm sm:text-base space-y-3">
        {paragraphs.map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </div>
    );
  };
  

  return (
    <div className={`max-w-4xl container mx-auto py-4 md:px-0 ${className}`.trim()}>
      {faqs.length > 0 && (
        <h2 className="text-2xl pb-5">Frequently Asked Questions</h2>
      )}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-2xl p-4 transition-all duration-300"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center text-left"
            >
              <h3 className="flex-1 text-md font-semibold mr-3 text-black">
                {faq.question}
              </h3>
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                <IoIosArrowDown
                  className={`transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  size={24}
                />
              </span>
            </button>

            <div
              ref={(el) => (contentRefs.current[index] = el)}
              style={{
                maxHeight:
                  openIndex === index
                    ? `${contentRefs.current[index]?.scrollHeight}px`
                    : "0px",
              }}
              className="overflow-hidden transition-all duration-500 ease-in-out"
            >
              {renderAnswer(faq.answer)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;
