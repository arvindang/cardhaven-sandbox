
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MoreVertical, BookPlus, Settings, ChevronRight } from 'lucide-react';
import { FlashcardProvider, useFlashcards } from '@/contexts/FlashcardContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const DeckDetailContent = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { getDeckById, getCardsForDeck } = useFlashcards();
  
  if (!deckId) {
    return <div>Invalid deck ID</div>;
  }
  
  const deck = getDeckById(deckId);
  const cards = getCardsForDeck(deckId);
  
  if (!deck) {
    return <div>Deck not found</div>;
  }
  
  // Group cards by difficulty
  const easyCards = cards.filter(card => card.difficulty === 'easy');
  const goodCards = cards.filter(card => card.difficulty === 'good');
  const hardCards = cards.filter(card => card.difficulty === 'hard');
  const neverCards = cards.filter(card => card.difficulty === 'never');
  
  return (
    <Layout
      title={deck.name}
      breadcrumbs={[
        { label: 'App', path: '/' },
        { label: 'Decks', path: '/' },
        { label: deck.name, path: `/deck/${deckId}` }
      ]}
      actions={
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            className="flex items-center space-x-2 border border-gray-300 bg-white"
            onClick={() => {/* Deck settings functionality */}}
          >
            <Settings size={18} className="text-gray-500" />
            <span>Deck Settings</span>
          </Button>
          <Button 
            className="flex items-center space-x-2 bg-blue-accent hover:bg-blue-600"
            onClick={() => navigate(`/deck/${deckId}/add`)}
          >
            <BookPlus size={18} />
            <span>New Card</span>
          </Button>
        </div>
      }
    >
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow overflow-hidden animate-fade-in mb-8">
          {/* Summary row */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-6 mr-2">
                <input 
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-accent"
                />
              </div>
              <div className="flex-1 font-medium">Today's Cards</div>
              <div className="w-24 text-right text-gray-600">{deck.totalCards} Total</div>
              <div className="w-24 text-right text-green-500">{deck.easy} Easy</div>
              <div className="w-24 text-right text-blue-accent">{deck.good} Good</div>
              <div className="w-24 text-right text-amber-500">{deck.hard} Hard</div>
              <div className="w-48 text-right text-blue-accent font-medium">
                {deck.cardsLeft > 0 ? (
                  <Link 
                    to={`/deck/${deckId}/review`}
                    className="text-blue-accent font-medium"
                  >
                    {deck.cardsLeft} Cards Left Today
                  </Link>
                ) : (
                  <span className="text-gray-400">Completed</span>
                )}
              </div>
              <div className="w-10"></div>
            </div>
          </div>
        </div>
        
        {/* Cards by difficulty */}
        <div className="space-y-8">
          {/* Easy cards */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              🎉 I Got These
              <span className="ml-2 text-sm text-gray-500">({easyCards.length})</span>
            </h2>
            
            {easyCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {easyCards.map(card => (
                  <Card key={card.id} className="overflow-hidden hover:shadow-md transition-shadow animate-fade-in">
                    <CardContent className="p-4">
                      <div className="font-medium mb-2 line-clamp-2">{card.question}</div>
                      <div className="text-sm text-gray-500 line-clamp-3">{card.answer}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">No cards in this category</div>
            )}
          </div>
          
          {/* Good cards */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              🙂 Little Help Needed
              <span className="ml-2 text-sm text-gray-500">({goodCards.length})</span>
            </h2>
            
            {goodCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goodCards.map(card => (
                  <Card key={card.id} className="overflow-hidden hover:shadow-md transition-shadow animate-fade-in">
                    <CardContent className="p-4">
                      <div className="font-medium mb-2 line-clamp-2">{card.question}</div>
                      <div className="text-sm text-gray-500 line-clamp-3">{card.answer}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">No cards in this category</div>
            )}
          </div>
          
          {/* Hard cards */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              🤔 Remind Me
              <span className="ml-2 text-sm text-gray-500">({hardCards.length})</span>
            </h2>
            
            {hardCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hardCards.map(card => (
                  <Card key={card.id} className="overflow-hidden hover:shadow-md transition-shadow animate-fade-in">
                    <CardContent className="p-4">
                      <div className="font-medium mb-2 line-clamp-2">{card.question}</div>
                      <div className="text-sm text-gray-500 line-clamp-3">{card.answer}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">No cards in this category</div>
            )}
          </div>
          
          {/* Never cards */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              😡 I Never Get These
              <span className="ml-2 text-sm text-gray-500">({neverCards.length})</span>
            </h2>
            
            {neverCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {neverCards.map(card => (
                  <Card key={card.id} className="overflow-hidden hover:shadow-md transition-shadow animate-fade-in">
                    <CardContent className="p-4">
                      <div className="font-medium mb-2 line-clamp-2">{card.question}</div>
                      <div className="text-sm text-gray-500 line-clamp-3">{card.answer}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">No cards in this category</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

const DeckDetail = () => (
  <FlashcardProvider>
    <DeckDetailContent />
  </FlashcardProvider>
);

export default DeckDetail;
