import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import {
  MessageSquare,
  Plus,
  Settings,
  ChevronLeft,
  ChevronRight,
  Send,
  Bot,
  User,
  Trash2,
  Menu,
  X,
  Home,
  Sparkles,
  Calendar,
  BarChart3,
  FileText,
  Globe,
  Users,
  Zap,
  HelpCircle,
  CreditCard,
  ChevronDown,
  TrendingUp,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { icon: Home, label: "Dashboard", path: "/dashboard" },
      { icon: BarChart3, label: "Live Dashboard", path: "/live-dashboard" },
      { icon: MessageSquare, label: "Social Inbox", path: "/social-inbox" },
      { icon: Sparkles, label: "AI Studio", path: "/ai-studio" },
      { icon: Calendar, label: "Calendar", path: "/calendar" },
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
    ],
  },
  {
    title: "Content",
    items: [
      { icon: Sparkles, label: "AI Generator", path: "/ai/generator" },
      { icon: Sparkles, label: "Visual Creator", path: "/ai-visual-creator" },
      { icon: FileText, label: "Posts", path: "/posts" },
      { icon: FileText, label: "Templates", path: "/templates" },
      { icon: Calendar, label: "Scheduler", path: "/scheduler" },
      { icon: FileText, label: "Content Library", path: "/content-library" },
    ],
  },
  {
    title: "Connections",
    items: [
      { icon: Globe, label: "Social Accounts", path: "/connections/social-accounts" },
      { icon: BarChart3, label: "Growth Tools", path: "/growth-tools" },
      { icon: Globe, label: "Social Listening", path: "/social-listening" },
      { icon: BarChart3, label: "Competitors", path: "/competitor-intelligence" },
      { icon: Zap, label: "Automation", path: "/automation" },
      { icon: Globe, label: "Alerts", path: "/connections/alerts" },
    ],
  },
  {
    title: "Team",
    items: [
      { icon: Users, label: "Team Members", path: "/connections/team" },
      { icon: Users, label: "Approvals", path: "/approvals" },
      { icon: Users, label: "Accounts", path: "/accounts" },
    ],
  },
  {
    title: "Settings",
    items: [
      { icon: Settings, label: "Profile", path: "/settings/profile" },
      { icon: Settings, label: "Preferences", path: "/settings/preferences" },
      { icon: CreditCard, label: "Billing", path: "/settings/billing" },
      { icon: Settings, label: "Notifications", path: "/settings/notifications" },
      { icon: HelpCircle, label: "Help", path: "/help" },
    ],
  },
];

