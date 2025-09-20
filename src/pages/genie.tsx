import AICompanion from "@/components/AICompanion";

export default function Genie() {
  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 genie-gradient bg-clip-text text-transparent">
          Ur Genie ✨
        </h1>
        <p className="text-muted-foreground text-lg">
          Your magical AI companion is here to support and guide you on your wellness journey
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <AICompanion />
      </div>
    </div>
  );
}