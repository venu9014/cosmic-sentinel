import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, ArrowLeft, Loader2, ImageIcon, Download, Mic, MicOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StarField } from '@/components/StarField';
import { LiveClock } from '@/components/LiveClock';
import { toast } from 'sonner';

type MessageImage = {
  type: string;
  image_url: { url: string };
  title?: string;
  description?: string;
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  images?: MessageImage[];
  loadingImages?: boolean;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/astronomy-chat`;

const suggestedQuestions = [
  "What are near-Earth asteroids?",
  "Tell me about black holes",
  "What is the Torino scale?",
  "How do meteor showers happen?",
  "Explain the life cycle of a star",
];

async function fetchRelatedImages(userText: string): Promise<MessageImage[]> {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: userText }],
        mode: "related-images",
      }),
    });

    if (!resp.ok) return [];

    const data = await resp.json();
    if (data.type === "image" && data.images?.length > 0) {
      return data.images.map((img: any) => ({
        type: img.type || "image_url",
        image_url: { url: img.image_url?.url || "" },
        title: img.title || "",
        description: img.description || "",
      })).filter((img: MessageImage) => img.image_url.url);
    }
    return [];
  } catch {
    return [];
  }
}

export default function AstronomyChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice search is not supported in this browser');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setInput(transcript);
      if (event.results[0].isFinal) {
        setIsListening(false);
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice recognition failed. Please try again.');
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);
    setInput('');

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        if (resp.status === 429) toast.error("Rate limit exceeded. Please wait a moment.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Please add credits.");
        else toast.error(errorData.error || "Failed to get response");
        setIsLoading(false);
        return;
      }

      const contentType = resp.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await resp.json();
        toast.error(data.error || "Unexpected response");
        setIsLoading(false);
        return;
      }

      // Stream text response
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      let streamDone = false;

      setMessages(prev => [...prev, { role: 'assistant', content: '', loadingImages: true }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent, loadingImages: true };
                return updated;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setIsLoading(false);

      // Now auto-fetch related images
      const images = await fetchRelatedImages(userMessage);
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
          updated[lastIdx] = { ...updated[lastIdx], images: images.length > 0 ? images : undefined, loadingImages: false };
        }
        return updated;
      });

    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to connect to AstroBot");
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    streamChat(input.trim());
  };

  const handleSuggestion = (question: string) => {
    if (isLoading) return;
    streamChat(question);
  };

  const downloadImage = (dataUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `astrobot-image-${Date.now()}-${index}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <StarField />

      <header className="sticky top-0 z-20 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" state={{ showDashboard: true }}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-primary/20 border border-primary/30">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-orbitron text-lg font-bold leading-tight">AstroBot</h1>
              <p className="text-xs text-muted-foreground">AI Astronomy Assistant</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <LiveClock />
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              <ImageIcon className="w-3 h-3 text-accent" />
              <span className="text-xs text-muted-foreground hidden sm:inline">AI + Images</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-4 flex flex-col max-w-4xl">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10">
                <div className="inline-flex p-3 rounded-full bg-primary/10 border border-primary/20 mb-4">
                  <Bot className="w-10 h-10 text-primary" />
                </div>
                <h2 className="font-orbitron text-xl font-bold mb-2">Welcome to AstroBot</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                  Ask me anything about space — I'll explain it and show you related images!
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleSuggestion(question)}
                      className="px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary/50 hover:bg-primary/10 transition-all text-xs"
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border'
                    }`}>
                      {message.role === 'assistant' ? (
                        <div>
                          <div className="prose prose-sm prose-invert max-w-none">
                            <ReactMarkdown>{message.content || '...'}</ReactMarkdown>
                          </div>

                          {/* Loading images indicator */}
                          {message.loadingImages && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Finding related NASA images...</span>
                            </div>
                          )}

                          {/* Related images */}
                          {message.images && message.images.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> 📸 Real NASA Images
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {message.images.map((img, imgIdx) => (
                                  <div key={imgIdx} className="relative group rounded-xl overflow-hidden border border-border bg-black/20">
                                    <img
                                      src={img.image_url.url}
                                      alt={img.title || `NASA image ${imgIdx + 1}`}
                                      className="w-full aspect-square object-cover rounded-t-xl"
                                      loading="lazy"
                                    />
                                    {img.title && (
                                      <div className="p-2">
                                        <p className="text-xs font-medium text-foreground line-clamp-2">{img.title}</p>
                                        {img.description && (
                                          <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{img.description}</p>
                                        )}
                                      </div>
                                    )}
                                    <a
                                      href={img.image_url.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 border border-border opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                      title="Open full image"
                                    >
                                      <Download className="w-4 h-4 text-foreground" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1.5">Images courtesy of NASA Image and Video Library</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-secondary" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="flex gap-2 pt-3 border-t border-border"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about space..."
            disabled={isLoading}
            className="flex-1 bg-card/50 text-sm h-9"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} variant="cosmic" size="sm">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
