import { ChatAssistantForm } from "@/components/client/chat-assistant-form";
import { useEffect, useState } from "react";
import { observePrompts, type QuickPrompt } from "@/lib/prompts";
import { Button } from "@/components/ui/button";

export default function AiAssistantPage() {
  const [prompts, setPrompts] = useState<QuickPrompt[]>([]);
  useEffect(() => observePrompts(setPrompts), []);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-6">
      <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
      {prompts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {prompts.sort((a,b) => (b.pinned?1:0) - (a.pinned?1:0)).slice(0,8).map(p => (
            <Button key={p.id} variant="outline" size="sm" onClick={() => {
              const input = document.querySelector<HTMLInputElement>('input[name="message"]');
              if (input) input.value = p.text;
            }}>{p.title}</Button>
          ))}
        </div>
      )}
      <ChatAssistantForm />
    </div>
  );
}
