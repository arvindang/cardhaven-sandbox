
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, Image, File, Repeat } from 'lucide-react';
import { FlashcardProvider, useFlashcards } from '@/contexts/FlashcardContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { marked } from 'marked';

const CardCreationContent = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { getDeckById, data, addCard } = useFlashcards();
  
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedDecks, setSelectedDecks] = useState<string[]>([]);
  const [previewQuestion, setPreviewQuestion] = useState('');
  const [previewAnswer, setPreviewAnswer] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  useEffect(() => {
    if (deckId) {
      setSelectedDecks([deckId]);
    }
  }, [deckId]);

  useEffect(() => {
    if (isPreviewMode) {
      try {
        // Fix: Use synchronous version of marked and handle the return type correctly
        setPreviewQuestion(marked.parse(question, { async: false }) as string);
        setPreviewAnswer(marked.parse(answer, { async: false }) as string);
      } catch (error) {
        console.error('Markdown parsing error:', error);
        toast.error('Error previewing markdown');
      }
    }
  }, [question, answer, isPreviewMode]);
  
  const handleSave = () => {
    if (!question.trim() || !answer.trim()) {
      toast.error('Please provide both question and answer');
      return;
    }
    
    if (selectedDecks.length === 0) {
      toast.error('Please select at least one deck');
      return;
    }
    
    addCard({
      deckIds: selectedDecks,
      question,
      answer,
      difficulty: 'good',
      nextReview: new Date().toISOString()
    });
    
    // Navigate back to deck detail
    navigate(`/deck/${deckId}`);
  };
  
  const handleToggleDeck = (deckId: string) => {
    setSelectedDecks(prev => 
      prev.includes(deckId)
        ? prev.filter(id => id !== deckId)
        : [...prev, deckId]
    );
  };
  
  const currentDeck = deckId ? getDeckById(deckId) : null;
  const otherDecks = data.decks.filter(deck => deck.id !== deckId && !deck.archived);
  
  if (!currentDeck && deckId) {
    return <div>Deck not found</div>;
  }
  
  return (
    <Layout
      title="Create New Card"
      breadcrumbs={[
        { label: 'App', path: '/' },
        { label: 'Decks', path: '/' },
        ...(currentDeck ? [{ label: currentDeck.name, path: `/deck/${deckId}` }] : []),
        { label: 'Add Card', path: `/deck/${deckId}/add` }
      ]}
      actions={
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            className="flex items-center space-x-2 border border-gray-300 bg-white"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Question (Presented First)</h2>
              {isPreviewMode ? (
                <div 
                  className="markdown-content min-h-[200px] border border-gray-200 rounded-md p-4 bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: previewQuestion }}
                />
              ) : (
                <div className="relative">
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Write in Markdown, bracket [ ] closures."
                    className="min-h-[200px] resize-y"
                  />
                  <div className="absolute bottom-3 right-3 flex space-x-2">
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm">
                      <Mic size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm">
                      <Image size={18} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <Separator className="my-6" />
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Answer (Presented Second)</h2>
              {isPreviewMode ? (
                <div 
                  className="markdown-content min-h-[200px] border border-gray-200 rounded-md p-4 bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: previewAnswer }}
                />
              ) : (
                <div className="relative">
                  <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Write in Markdown, bracket [ ] closures."
                    className="min-h-[200px] resize-y"
                  />
                  <div className="absolute bottom-3 right-3 flex space-x-2">
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm">
                      <Mic size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm">
                      <Image size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm">
                      <File size={18} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <Separator className="my-6" />
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Repeat size={18} className="mr-2" />
                Add Cards to the following Decks
              </h2>
              
              <div className="space-y-3">
                {currentDeck && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`deck-${currentDeck.id}`} 
                      checked={selectedDecks.includes(currentDeck.id)}
                      onCheckedChange={() => handleToggleDeck(currentDeck.id)}
                    />
                    <Label htmlFor={`deck-${currentDeck.id}`}>{currentDeck.name} (Current)</Label>
                  </div>
                )}
                
                {otherDecks.map(deck => (
                  <div key={deck.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`deck-${deck.id}`} 
                      checked={selectedDecks.includes(deck.id)}
                      onCheckedChange={() => handleToggleDeck(deck.id)}
                    />
                    <Label htmlFor={`deck-${deck.id}`}>{deck.name}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => navigate(`/deck/${deckId}`)}>Cancel</Button>
              <Button onClick={handleSave}>Save Card</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const CardCreation = () => (
  <FlashcardProvider>
    <CardCreationContent />
  </FlashcardProvider>
);

export default CardCreation;
