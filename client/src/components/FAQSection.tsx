import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does the AI content generation work?",
    answer: "Our AI analyzes your brand voice, target audience, and industry trends to generate tailored social media content. Simply provide a topic or keywords, select your preferred tone, and our AI will create engaging posts optimized for each platform."
  },
  {
    question: "Which social media platforms do you support?",
    answer: "We support all major platforms including Facebook, Instagram, Twitter/X, LinkedIn, TikTok, YouTube, and Pinterest. You can schedule and manage content across all platforms from a single dashboard."
  },
  {
    question: "Can I schedule posts in advance?",
    answer: "Yes! Our content calendar allows you to schedule posts days, weeks, or even months in advance. You can drag and drop posts to reschedule them, set optimal posting times based on your audience, and maintain a consistent content flow."
  },
  {
    question: "Is there a free trial available?",
    answer: "We offer a free tier that includes 1 social account and 10 AI-generated posts per month. This lets you experience the platform before committing to a paid plan. No credit card required to get started."
  },
  {
    question: "How does team collaboration work?",
    answer: "Pro users can invite team members with different permission levels (Owner, Admin, Editor, Viewer). You can set up approval workflows for content, leave comments on drafts, and track who made changes with full audit logs."
  },
  {
    question: "Can I connect multiple social accounts?",
    answer: "Free users can connect 1 social account. Pro users get unlimited social accounts, allowing you to manage multiple brands, clients, or business pages from one centralized dashboard."
  },
  {
    question: "What analytics and reporting features are available?",
    answer: "Our analytics dashboard provides insights on engagement rates, follower growth, best performing content, optimal posting times, and audience demographics. Pro users also get automated weekly/monthly reports delivered to their inbox."
  },
  {
    question: "Is my data secure?",
    answer: "Security is our top priority. We use industry-standard encryption, OAuth 2.0 for platform connections, and never store your social media passwords. All data is stored securely and we never share your information with third parties."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 md:py-24 lg:py-32 bg-sfs-black relative overflow-hidden" data-testid="section-faq">
      <div className="absolute inset-0 circuit-bg opacity-20" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-faq-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-sfs-beige/70 max-w-2xl mx-auto" data-testid="text-faq-subheading">
            Got questions? We've got answers. Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="glass-card overflow-hidden"
              data-testid={`faq-item-${index}`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                data-testid={`faq-button-${index}`}
              >
                <span className="font-semibold text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-sfs-gold flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-5 pb-5 text-sfs-beige/80 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
