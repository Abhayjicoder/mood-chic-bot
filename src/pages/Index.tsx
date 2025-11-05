import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

type Gender = "male" | "female" | "unisex";
type Mood = "confident" | "relaxed" | "romantic" | "edgy" | "professional" | "casual";
type Step = "mood" | "gender" | "results";

interface Outfit {
  title: string;
  description: string;
  tips: string;
  imageUrl?: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>("mood");
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);

  const genders: { value: Gender; label: string; icon: string }[] = [
    { value: "male", label: "Male", icon: "👔" },
    { value: "female", label: "Female", icon: "👗" },
    { value: "unisex", label: "Unisex", icon: "👕" },
  ];

  const moods: { value: Mood; label: string; color: string; description: string }[] = [
    { value: "confident", label: "Confident", color: "bg-gradient-to-br from-rose-500 to-pink-600", description: "Bold and powerful" },
    { value: "relaxed", label: "Relaxed", color: "bg-gradient-to-br from-blue-400 to-cyan-500", description: "Comfortable and easy" },
    { value: "romantic", label: "Romantic", color: "bg-gradient-to-br from-pink-400 to-rose-500", description: "Soft and charming" },
    { value: "edgy", label: "Edgy", color: "bg-gradient-to-br from-purple-600 to-indigo-700", description: "Daring and unique" },
    { value: "professional", label: "Professional", color: "bg-gradient-to-br from-slate-600 to-gray-700", description: "Sharp and polished" },
    { value: "casual", label: "Casual", color: "bg-gradient-to-br from-amber-400 to-orange-500", description: "Laid-back style" },
  ];

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setTimeout(() => setCurrentStep("gender"), 400);
  };

  const handleGenderSelect = async (gender: Gender) => {
    setSelectedGender(gender);
    setCurrentStep("results");
    await generateOutfits(gender, selectedMood!);
  };

  const generateOutfits = async (gender: Gender, mood: Mood) => {
    setLoading(true);
    setOutfits([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-outfit", {
        body: { gender, mood },
      });

      if (error) throw error;

      setOutfits(data.outfits);
      toast.success("Your outfit ideas are ready!");
    } catch (error) {
      console.error("Error generating outfits:", error);
      toast.error("Failed to generate outfits. Please try again.");
      setCurrentStep("gender");
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setCurrentStep("mood");
    setSelectedMood(null);
    setSelectedGender(null);
    setOutfits([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
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

        {/* Step 1: Mood Selection */}
        {currentStep === "mood" && (
          <div className="max-w-6xl mx-auto animate-slide-up">
            <h2 className="text-3xl font-semibold mb-3 text-center">How are you feeling today?</h2>
            <p className="text-muted-foreground text-center mb-8">Select the mood that best describes you</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {moods.map((mood, index) => (
                <Card
                  key={mood.value}
                  className="p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-elegant)] animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handleMoodSelect(mood.value)}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 ${mood.color} rounded-full mx-auto mb-3 shadow-lg transition-transform hover:scale-110`} />
                    <h3 className="font-semibold mb-1">{mood.label}</h3>
                    <p className="text-xs text-muted-foreground">{mood.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Gender Selection */}
        {currentStep === "gender" && (
          <div className="max-w-4xl mx-auto animate-slide-up">
            <div className="mb-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Feeling <span className="font-semibold text-primary capitalize">{selectedMood}</span>
              </p>
              <h2 className="text-3xl font-semibold mb-3">What's your style preference?</h2>
              <p className="text-muted-foreground">Choose the style category that fits you best</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {genders.map((gender, index) => (
                <Card
                  key={gender.value}
                  className="p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-elegant)] animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleGenderSelect(gender.value)}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">{gender.icon}</div>
                    <h3 className="font-semibold text-xl mb-2">{gender.label}</h3>
                    <ArrowRight className="w-5 h-5 mx-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="ghost" onClick={resetFlow}>
                ← Change Mood
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Loading & Results */}
        {currentStep === "results" && (
          <>
            {loading && (
              <div className="text-center py-20 animate-fade-in">
                <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-primary" />
                <h2 className="text-2xl font-semibold mb-2">Creating Your Perfect Looks...</h2>
                <p className="text-muted-foreground">
                  Crafting {selectedMood} outfits for {selectedGender} style
                </p>
              </div>
            )}

            {!loading && outfits.length > 0 && (
              <div className="max-w-6xl mx-auto animate-fade-in">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold mb-3">Your Personalized Looks</h2>
                  <p className="text-muted-foreground mb-6">
                    <span className="capitalize">{selectedMood}</span> styles curated just for you
                  </p>
                  <Button onClick={resetFlow} variant="outline" size="lg">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Try Different Mood
                  </Button>
                </div>
                
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
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
