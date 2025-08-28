import { ChatAssistantForm } from "@/components/client/chat-assistant-form";

export default function AiAssistantPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-6">
      <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
      <ChatAssistantForm />
    </div>
  );
}
