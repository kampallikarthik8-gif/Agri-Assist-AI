
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { chatAssistant } from "@/ai/flows/chat-assistant";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Icons } from "../icons";
import { cn } from "@/lib/utils";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

const formSchema = z.object({
  message: z.string().min(1, "Message cannot be empty."),
});

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatAssistantForm() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [summarize, setSummarize] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const raw = localStorage.getItem('ai_assistant_summarize_v1');
    return raw ? raw === 'true' : true;
  });
  const [cite, setCite] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const raw = localStorage.getItem('ai_assistant_cite_v1');
    return raw ? raw === 'true' : false;
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  useEffect(() => {
    try { localStorage.setItem('ai_assistant_summarize_v1', summarize ? 'true' : 'false'); } catch {}
  }, [summarize]);

  useEffect(() => {
    try { localStorage.setItem('ai_assistant_cite_v1', cite ? 'true' : 'false'); } catch {}
  }, [cite]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: values.message }]);
    form.reset();

    try {
      const res = await chatAssistant({ message: values.message, summarize, cite } as any);
      setMessages(prev => [...prev, { role: "assistant", content: res.response }]);
    } catch (error: any) {
      console.error(error);
      const userMessage = "Sorry, I encountered an error. Please try again.";
      if (error.message && (error.message.includes('403 Forbidden') || error.message.includes('API_KEY_SERVICE_BLOCKED'))) {
        toast({
          variant: "destructive",
          title: "API Access Error",
          description: "The Generative Language API is disabled or blocked by restrictions. Please check your Google Cloud project's API key settings.",
        });
        setMessages(prev => [...prev, { role: "assistant", content: "I can't seem to connect to my AI brain right now. Please check your Google Cloud project's API key settings." }]);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get a response. Please try again.",
        });
        setMessages(prev => [...prev, { role: "assistant", content: userMessage }]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4 pr-6" ref={scrollAreaRef}>
        <div className="space-y-6">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-20">
                    <Icons.Assistant className="size-16 mb-4"/>
                    <h2 className="text-2xl font-semibold">Agri Assist Ai</h2>
                    <p className="max-w-md">Your AI-powered farming expert. Ask me anything about crop management, soil health, pest control, and more!</p>
                </div>
            )}
            {messages.map((message, index) => (
                <div key={index} className={cn("flex items-start gap-4", message.role === "user" ? "justify-end" : "justify-start")}>
                {message.role === 'assistant' && (
                    <Avatar className="size-9 bg-primary text-primary-foreground flex-shrink-0">
                        <div className="flex items-center justify-center h-full w-full">
                            <Icons.Assistant className="size-5" />
                        </div>
                    </Avatar>
                )}
                <div className={cn(
                    "max-w-lg p-3 rounded-lg",
                    message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                )}>
                    <p className="text-sm">{message.content}</p>
                </div>
                 {message.role === 'user' && (
                    <Avatar className="size-9 bg-muted text-muted-foreground flex-shrink-0">
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                )}
                </div>
            ))}
             {loading && (
                <div className="flex items-start gap-4 justify-start">
                    <Avatar className="size-9 bg-primary text-primary-foreground flex-shrink-0">
                        <div className="flex items-center justify-center h-full w-full">
                            <Icons.Assistant className="size-5" />
                        </div>
                    </Avatar>
                    <div className="max-w-lg p-3 rounded-lg bg-muted text-foreground rounded-bl-none">
                        <div className="flex items-center gap-2">
                             <Loader2 className="h-4 w-4 animate-spin" />
                             <p className="text-sm text-muted-foreground">Thinking...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between pb-2 gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Switch id="summarize" checked={summarize} onCheckedChange={setSummarize} />
            <Label htmlFor="summarize" className="text-sm text-muted-foreground">Summarize answers</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="cite" checked={cite} onCheckedChange={setCite} />
            <Label htmlFor="cite" className="text-sm text-muted-foreground">Cite sources</Label>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <span>Quick prompts:</span>
            <button className="underline" onClick={() => form.setValue('message', 'Best fertilizer mix for maize at V6 stage')}>Fertilizer mix</button>
            <button className="underline" onClick={() => form.setValue('message', 'Is it a good time to spray today near Hyderabad?')}>Spraying time</button>
            <button className="underline" onClick={() => form.setValue('message', 'Identify pest from leaf with brown spots; prevention steps')}>Pest ID</button>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Ask about anything farming-related..." {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} size="icon" className="flex-shrink-0">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
