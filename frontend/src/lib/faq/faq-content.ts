export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSection = {
  title: string;
  items: FaqItem[];
};

export const FAQ_SECTIONS: FaqSection[] = [
  {
    title: "Tickets & Purchasing",
    items: [
      {
        question: "Can I buy tickets without creating an account?",
        answer:
          "Yes, guest checkout is available for most events. However, creating an account lets you access your tickets anytime from your profile.",
      },
      {
        question: "Can I use one email to purchase multiple tickets?",
        answer:
          "Only if the event has a quantity option on the purchase form. Otherwise, each ticket requires a unique email.",
      },
      {
        question: "Can I use one phone number to buy multiple tickets?",
        answer:
          "Only if a quantity option is available. Otherwise, each ticket requires a separate phone number.",
      },
      {
        question: "What payment methods are accepted?",
        answer:
          "You can pay via bKash, Nagad, Upay, Visa, and Mastercard — depending on what the event organizer has enabled.",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Yes. All transactions are processed through encrypted payment gateways. Eventisa never stores your card details.",
      },
    ],
  },
  {
    title: "Ticket Delivery & Access",
    items: [
      {
        question: "Where will I receive my ticket after purchase?",
        answer:
          "Your ticket will be sent to the email linked to your Eventisa account, shown on the purchase confirmation screen.",
      },
      {
        question: "What if I didn't receive my ticket by email?",
        answer:
          "First check your spam or promotions folder. If it's still missing, log in to your Eventisa profile and download it directly from the My Tickets section.",
      },
      {
        question: "How do I download my ticket from my profile?",
        answer:
          "Go to your profile, open the My Tickets section, and tap Download next to your event.",
      },
      {
        question: "I lost access to my account email. Can I still get my ticket?",
        answer:
          "Yes. Log in to your Eventisa account and download the ticket directly from your profile page — no email needed.",
      },
      {
        question: "What format is the ticket in?",
        answer:
          "Tickets are digital (PDF or QR code). Show the QR code at the venue entrance for a quick scan-and-go check-in.",
      },
    ],
  },
  {
    title: "Events & Organizers",
    items: [
      {
        question: "How do I find events near me?",
        answer:
          "Browse the Events page and filter by location, date, or category to find events in your area.",
      },
      {
        question: "How do I list my event on Eventisa?",
        answer:
          "Sign up as an organizer, submit your event details for review, and once approved it goes live on the platform.",
      },
      {
        question: "Can I cancel or reschedule my event as an organizer?",
        answer: "Yes, from your organizer dashboard. Attendees will be notified automatically by email.",
      },
      {
        question: "How does Eventisa verify events before listing them?",
        answer:
          "Every event goes through a review process by the Eventisa team before it becomes publicly visible.",
      },
    ],
  },
  {
    title: "Refunds & Cancellations",
    items: [
      {
        question: "Can I get a refund if I can't attend?",
        answer:
          "Refund eligibility depends on the organizer's refund policy, shown on the event page before purchase.",
      },
      {
        question: "What happens if an event is cancelled?",
        answer:
          "If an organizer cancels an event, registered attendees are notified and refunds are processed according to the platform's refund policy.",
      },
      {
        question: "How long do refunds take?",
        answer: "Refunds typically process within 5–7 business days, depending on your payment method.",
      },
    ],
  },
  {
    title: "Account & Support",
    items: [
      {
        question: "How do I contact Eventisa support?",
        answer:
          "Visit the Contact Us page or email us directly. Our team responds within 24 hours on business days.",
      },
      {
        question: "Can I transfer my ticket to someone else?",
        answer:
          "Ticket transfer availability depends on the event. Check the event page or contact support for help.",
      },
      {
        question: "Is Eventisa available outside Bangladesh?",
        answer:
          "Currently Eventisa operates within Bangladesh. Expansion to other regions is planned for the future.",
      },
    ],
  },
];
