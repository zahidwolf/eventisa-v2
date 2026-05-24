export const PRIVACY_LAST_UPDATED = "January 1, 2026";

export type PrivacySubsection = {
  title: string;
  body: string;
};

export type PrivacySection = {
  title: string;
  paragraphs?: string[];
  listItems?: string[];
  rights?: PrivacySubsection[];
  closingParagraph?: string;
};

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    title: "Providing Consent",
    paragraphs: [
      "By using the Eventisa website and platform, you consent to our Privacy Policy and agree to its terms. If you do not agree with this policy, please discontinue use of the platform immediately.",
    ],
  },
  {
    title: "Information We Collect",
    paragraphs: [
      "We collect personal information such as your name, email address, phone number, and the contents of any messages or attachments you send us when you contact us directly. If you register for an account with Eventisa, we will receive and store information related to your account, including your registration details, event history, and ticket purchases, with adequate security measures in place.",
      "We may also collect non-personal information such as your browser type, device type, IP address, pages visited, and time spent on the platform, in order to improve our services and user experience.",
    ],
  },
  {
    title: "Ways in Which We Utilize Your Information",
    paragraphs: ["We use the information we collect to:"],
    listItems: [
      "Provide, operate, and maintain the Eventisa platform to deliver a seamless user experience for both attendees and event organizers.",
      "Continuously improve, personalize, and expand our platform's features and functionality based on user needs.",
      "Analyze user behavior and preferences to gain insights into how our audience interacts with Eventisa.",
      "Develop new products, services, and features that better serve our community of organizers and attendees.",
      "Communicate with our users, including providing customer support, responding to inquiries, and resolving issues to ensure a smooth experience on the platform.",
      "Send you event recommendations, platform updates, and website-related news and information relevant to your interests.",
      "Use your information for marketing and promotional purposes, with your consent, to keep you informed about upcoming events and offers on Eventisa.",
      "Send you emails and notifications unless you have opted out or unsubscribed from our communications.",
      "Process ticket purchases and facilitate secure payment transactions between attendees and event organizers.",
      "Take necessary measures to detect, investigate, and prevent fraudulent activities, unauthorized access, and security breaches on the platform.",
      "Comply with applicable laws and legal obligations under the jurisdiction of the People's Republic of Bangladesh.",
    ],
  },
  {
    title: "Children's Privacy",
    paragraphs: [
      "Our platform is not intended for use by children under 13 years of age, and we do not knowingly collect personal information from children.",
      "We are committed to protecting children while they use the internet. Parents and guardians are strongly encouraged to monitor and guide their children's online activities. Eventisa does not knowingly collect any personally identifiable information from children under the age of 13. If you believe your child has provided such information on our platform, please contact us immediately at support@eventisa.com, and we will make every effort to promptly remove such information from our records.",
    ],
  },
  {
    title: "Data Protection Rights",
    paragraphs: [
      "We want to make sure you are fully aware of all your data protection rights. Every user of Eventisa is entitled to the following:",
    ],
    rights: [
      {
        title: "Access Right",
        body: "You are entitled to request copies of the personal data we hold about you. A nominal fee may apply for this service.",
      },
      {
        title: "Rectification Right",
        body: "If you believe any of your personal information is inaccurate or incomplete, you have the right to request that we correct or complete it.",
      },
      {
        title: "Erasure Right",
        body: "You have the right to request the deletion of your personal data from our records, under specific conditions.",
      },
      {
        title: "Restriction Right",
        body: "You are entitled to request that we limit the processing of your personal data, subject to specific conditions.",
      },
      {
        title: "Data Portability Right",
        body: "You are entitled to request the transfer of your personal data that we have collected, either to another organization or directly to you, subject to specific conditions.",
      },
      {
        title: "Objection Right",
        body: "You have the right to object to our processing of your personal data at any time, subject to applicable legal grounds.",
      },
    ],
    closingParagraph:
      "If you wish to exercise any of these rights, please contact us. We have one month to respond to your request from the date it is received.",
  },
  {
    title: "Data Security",
    paragraphs: [
      "Eventisa takes the security of your personal data seriously. We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "Third-Party Services",
    paragraphs: [
      "Eventisa may use third-party services such as payment gateways (bKash, Nagad, Upay, Visa, Mastercard) and analytics providers to operate the platform. These third parties have their own privacy policies governing the use of your information. We encourage you to review their policies before providing any information through those services.",
    ],
  },
  {
    title: "Cookies",
    paragraphs: [
      "Eventisa uses cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, some features of the platform may not function properly without cookies.",
    ],
  },
  {
    title: "Changes to This Privacy Policy",
    paragraphs: [
      'Eventisa reserves the right to update or revise this Privacy Policy at any time. Any changes will be posted on this page with a revised "Last Updated" date. Continued use of the platform after any changes constitutes your acceptance of the updated policy. We encourage you to review this page periodically to stay informed.',
    ],
  },
];