const suggestedPrompts = [
  {
    icon: Sparkles,
    label: "Write a LinkedIn post",
    prompt: "Write a professional LinkedIn post about the importance of personal branding in 2025. Make it engaging and include a call-to-action.",
  },
  {
    icon: TrendingUp,
    label: "Grow my Instagram",
    prompt: "Give me a 7-day Instagram content strategy to grow my audience. Include post ideas, caption tips, and best posting times.",
  },
  {
    icon: FileText,
    label: "Create 5 tweet ideas",
    prompt: "Generate 5 creative tweet ideas for a SaaS startup. Make them witty, shareable, and relevant to entrepreneurs and marketers.",
  },
  {
    icon: BarChart3,
    label: "Analyze my strategy",
    prompt: "What are the most effective social media strategies for a B2B software company trying to reach marketing directors in 2025?",
  },
  {
    icon: Calendar,
    label: "Plan a content month",
    prompt: "Create a 30-day social media content calendar for a fitness brand. Include themes, post types, and platform-specific tips.",
  },
  {
    icon: Globe,
    label: "Repurpose a blog post",
    prompt: "How do I repurpose a 2,000-word blog post into social media content for LinkedIn, Instagram, Twitter, and Facebook?",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-white/10 text-sfs-beige/40 hover:text-sfs-beige/80 transition-colors"
      title="Copy message"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function ChatUI() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["Main"]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]
    );
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat);
    setInputValue("");
    setMenuOpen(false);
    inputRef.current?.focus();
  };

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChat?.id === chatId) {
      setActiveChat(null);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const message = overrideInput ?? inputValue;
    if (!message.trim() || isLoading) return;

    let currentChat = activeChat;

    if (!currentChat) {
      currentChat = {
        id: crypto.randomUUID(),
        title: message.slice(0, 35) + (message.length > 35 ? "..." : ""),
        messages: [],
        createdAt: new Date(),
      };
      setChats((prev) => [currentChat!, ...prev]);
      setActiveChat(currentChat);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    const updatedChat = {
      ...currentChat,
      title:
        currentChat.messages.length === 0
          ? message.slice(0, 35) + (message.length > 35 ? "..." : "")
          : currentChat.title,
      messages: [...currentChat.messages, userMessage],
    };

    setActiveChat(updatedChat);
    setChats((prev) => prev.map((c) => (c.id === updatedChat.id ? updatedChat : c)));
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: message.trim(),
          tone: "professional",
          platforms: ["social media"],
        }),
      });

      if (!response.ok) throw new Error("Failed to generate response");

      const data = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
      };

      setActiveChat(finalChat);
      setChats((prev) => prev.map((c) => (c.id === finalChat.id ? finalChat : c)));
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I'm sorry, I ran into an issue. Please ensure your OpenAI API key is configured, then try again.",
        timestamp: new Date(),
      };

      const errorChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, errorMessage],
      };
      setActiveChat(errorChat);
      setChats((prev) => prev.map((c) => (c.id === errorChat.id ? errorChat : c)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-[#0D0D0D]" data-testid="chat-page">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } bg-[#111111] flex flex-col transition-all duration-300 overflow-hidden relative border-r border-sfs-gold/10`}
        data-testid="chat-sidebar"
      >
        <div className="flex flex-col h-full min-w-72">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sfs-gold/10">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sfs-gold to-sfs-gold-hover flex items-center justify-center">
                <Bot className="w-5 h-5 text-sfs-black" />
              </div>
              <span className="font-bold text-white text-lg group-hover:text-sfs-gold transition-colors">
                SmartFlow
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-sfs-beige/50 hover:text-sfs-gold hover:bg-sfs-gold/10"
              data-testid="button-hamburger"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {menuOpen ? (
            <ScrollArea className="flex-1">
              <div className="p-3">
                {navSections.map((section) => (
                  <div key={section.title} className="mb-2">
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-sfs-beige/40 uppercase tracking-wider hover:text-sfs-gold transition-colors"
                      data-testid={`button-section-${section.title.toLowerCase()}`}
                    >
                      <span>{section.title}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedSections.includes(section.title) ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedSections.includes(section.title) && (
                      <div className="space-y-0.5">
                        {section.items.map((item) => (
                          <Link key={item.path} href={item.path}>
                            <div
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sfs-beige/60 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                              data-testid={`nav-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              <item.icon className="w-4 h-4" />
                              <span className="text-sm">{item.label}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <>
              <div className="p-3">
                <Button
                  onClick={createNewChat}
                  className="w-full justify-start gap-2 bg-sfs-gold/10 border border-sfs-gold/20 text-sfs-beige hover:bg-sfs-gold/20 hover:border-sfs-gold/40 hover:text-white"
                  data-testid="button-new-chat"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </Button>
              </div>

              <ScrollArea className="flex-1 px-3">
                <div className="space-y-0.5">
                  {chats.length === 0 ? (
                    <p className="text-sfs-beige/30 text-xs text-center py-8">
                      No conversations yet
                    </p>
                  ) : (
                    chats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                          activeChat?.id === chat.id
                            ? "bg-sfs-gold/15 text-white"
                            : "text-sfs-beige/60 hover:bg-white/5 hover:text-sfs-beige"
                        }`}
                        onClick={() => setActiveChat(chat)}
                        data-testid={`chat-item-${chat.id}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1 truncate text-sm">{chat.title}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                          data-testid={`button-delete-chat-${chat.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="p-3 border-t border-sfs-gold/10 space-y-1">
                <button
                  onClick={() => setMenuOpen(true)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sfs-beige/50 hover:bg-white/5 hover:text-sfs-beige cursor-pointer transition-colors"
                  data-testid="link-menu"
                >
                  <Menu className="w-4 h-4" />
                  <span className="text-sm">Navigation</span>
                </button>
                <Link href="/">
                  <div className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sfs-beige/50 hover:bg-white/5 hover:text-sfs-beige cursor-pointer transition-colors">
                    <Home className="w-4 h-4" />
                    <span className="text-sm">Back to Home</span>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute z-20 top-1/2 -translate-y-1/2 bg-[#1a1a1a] hover:bg-[#222] border border-sfs-gold/20 p-1.5 rounded-r-lg text-sfs-beige/40 hover:text-sfs-gold transition-all"
        style={{ left: sidebarOpen ? "288px" : "0" }}
        data-testid="button-toggle-sidebar"
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-[#0D0D0D] relative overflow-hidden" data-testid="chat-main">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sfs-gold/4 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sfs-gold/4 rounded-full blur-[120px]" />
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 relative z-10">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {!activeChat || activeChat.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sfs-gold to-sfs-gold-hover flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(255,215,0,0.3)]">
                    <Bot className="w-9 h-9 text-sfs-black" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">SmartFlow Assistant</h2>
                  <p className="text-sfs-beige/50 text-sm max-w-sm">
                    Your AI-powered social media strategist. Ask me anything about content, growth, or strategy.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl" data-testid="suggested-prompts">
                  {suggestedPrompts.map((sp, i) => {
                    const Icon = sp.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSend(sp.prompt)}
                        className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/4 hover:bg-sfs-gold/10 hover:border-sfs-gold/30 transition-all text-left group"
                        data-testid={`button-prompt-${i}`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-sfs-gold/10 flex items-center justify-center shrink-0 group-hover:bg-sfs-gold/20 transition-colors">
                          <Icon className="w-5 h-5 text-sfs-gold" />
                        </div>
                        <span className="text-sm text-sfs-beige/70 group-hover:text-white transition-colors font-medium">
                          {sp.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {activeChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    data-testid={`message-${message.id}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sfs-gold to-sfs-gold-hover flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-sfs-black" />
                      </div>
                    )}
                    <div className="group max-w-[80%]">
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.role === "user"
                            ? "bg-sfs-gold/15 border border-sfs-gold/20 text-sfs-beige"
                            : "bg-[#1a1a1a] border border-white/8 text-sfs-beige/90"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "assistant" && (
                        <div className="flex justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <CopyButton text={message.content} />
                        </div>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-sfs-gold/20 border border-sfs-gold/20 flex items-center justify-center shrink-0 mt-1">
                        <User className="w-4 h-4 text-sfs-gold" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sfs-gold to-sfs-gold-hover flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-sfs-black" />
                    </div>
                    <div className="bg-[#1a1a1a] border border-white/8 px-4 py-3 rounded-2xl">
                      <div className="flex gap-1.5 items-center h-5">
                        <span className="w-2 h-2 bg-sfs-gold rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-sfs-gold rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-sfs-gold rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-white/5 bg-[#0D0D0D]/90 backdrop-blur-sm relative z-10">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-end gap-3 bg-[#1a1a1a] rounded-2xl border border-white/10 focus-within:border-sfs-gold/40 focus-within:ring-1 focus-within:ring-sfs-gold/20 transition-all">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask SmartFlow anything about social media..."
                className="flex-1 resize-none bg-transparent px-4 py-3.5 text-sfs-beige placeholder:text-sfs-beige/30 focus:outline-none text-sm min-h-[44px] max-h-40"
                rows={1}
                data-testid="input-message"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="m-2 bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                data-testid="button-send"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-sfs-beige/25 text-center mt-2">
              SmartFlow uses GPT-4. Verify important information before publishing.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
