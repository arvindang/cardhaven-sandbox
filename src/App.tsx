
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";

// Pages
import Index from "./pages/Index";
import DeckDetail from "./pages/DeckDetail";
import CardCreation from "./pages/CardCreation";
import CardReview from "./pages/CardReview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize data in localStorage if it doesn't exist
    if (!localStorage.getItem("flashcardData")) {
      const initialData = {
        folders: [
          {
            id: "folder-1",
            name: "French Decks",
            decks: ["deck-1", "deck-2"]
          }
        ],
        decks: [
          {
            id: "deck-1",
            name: "French 101",
            totalCards: 10,
            easy: 7,
            good: 1,
            hard: 2,
            cardsLeft: 5,
            archived: false,
            parentFolder: "folder-1"
          },
          {
            id: "deck-2",
            name: "French 102",
            totalCards: 8,
            easy: 5,
            good: 2,
            hard: 1,
            cardsLeft: 4,
            archived: false,
            parentFolder: "folder-1"
          },
          {
            id: "deck-3",
            name: "Spanish Basics",
            totalCards: 15,
            easy: 8,
            good: 4,
            hard: 3,
            cardsLeft: 7,
            archived: false,
            parentFolder: null
          },
          {
            id: "deck-4",
            name: "Programming",
            totalCards: 20,
            easy: 12,
            good: 5,
            hard: 3,
            cardsLeft: 0,
            archived: false,
            parentFolder: null
          },
          {
            id: "deck-5",
            name: "History",
            totalCards: 12,
            easy: 5,
            good: 3,
            hard: 4,
            cardsLeft: 6,
            archived: true,
            parentFolder: null
          }
        ],
        cards: [
          {
            id: "card-1",
            deckIds: ["deck-1"],
            question: "How do you say 'hello' in French?",
            answer: "Bonjour",
            difficulty: "easy",
            nextReview: new Date().toISOString()
          },
          {
            id: "card-2",
            deckIds: ["deck-1"],
            question: "How do you say 'goodbye' in French?",
            answer: "Au revoir",
            difficulty: "easy",
            nextReview: new Date().toISOString()
          },
          {
            id: "card-3",
            deckIds: ["deck-1"],
            question: "How do you say 'thank you' in French?",
            answer: "Merci",
            difficulty: "good",
            nextReview: new Date().toISOString()
          },
          {
            id: "card-4",
            deckIds: ["deck-1", "deck-3"],
            question: "What's the French word for 'house'?",
            answer: "Maison",
            difficulty: "hard",
            nextReview: new Date().toISOString()
          },
          {
            id: "card-5",
            deckIds: ["deck-1"],
            question: "Count from 1 to 5 in French",
            answer: "Un, deux, trois, quatre, cinq",
            difficulty: "easy",
            nextReview: new Date().toISOString()
          }
        ]
      };
      localStorage.setItem("flashcardData", JSON.stringify(initialData));
      toast.success("Sample flashcard data initialized successfully!");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/deck/:deckId" element={<DeckDetail />} />
            <Route path="/deck/:deckId/add" element={<CardCreation />} />
            <Route path="/deck/:deckId/review" element={<CardReview />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
