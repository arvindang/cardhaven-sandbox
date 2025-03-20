
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

// Define types for our data structures
export interface Card {
  id: string;
  deckIds: string[];
  question: string;
  answer: string;
  difficulty: 'easy' | 'good' | 'hard' | 'never';
  nextReview: string;
}

export interface Deck {
  id: string;
  name: string;
  totalCards: number;
  easy: number;
  good: number;
  hard: number;
  cardsLeft: number;
  archived: boolean;
  parentFolder: string | null;
}

export interface Folder {
  id: string;
  name: string;
  decks: string[];
}

interface FlashcardData {
  folders: Folder[];
  decks: Deck[];
  cards: Card[];
}

interface FlashcardContextType {
  data: FlashcardData;
  getCardsForDeck: (deckId: string) => Card[];
  getDeckById: (deckId: string) => Deck | undefined;
  addCard: (card: Omit<Card, 'id'>) => void;
  updateCardDifficulty: (cardId: string, difficulty: Card['difficulty']) => void;
  addDeck: (deck: Omit<Deck, 'id'>) => string;
  updateDeck: (deck: Deck) => void;
  deleteDeck: (deckId: string) => void;
  addFolder: (name: string) => void;
  getDecksInFolder: (folderId: string) => Deck[];
  getStandaloneDecks: () => Deck[];
  archiveDeck: (deckId: string) => void;
  unarchiveDeck: (deckId: string) => void;
  renameDeck: (deckId: string, newName: string) => void;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const FlashcardProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<FlashcardData>({
    folders: [],
    decks: [],
    cards: []
  });

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedData = localStorage.getItem('flashcardData');
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('flashcardData', JSON.stringify(data));
  }, [data]);

  const getCardsForDeck = (deckId: string) => {
    return data.cards.filter(card => card.deckIds.includes(deckId));
  };

  const getDeckById = (deckId: string) => {
    return data.decks.find(deck => deck.id === deckId);
  };

  const addCard = (card: Omit<Card, 'id'>) => {
    const newCard: Card = {
      ...card,
      id: `card-${Date.now()}`
    };

    // Update the counts for each deck this card belongs to
    const updatedDecks = data.decks.map(deck => {
      if (card.deckIds.includes(deck.id)) {
        return {
          ...deck,
          totalCards: deck.totalCards + 1,
          [card.difficulty]: deck[card.difficulty as keyof Pick<Deck, 'easy' | 'good' | 'hard'>] + 1,
          cardsLeft: deck.cardsLeft + 1
        };
      }
      return deck;
    });

    setData(prev => ({
      ...prev,
      cards: [...prev.cards, newCard],
      decks: updatedDecks
    }));
    
    toast.success('Card added successfully!');
  };

  const updateCardDifficulty = (cardId: string, difficulty: Card['difficulty']) => {
    const cardToUpdate = data.cards.find(card => card.id === cardId);
    
    if (!cardToUpdate) return;
    
    const oldDifficulty = cardToUpdate.difficulty;
    
    // Update the card
    const updatedCards = data.cards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          difficulty
        };
      }
      return card;
    });
    
    // Update the decks that contain this card
    const updatedDecks = data.decks.map(deck => {
      if (cardToUpdate.deckIds.includes(deck.id)) {
        return {
          ...deck,
          [oldDifficulty]: Math.max(0, deck[oldDifficulty as keyof Pick<Deck, 'easy' | 'good' | 'hard'>] - 1),
          [difficulty]: deck[difficulty as keyof Pick<Deck, 'easy' | 'good' | 'hard'>] + 1
        };
      }
      return deck;
    });
    
    setData(prev => ({
      ...prev,
      cards: updatedCards,
      decks: updatedDecks
    }));
    
    toast.success('Card difficulty updated!');
  };

  const addDeck = (deck: Omit<Deck, 'id'>) => {
    const newDeckId = `deck-${Date.now()}`;
    
    const newDeck: Deck = {
      ...deck,
      id: newDeckId
    };
    
    setData(prev => ({
      ...prev,
      decks: [...prev.decks, newDeck],
      folders: prev.folders.map(folder => {
        if (folder.id === deck.parentFolder) {
          return {
            ...folder,
            decks: [...folder.decks, newDeckId]
          };
        }
        return folder;
      })
    }));
    
    toast.success('Deck created successfully!');
    return newDeckId;
  };

  const updateDeck = (updatedDeck: Deck) => {
    setData(prev => ({
      ...prev,
      decks: prev.decks.map(deck => 
        deck.id === updatedDeck.id ? updatedDeck : deck
      )
    }));
  };

  const deleteDeck = (deckId: string) => {
    // Remove the deck
    const updatedDecks = data.decks.filter(deck => deck.id !== deckId);
    
    // Remove the deck reference from any folders
    const updatedFolders = data.folders.map(folder => ({
      ...folder,
      decks: folder.decks.filter(id => id !== deckId)
    }));
    
    // Filter out cards that are only in this deck
    const updatedCards = data.cards.filter(card => {
      const otherDecks = card.deckIds.filter(id => id !== deckId);
      return otherDecks.length > 0;
    });
    
    // Update cards that are in multiple decks
    const cardsToUpdate = data.cards.filter(card => 
      card.deckIds.includes(deckId) && card.deckIds.length > 1
    );
    
    const finalCards = updatedCards.map(card => {
      if (cardsToUpdate.find(c => c.id === card.id)) {
        return {
          ...card,
          deckIds: card.deckIds.filter(id => id !== deckId)
        };
      }
      return card;
    });
    
    setData(prev => ({
      ...prev,
      decks: updatedDecks,
      folders: updatedFolders,
      cards: finalCards
    }));
    
    toast.success('Deck deleted successfully!');
  };

  const addFolder = (name: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      decks: []
    };
    
    setData(prev => ({
      ...prev,
      folders: [...prev.folders, newFolder]
    }));
    
    toast.success('Folder created successfully!');
  };

  const getDecksInFolder = (folderId: string) => {
    const folder = data.folders.find(f => f.id === folderId);
    if (!folder) return [];
    
    return data.decks.filter(deck => folder.decks.includes(deck.id));
  };

  const getStandaloneDecks = () => {
    return data.decks.filter(deck => !deck.parentFolder && !deck.archived);
  };

  const archiveDeck = (deckId: string) => {
    setData(prev => ({
      ...prev,
      decks: prev.decks.map(deck => 
        deck.id === deckId ? { ...deck, archived: true } : deck
      )
    }));
    
    toast.success('Deck archived successfully!');
  };

  const unarchiveDeck = (deckId: string) => {
    setData(prev => ({
      ...prev,
      decks: prev.decks.map(deck => 
        deck.id === deckId ? { ...deck, archived: false } : deck
      )
    }));
    
    toast.success('Deck unarchived successfully!');
  };

  const renameDeck = (deckId: string, newName: string) => {
    setData(prev => ({
      ...prev,
      decks: prev.decks.map(deck => 
        deck.id === deckId ? { ...deck, name: newName } : deck
      )
    }));
    
    toast.success('Deck renamed successfully!');
  };

  return (
    <FlashcardContext.Provider
      value={{
        data,
        getCardsForDeck,
        getDeckById,
        addCard,
        updateCardDifficulty,
        addDeck,
        updateDeck,
        deleteDeck,
        addFolder,
        getDecksInFolder,
        getStandaloneDecks,
        archiveDeck,
        unarchiveDeck,
        renameDeck
      }}
    >
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};
