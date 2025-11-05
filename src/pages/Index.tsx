import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

type Gender = "male" | "female" | "unisex";
type Mood = "confident" | "relaxed" | "romantic" | "edgy" | "professional" | "casual";

interface Outfit {
  title: string;
  description: string;
  tips: string;
  imageUrl?: string;
}

const Index = () => {
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);

  const genders: { value: Gender; label: string; icon: string }[] = [
    { value: "male", label: "Male", icon: "👔" },
    { value: "female", label: "Female", icon: "👗" },
    { value: "unisex", label: "Unisex", icon: "👕" },
  ];

  const moods: { value: Mood; label: string; color: string }[] = [
    { value: "confident", label: "Confident", color: "bg-gradient-to-br from-rose-500 to-pink-600" },
    { value: "relaxed", label: "Relaxed", color: "bg-gradient-to-br from-blue-400 to-cyan-500" },
    { value: "romantic", label: "Romantic", color: "bg-gradient-to-br from-pink-400 to-rose-500" },
    { value: "edgy", label: "Edgy", color: "bg-gradient-to-br from-purple-600 to-indigo-700" },
    { value: "professional", label: "Professional", color: "bg-gradient-to-br from-slate-600 to-gray-700" },
    { value: "casual", label: "Casual", color: "bg-gradient-to-br from-amber-400 to-orange-500" },
  ];

  const generateOutfits = async () => {
    if (!selectedGender || !selectedMood) {
      toast.error("Please select both gender and mood");
      return;
    }

    setLoading(true);
    setOutfits([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-outfit", {
        body: { gender: selectedGender, mood: selectedMood },
      });

      if (error) throw error;

      setOutfits(data.outfits);
      toast.success("Your outfit ideas are ready!");
    } catch (error) {
      console.error("Error generating outfits:", error);
      toast.error("Failed to generate outfits. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <Sparkles className="w-4 h-4 text-primary animate-glow" />
            <span className="text-sm font-medium text-primary">AI-Powered Fashion</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            AI Mood Stylist
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover your perfect outfit based on your mood and style preferences
          </p>
        </div>

        {/* Gender Selection */}
        <div className="max-w-4xl mx-auto mb-12 animate-slide-up">
          <h2 className="text-2xl font-semibold mb-6 text-center">Select Your Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {genders.map((gender) => (
              <Card
                key={gender.value}
                className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  selectedGender === gender.value
                    ? "ring-2 ring-primary shadow-[var(--shadow-elegant)] bg-gradient-to-br from-primary/5 to-primary/10"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedGender(gender.value)}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{gender.icon}</div>
                  <h3 className="font-semibold text-lg">{gender.label}</h3>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Mood Selection */}
        <div className="max-w-6xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-2xl font-semibold mb-6 text-center">Choose Your Mood</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {moods.map((mood) => (
              <Card
                key={mood.value}
                className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  selectedMood === mood.value
                    ? "ring-2 ring-primary shadow-[var(--shadow-elegant)]"
                    : ""
                }`}
                onClick={() => setSelectedMood(mood.value)}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 ${mood.color} rounded-full mx-auto mb-3 transition-transform ${
                    selectedMood === mood.value ? "scale-110" : ""
                  }`} />
                  <h3 className="font-medium">{mood.label}</h3>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-12 animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <Button
            onClick={generateOutfits}
            disabled={!selectedGender || !selectedMood || loading}
            size="lg"
            className="px-8 py-6 text-lg font-semibold shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Your Looks...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Outfit Ideas
              </>
            )}
          </Button>
        </div>

        {/* Outfit Results */}
        {outfits.length > 0 && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold mb-8 text-center">Your Personalized Looks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {outfits.map((outfit, index) => (
                <Card
                  key={index}
                  className="overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-[var(--shadow-elegant)] animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {outfit.imageUrl && (
                    <div className="aspect-[3/4] overflow-hidden bg-muted">
                      <img
                        src={outfit.imageUrl}
                        alt={outfit.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-primary">{outfit.title}</h3>
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      {outfit.description}
                    </p>
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs font-semibold text-accent mb-2">✨ STYLING TIPS</p>
                      <p className="text-sm text-muted-foreground">{outfit.tips}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
