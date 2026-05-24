export const TERMS_LAST_UPDATED = "January 1, 2026";

export type TermsSubsection = {
  title: string;
  body: string;
};

export type TermsSection = {
  title: string;
  subsections?: TermsSubsection[];
  paragraphs?: string[];
  listItems?: string[];
};

export const TERMS_INTRO =
  "Thank you for using Eventisa, a ticketing and event management platform. By accessing or using Eventisa, you agree to comply with and be bound by the following Terms and Conditions. If you do not agree with these terms, please do not use Eventisa.";

export const TERMS_SECTIONS: TermsSection[] = [
  {
    title: "Account Registration and Use",
    subsections: [
      {
        title: "Account Creation",
        body: "To use certain features of Eventisa, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete at all times.",
      },
      {
        title: "Account Security",
        body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use or security breach at support@eventisa.com.",
      },
    ],
  },
  {
    title: "Event Registration and Ticket Purchases",
    subsections: [
      {
        title: "Event Registration",
        body: "Eventisa facilitates registration for various events and experiences across Bangladesh. By registering for an event, you agree to comply with the event organizer's terms and any specific conditions associated with that event.",
      },
      {
        title: "Ticket Purchases",
        body: "When purchasing tickets through Eventisa, you agree to provide accurate and complete payment information. All ticket sales are final. Refunds are subject to the event organizer's refund policy as displayed on the individual event page prior to purchase.",
      },
      {
        title: "Payment Methods",
        body: "Eventisa supports payments via bKash, Nagad, Upay, Visa, and Mastercard, depending on what the event organizer has enabled. All transactions are processed through secure, encrypted payment gateways.",
      },
    ],
  },
  {
    title: "User Content",
    subsections: [
      {
        title: "User Responsibilities",
        body: "You are solely responsible for any content you post or submit through Eventisa. You must not post content that violates applicable laws, is fraudulent, misleading, harmful, or infringes on the intellectual property or rights of any third party.",
      },
      {
        title: "License",
        body: "By submitting content on Eventisa, you grant Eventisa a non-exclusive, worldwide, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the submitted content solely in connection with operating and improving the platform.",
      },
    ],
  },
  {
    title: "Intellectual Property",
    subsections: [
      {
        title: "Ownership",
        body: "Eventisa retains full ownership of all intellectual property rights associated with the Eventisa platform, including its name, logo, design, codebase, and software. You may not use, reproduce, distribute, or create derivative works based on any part of Eventisa without express written authorization from Eventisa.",
      },
      {
        title: "Trademarks",
        body: "All trademarks, service marks, and trade names used on Eventisa are the property of Eventisa or their respective owners. Unauthorized use of any trademark displayed on the platform is strictly prohibited.",
      },
    ],
  },
  {
    title: "Organizer Responsibilities",
    subsections: [
      {
        title: "Event Accuracy",
        body: "Event organizers are solely responsible for the accuracy of their event listings, including dates, times, venues, pricing, and descriptions. Eventisa does not guarantee the accuracy of organizer-submitted information.",
      },
      {
        title: "Organizer Conduct",
        body: "Organizers must comply with all applicable laws and regulations when creating and managing events on Eventisa. Eventisa reserves the right to remove any event listing that violates these terms or is deemed inappropriate.",
      },
      {
        title: "Payouts",
        body: "Eventisa will process ticket revenue payouts to organizers in accordance with the agreed payout schedule, after deducting applicable platform fees.",
      },
    ],
  },
  {
    title: "Prohibited Activities",
    paragraphs: ["You agree not to engage in any of the following activities while using Eventisa:"],
    listItems: [
      "Using the platform for any unlawful, fraudulent, or unauthorized purpose",
      "Attempting to gain unauthorized access to any part of the platform or another user's account",
      "Reselling or transferring tickets in violation of event organizer policies",
      "Posting false, misleading, or deceptive event listings",
      "Interfering with the platform's functionality, servers, or networks",
      "Using automated tools, bots, or scripts to interact with the platform without prior written consent from Eventisa",
    ],
  },
  {
    title: "Limitation of Liability",
    subsections: [
      {
        title: "Disclaimer",
        body: 'Eventisa is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. Eventisa makes no guarantees regarding the availability, accuracy, or reliability of the platform.',
      },
      {
        title: "Liability Cap",
        body: "To the maximum extent permitted by applicable law, Eventisa shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the platform, even if Eventisa has been advised of the possibility of such damages.",
      },
      {
        title: "Third-Party Events",
        body: "Eventisa acts solely as a platform connecting event organizers and attendees. Eventisa is not responsible for the quality, safety, legality, or any other aspect of events listed on the platform.",
      },
    ],
  },
  {
    title: "Privacy",
    paragraphs: [
      "Your use of Eventisa is also governed by our Privacy Policy, which is incorporated into these Terms and Conditions by reference. By using Eventisa, you consent to the collection and use of your information as described in the Privacy Policy.",
    ],
  },
  {
    title: "Governing Law and Dispute Resolution",
    subsections: [
      {
        title: "Governing Law",
        body: "These Terms and Conditions are governed by and construed in accordance with the laws of the People's Republic of Bangladesh.",
      },
      {
        title: "Dispute Resolution",
        body: "Any disputes arising under or in connection with these Terms and Conditions shall first be attempted to be resolved through good-faith negotiation between the parties. If negotiation fails, disputes shall be resolved through arbitration in accordance with the laws of the People's Republic of Bangladesh. The arbitrator's decision shall be final and binding, and judgment may be entered in any court of competent jurisdiction.",
      },
    ],
  },
  {
    title: "Changes to Terms and Conditions",
    subsections: [
      {
        title: "Modification",
        body: 'Eventisa reserves the right to modify or revise these Terms and Conditions at any time without prior notice. The updated version will be posted on this page with a revised "Last Updated" date. Continued use of Eventisa after any such changes constitutes your acceptance of the new terms. We encourage you to review this page periodically.',
      },
    ],
  },
];
