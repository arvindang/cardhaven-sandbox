
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle, HelpCircle, RefreshCw, XCircle } from 'lucide-react';
import { FlashcardProvider, useFlashcards, Card } from '@/contexts/FlashcardContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { marked } from 'marked';

const CardReviewContent = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { getDeckById, getCardsForDeck, updateCardDifficulty } = useFlashcards();
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [cardsToReview, setCardsToReview] = useState<Card[]>([]);
  const [completedCards, setCompletedCards] = useState<string[]>([]);
  
  const deck = deckId ? getDeckById(deckId) : null;
  
  useEffect(() => {
    if (deckId) {
      const allCards = getCardsForDeck(deckId);
      // Shuffle the cards for review
      const shuffled = [...allCards].sort(() => Math.random() - 0.5);
      setCardsToReview(shuffled);
    }
  }, [deckId, getCardsForDeck]);
  
  if (!deck || !deckId) {
    return <div>Deck not found</div>;
  }
  
  const currentCard = cardsToReview[currentCardIndex];
  const isLastCard = currentCardIndex === cardsToReview.length - 1;
  
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };
  
  const handleRateCard = (difficulty: Card['difficulty']) => {
    if (!currentCard) return;
    
    updateCardDifficulty(currentCard.id, difficulty);
    setCompletedCards(prev => [...prev, currentCard.id]);
    
    if (isLastCard) {
      toast.success('Review completed! Well done!');
      navigate(`/deck/${deckId}`);
    } else {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };
  
  if (!currentCard) {
    return (
      <Layout
        title={`Review: ${deck.name}`}
        breadcrumbs={[
          { label: 'App', path: '/' },
          { label: 'Decks', path: '/' },
          { label: deck.name, path: `/deck/${deckId}` },
          { label: 'Review', path: `/deck/${deckId}/review` }
        ]}
      >
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-2xl font-bold mb-4">No cards to review!</h2>
          <p className="text-gray-500 mb-6">This deck doesn't have any cards to review.</p>
          <Button onClick={() => navigate(`/deck/${deckId}`)}>Return to Deck</Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout
      title={`Review: ${deck.name}`}
      breadcrumbs={[
        { label: 'App', path: '/' },
        { label: 'Decks', path: '/' },
        { label: deck.name, path: `/deck/${deckId}` },
        { label: 'Review', path: `/deck/${deckId}/review` }
      ]}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-500">
            Card {currentCardIndex + 1} of {cardsToReview.length}
          </div>
          <Button variant="outline" onClick={() => navigate(`/deck/${deckId}`)}>
            End Review
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden card-flip animate-fade-in">
          <div className={`transition-all duration-500 ${showAnswer ? 'card-flipped' : ''}`}>
            {/* Question Side */}
            <div className="card-front p-8">
              <h2 className="text-lg font-medium mb-4">Question</h2>
              <div 
                className="markdown-content min-h-[200px]"
                dangerouslySetInnerHTML={{ __html: marked.parse(currentCard.question) }}
              />
              
              {!showAnswer && (
                <div className="mt-6 flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleShowAnswer}
                    className="bg-blue-accent hover:bg-blue-600"
                  >
                    Show Answer
                  </Button>
                </div>
              )}
            </div>
            
            {/* Answer Side */}
            <div className="card-back p-8">
              <h2 className="text-lg font-medium mb-4">Answer</h2>
              <div 
                className="markdown-content min-h-[200px]"
                dangerouslySetInnerHTML={{ __html: marked.parse(currentCard.answer) }}
              />
              
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-20 border-2 border-green-500 text-green-500 hover:bg-green-50"
                  onClick={() => handleRateCard('easy')}
                >
                  <CheckCircle size={24} className="mb-1" />
                  <span>I Got This</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-20 border-2 border-blue-accent text-blue-accent hover:bg-blue-50"
                  onClick={() => handleRateCard('good')}
                >
                  <HelpCircle size={24} className="mb-1" />
                  <span>Little Help</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-20 border-2 border-amber-500 text-amber-500 hover:bg-amber-50"
                  onClick={() => handleRateCard('hard')}
                >
                  <RefreshCw size={24} className="mb-1" />
                  <span>Remind Me</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center h-20 border-2 border-red-accent text-red-accent hover:bg-red-50"
                  onClick={() => handleRateCard('never')}
                >
                  <XCircle size={24} className="mb-1" />
                  <span>Never Get It</span>
                </Button>
              </div>
              
              {!isLastCard && (
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCurrentCardIndex(prev => prev + 1);
                      setShowAnswer(false);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Skip
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Completed: {completedCards.length} of {cardsToReview.length}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={currentCardIndex === 0}
              onClick={() => {
                setCurrentCardIndex(prev => prev - 1);
                setShowAnswer(false);
              }}
            >
              Previous
            </Button>
            
            <Button
              variant="outline"
              disabled={isLastCard}
              onClick={() => {
                setCurrentCardIndex(prev => prev + 1);
                setShowAnswer(false);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const CardReview = () => (
  <FlashcardProvider>
    <CardReviewContent />
  </FlashcardProvider>
);

export default CardReview;
