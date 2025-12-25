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
  ChevronDown
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
    ]
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
    ]
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
    ]
  },
  {
    title: "Team",
    items: [
      { icon: Users, label: "Team Members", path: "/connections/team" },
      { icon: Users, label: "Approvals", path: "/approvals" },
      { icon: Users, label: "Accounts", path: "/accounts" },
    ]
  },
  {
    title: "Settings",
    items: [
      { icon: Settings, label: "Profile", path: "/settings/profile" },
      { icon: Settings, label: "Preferences", path: "/settings/preferences" },
      { icon: CreditCard, label: "Billing", path: "/settings/billing" },
      { icon: Settings, label: "Notifications", path: "/settings/notifications" },
      { icon: HelpCircle, label: "Help", path: "/help" },
    ]
  }
];

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
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(s => s !== title)
        : [...prev, title]
    );
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat);
    setInputValue("");
    setMenuOpen(false);
    inputRef.current?.focus();
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (activeChat?.id === chatId) {
      setActiveChat(null);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    let currentChat = activeChat;
    
    if (!currentChat) {
      currentChat = {
        id: crypto.randomUUID(),
        title: inputValue.slice(0, 30) + (inputValue.length > 30 ? "..." : ""),
        messages: [],
        createdAt: new Date(),
      };
      setChats(prev => [currentChat!, ...prev]);
      setActiveChat(currentChat);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    const updatedChat = {
      ...currentChat,
      title: currentChat.messages.length === 0 
        ? inputValue.slice(0, 30) + (inputValue.length > 30 ? "..." : "")
        : currentChat.title,
      messages: [...currentChat.messages, userMessage],
    };

    setActiveChat(updatedChat);
    setChats(prev => prev.map(c => c.id === updatedChat.id ? updatedChat : c));
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: inputValue.trim(),
          tone: "professional", // Default tone
          platforms: ["social media"],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate response");
      }

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
      setChats(prev => prev.map(c => c.id === finalChat.id ? finalChat : c));
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please ensure your OpenAI API key is configured correctly.",
        timestamp: new Date(),
      };
      
      const errorChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, errorMessage],
      };
      setActiveChat(errorChat);
      setChats(prev => prev.map(c => c.id === errorChat.id ? errorChat : c));
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
    <div className="flex h-screen bg-sfs-beige" data-testid="chat-page">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } bg-sfs-black flex flex-col transition-all duration-300 overflow-hidden relative`}
        data-testid="chat-sidebar"
      >
        <div className="flex flex-col h-full min-w-72">
          {/* Header with Hamburger */}
          <div className="flex items-center justify-between p-4 border-b border-sfs-gold/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sfs-gold flex items-center justify-center">
                <Bot className="w-5 h-5 text-sfs-black" />
              </div>
              <span className="font-semibold text-sfs-beige text-lg">SmartFlow</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-sfs-beige/70 hover:text-sfs-gold hover:bg-sfs-gold/10"
              data-testid="button-hamburger"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Menu Panel (slides over chat history) */}
          {menuOpen ? (
            <ScrollArea className="flex-1">
              <div className="p-3">
                {navSections.map((section) => (
                  <div key={section.title} className="mb-2">
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-sfs-beige/50 uppercase tracking-wider hover:text-sfs-gold transition-colors"
                      data-testid={`button-section-${section.title.toLowerCase()}`}
                    >
                      <span>{section.title}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.includes(section.title) ? "rotate-180" : ""}`} />
                    </button>
                    {expandedSections.includes(section.title) && (
                      <div className="space-y-1">
                        {section.items.map((item) => (
                          <Link key={item.path} href={item.path}>
                            <div
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sfs-beige/70 hover:text-sfs-gold hover:bg-sfs-gold/10 cursor-pointer transition-colors"
                              data-testid={`nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
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
              {/* New Chat Button */}
              <div className="p-3">
                <Button
                  onClick={createNewChat}
                  className="w-full justify-start gap-2 bg-transparent border border-sfs-gold/30 text-sfs-beige hover:bg-sfs-gold/10 hover:border-sfs-gold"
                  data-testid="button-new-chat"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </Button>
              </div>

              {/* Chat History */}
              <ScrollArea className="flex-1 px-3">
                <div className="space-y-1">
                  {chats.length === 0 ? (
                    <p className="text-sfs-beige/40 text-sm text-center py-8">
                      No chats yet
                    </p>
                  ) : (
                    chats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                          activeChat?.id === chat.id
                            ? "bg-sfs-gold/20 text-sfs-gold"
                            : "text-sfs-beige/70 hover:bg-sfs-brown/30 hover:text-sfs-beige"
                        }`}
                        onClick={() => setActiveChat(chat)}
                        data-testid={`chat-item-${chat.id}`}
                      >
                        <MessageSquare className="w-4 h-4 shrink-0" />
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

              {/* Bottom Links */}
              <div className="p-3 border-t border-sfs-gold/20">
                <button
                  onClick={() => setMenuOpen(true)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sfs-beige/70 hover:bg-sfs-brown/30 hover:text-sfs-beige cursor-pointer transition-colors"
                  data-testid="link-menu"
                >
                  <Menu className="w-4 h-4" />
                  <span className="text-sm">Menu</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-sfs-brown/80 hover:bg-sfs-brown p-1 rounded-r-md text-sfs-beige/70 hover:text-sfs-gold transition-all"
        style={{ left: sidebarOpen ? "288px" : "0" }}
        data-testid="button-toggle-sidebar"
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-[#0D0D0D] relative overflow-hidden" data-testid="chat-main">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sfs-gold/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sfs-gold/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Shooting Stars Effect */}
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-[2px] h-[2px] bg-white rounded-full animate-shooting-star"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 relative z-10">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {!activeChat || activeChat.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="glass-card px-6 py-3 flex items-center gap-3 border border-sfs-gold/30 hover-elevate group">
                  <div className="w-8 h-8 rounded-full bg-sfs-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Bot className="w-5 h-5 text-sfs-gold animate-pulse" />
                  </div>
                  <span className="text-lg font-semibold bg-gradient-to-r from-sfs-gold via-white to-sfs-gold bg-clip-text text-transparent">
                    SmartFlow Assistant
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {activeChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    data-testid={`message-${message.id}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-sfs-gold flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-sfs-black" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        message.role === "user"
                          ? "bg-sfs-brown text-sfs-beige"
                          : "bg-white text-sfs-black shadow-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-sfs-brown flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-sfs-beige" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 rounded-lg bg-sfs-gold flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-sfs-black" />
                    </div>
                    <div className="bg-white px-4 py-3 rounded-2xl shadow-sm">
                      <div className="flex gap-1">
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
        <div className="border-t border-sfs-brown/10 bg-sfs-beige/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-end gap-3 bg-white rounded-2xl border border-sfs-brown/20 shadow-sm focus-within:ring-2 focus-within:ring-sfs-gold focus-within:border-sfs-gold transition-all">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message SmartFlow..."
                className="flex-1 resize-none bg-transparent px-4 py-3 text-sfs-black placeholder:text-sfs-brown/40 focus:outline-none text-sm min-h-[44px] max-h-32"
                rows={1}
                data-testid="input-message"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="m-1.5 bg-sfs-gold hover:bg-sfs-gold-hover text-sfs-black disabled:opacity-40 disabled:cursor-not-allowed"
                data-testid="button-send"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-sfs-brown/50 text-center mt-2">
              SmartFlow can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
