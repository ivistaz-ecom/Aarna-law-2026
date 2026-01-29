import React from "react";

const Model = () => {
  return (
    <div className="p-4">
      {/* <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Disclaimer
      </h2> */}
      <p className="text-gray-700 mb-6">
        The Bar Council of India does not permit solicitation or advertisement
        by advocates in any form or manner. By accessing this website,{" "}
        <a
          href="https://www.aarnalaw.com"
          className="text-custom-red underline "
        >
          https://www.aarnalaw.com
        </a>
        , you acknowledge and confirm the following:
      </p>

      <ul className="list-disc pl-6 space-y-3 text-gray-700">
        <li>
          You are accessing the Aarna Law website of your own accord to obtain
          information about the Firm, its members, and areas of practice.
        </li>
        <li>
          There has been no form of solicitation, advertisement, invitation, or
          inducement from Aarna Law or any of its members to create an
          attorney-client relationship.
        </li>
        <li>
          The content of this website is for informational purposes only and
          should not be construed as solicitation, advertisement, or legal
          advice.
        </li>
        <li>
          Any materials, information, or documents downloaded from this website
          are entirely at your discretion and do not create any lawyer-client
          relationship between you and Aarna Law.
        </li>
        <li>
          The Firm is not responsible or liable for any consequence of any
          action taken by you based on the information or material posted on
          this website. In case you require legal assistance, you must seek
          independent professional advice.
        </li>
        <li>
          The information provided on this website may not reflect the most
          current legal developments and should not be interpreted as a
          commitment or opinion of Aarna Law on any issue.
        </li>
        <li>
          Any links on this website leading to third-party websites are provided
          for convenience only and do not imply endorsement, referral, or
          association. Aarna Law is not responsible for the content or privacy
          practices of such third-party sites.
        </li>
        <li>
          You should not transmit any confidential, privileged, business, or
          sensitive information through this website. Information shared through
          this platform before the establishment of a formal engagement shall
          not be treated as confidential.
        </li>
        <li>
          All content on this website, including text, images, graphics, and
          design, constitutes the intellectual property of Aarna Law and may not
          be copied, reproduced, or distributed without prior written consent.
        </li>
        <li>
          This website uses cookies to enhance user experience. By continuing to
          use this site, you consent to our use of cookies as outlined in our
          Privacy Policy. Please read our <a className="text-custom-red underline" href="/privacy-policy">Privacy Policy</a> and <a className="text-custom-red underline" href="/terms-of-use">Terms of Use</a> to
          understand how we collect, use, and protect your data.
        </li>
        <li>
          This website and all its content are provided “as is,” without any
          warranties, express or implied. Aarna Law disclaims all liability for
          any loss or damage resulting from reliance on information contained on
          this website.
        </li>
        <li>
          Any disputes arising from the use of this website shall be governed by
          the laws of India and subject to the exclusive jurisdiction of
          competent courts in India.
        </li>
      </ul>

      <p className="text-gray-700 mt-6">
        By clicking{" "}
        <span className="font-semibold">“I Agree”</span> or by continuing to use
        this website, you acknowledge that you have read, understood, and
        accepted the terms of this Disclaimer.
      </p>
    </div>
  );
};

export default Model;
