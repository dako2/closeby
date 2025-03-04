import { MapView } from "@/components/map-view";
import { ChatInterface } from "@/components/chat-interface";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Landmark Explorer
          </h1>
        </div>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 h-[calc(100vh-73px)]">
        <div className="h-full">
          <MapView />
        </div>
        <div className="h-full border-l">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}