
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderPlus, Plus, MoreVertical, BookPlus, Archive, Pencil, Trash2, ChevronDown, ChevronRight, FolderOpen, Book } from 'lucide-react';
import { FlashcardProvider, useFlashcards } from '@/contexts/FlashcardContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const IndexContent = () => {
  const { data, getDecksInFolder, getStandaloneDecks, addFolder, addDeck, archiveDeck, renameDeck, deleteDeck } = useFlashcards();
  const [showActive, setShowActive] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [newDeckDialog, setNewDeckDialog] = useState(false);
  const [renameDeckDialog, setRenameDeckDialog] = useState(false);
  const [currentDeck, setCurrentDeck] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleAddFolder = () => {
    if (newName.trim()) {
      addFolder(newName);
      setNewName('');
      setNewFolderDialog(false);
    } else {
      toast.error('Please enter a folder name');
    }
  };

  const handleAddDeck = () => {
    if (newName.trim()) {
      addDeck({
        name: newName,
        totalCards: 0,
        easy: 0,
        good: 0,
        hard: 0,
        cardsLeft: 0,
        archived: false,
        parentFolder: selectedFolder
      });
      setNewName('');
      setNewDeckDialog(false);
    } else {
      toast.error('Please enter a deck name');
    }
  };

  const handleRenameDeck = () => {
    if (newName.trim() && currentDeck) {
      renameDeck(currentDeck, newName);
      setNewName('');
      setRenameDeckDialog(false);
      setCurrentDeck(null);
    } else {
      toast.error('Please enter a deck name');
    }
  };

  const openRenameDeckDialog = (deckId: string, currentName: string) => {
    setCurrentDeck(deckId);
    setNewName(currentName);
    setRenameDeckDialog(true);
  };

  const handleArchiveDeck = (deckId: string) => {
    archiveDeck(deckId);
  };

  const handleDeleteDeck = (deckId: string) => {
    if (confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
      deleteDeck(deckId);
    }
  };

  const activeDecks = data.decks.filter(deck => !deck.archived);
  const archivedDecks = data.decks.filter(deck => deck.archived);
  const standaloneDecks = getStandaloneDecks();

  const totalActiveCards = activeDecks.reduce((acc, deck) => acc + deck.totalCards, 0);
  const totalEasy = activeDecks.reduce((acc, deck) => acc + deck.easy, 0);
  const totalGood = activeDecks.reduce((acc, deck) => acc + deck.good, 0);
  const totalHard = activeDecks.reduce((acc, deck) => acc + deck.hard, 0);
  const totalCardsLeft = activeDecks.reduce((acc, deck) => acc + deck.cardsLeft, 0);

  return (
    <Layout 
      title="Flashcards"
      breadcrumbs={[
        { label: 'App', path: '/' },
        { label: 'Decks', path: '/' }
      ]}
      actions={
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            className="flex items-center space-x-2 border border-gray-300 bg-white"
            onClick={() => {
              setNewName('');
              setNewFolderDialog(true);
            }}
          >
            <FolderPlus size={18} className="text-blue-accent" />
            <span>New Folder</span>
          </Button>
          <Button 
            className="flex items-center space-x-2 bg-blue-accent hover:bg-blue-600"
            onClick={() => {
              setNewName('');
              setSelectedFolder(null);
              setNewDeckDialog(true);
            }}
          >
            <Plus size={18} />
            <span>New Deck</span>
          </Button>
        </div>
      }
    >
      <div className="mb-6">
        <div className="flex space-x-2 mb-4">
          <Button
            variant={showActive ? "default" : "outline"}
            className={`rounded-full text-sm px-4 ${showActive ? 'bg-blue-accent hover:bg-blue-600' : 'border border-gray-300'}`}
            onClick={() => setShowActive(true)}
          >
            Active
          </Button>
          <Button
            variant={!showActive ? "default" : "outline"}
            className={`rounded-full text-sm px-4 ${!showActive ? 'bg-blue-accent hover:bg-blue-600' : 'border border-gray-300'}`}
            onClick={() => setShowActive(false)}
          >
            Archived
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden animate-fade-in">
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
              <div className="w-24 text-right text-gray-600">{totalActiveCards} Total</div>
              <div className="w-24 text-right text-green-500">{totalEasy} Easy</div>
              <div className="w-24 text-right text-blue-accent">{totalGood} Good</div>
              <div className="w-24 text-right text-amber-500">{totalHard} Hard</div>
              <div className="w-48 text-right text-blue-accent font-medium">
                {totalCardsLeft} Cards Left Today
              </div>
              <div className="w-10"></div>
            </div>
          </div>

          {showActive ? (
            <>
              {/* Folders */}
              {data.folders.map(folder => (
                <div key={folder.id} className="border-b border-gray-100">
                  <div 
                    className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleFolder(folder.id)}  
                  >
                    <div className="w-6 mr-2">
                      {expandedFolders[folder.id] ? 
                        <ChevronDown size={18} className="text-gray-400" /> : 
                        <ChevronRight size={18} className="text-gray-400" />
                      }
                    </div>
                    <div className="flex-1 flex items-center font-medium">
                      <FolderOpen size={18} className="mr-2 text-gray-400" />
                      {folder.name}
                    </div>
                    {/* Add folder stats here */}
                    <div className="w-48"></div>
                    <div className="w-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-full hover:bg-gray-100">
                            <MoreVertical size={16} className="text-gray-500" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewName('');
                              setSelectedFolder(folder.id);
                              setNewDeckDialog(true);
                            }}
                            className="cursor-pointer"
                          >
                            <BookPlus size={16} className="mr-2" />
                            Add Deck
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Decks in folder */}
                  {expandedFolders[folder.id] && getDecksInFolder(folder.id).map(deck => (
                    <div 
                      key={deck.id} 
                      className="flex items-center p-4 pl-10 hover:bg-gray-50 border-t border-gray-100"
                    >
                      <div className="w-6 mr-2">
                        <input 
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-accent"
                        />
                      </div>
                      <Link to={`/deck/${deck.id}`} className="flex-1 flex items-center text-gray-800 hover:text-blue-accent">
                        <Book size={18} className="mr-2 text-blue-accent" />
                        {deck.name}
                      </Link>
                      <div className="w-24 text-right text-gray-600">{deck.totalCards} Total</div>
                      <div className="w-24 text-right text-green-500">{deck.easy} Easy</div>
                      <div className="w-24 text-right text-blue-accent">{deck.good} Good</div>
                      <div className="w-24 text-right text-amber-500">{deck.hard} Hard</div>
                      <div className="w-48 text-right">
                        {deck.cardsLeft > 0 ? (
                          <Link 
                            to={`/deck/${deck.id}/review`}
                            className="text-blue-accent font-medium"
                          >
                            {deck.cardsLeft} Cards Left Today
                          </Link>
                        ) : (
                          <span className="text-gray-400">Completed</span>
                        )}
                      </div>
                      <div className="w-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded-full hover:bg-gray-100">
                              <MoreVertical size={16} className="text-gray-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => window.location.href = `/deck/${deck.id}/add`}
                              className="cursor-pointer"
                            >
                              <BookPlus size={16} className="mr-2" />
                              Add Card
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleArchiveDeck(deck.id)}
                              className="cursor-pointer"
                            >
                              <Archive size={16} className="mr-2" />
                              Archive Deck
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openRenameDeckDialog(deck.id, deck.name)}
                              className="cursor-pointer"
                            >
                              <Pencil size={16} className="mr-2" />
                              Rename Deck
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteDeck(deck.id)}
                              className="cursor-pointer text-red-accent"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete Deck
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Standalone decks */}
              {standaloneDecks.map(deck => (
                <div 
                  key={deck.id} 
                  className="flex items-center p-4 hover:bg-gray-50 border-b border-gray-100"
                >
                  <div className="w-6 mr-2">
                    <input 
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-accent"
                    />
                  </div>
                  <Link to={`/deck/${deck.id}`} className="flex-1 flex items-center text-gray-800 hover:text-blue-accent">
                    <Book size={18} className="mr-2 text-blue-accent" />
                    {deck.name}
                  </Link>
                  <div className="w-24 text-right text-gray-600">{deck.totalCards} Total</div>
                  <div className="w-24 text-right text-green-500">{deck.easy} Easy</div>
                  <div className="w-24 text-right text-blue-accent">{deck.good} Good</div>
                  <div className="w-24 text-right text-amber-500">{deck.hard} Hard</div>
                  <div className="w-48 text-right">
                    {deck.cardsLeft > 0 ? (
                      <Link 
                        to={`/deck/${deck.id}/review`}
                        className="text-blue-accent font-medium"
                      >
                        {deck.cardsLeft} Cards Left Today
                      </Link>
                    ) : (
                      <span className="text-gray-400">Completed</span>
                    )}
                  </div>
                  <div className="w-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-full hover:bg-gray-100">
                          <MoreVertical size={16} className="text-gray-500" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => window.location.href = `/deck/${deck.id}/add`}
                          className="cursor-pointer"
                        >
                          <BookPlus size={16} className="mr-2" />
                          Add Card
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleArchiveDeck(deck.id)}
                          className="cursor-pointer"
                        >
                          <Archive size={16} className="mr-2" />
                          Archive Deck
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openRenameDeckDialog(deck.id, deck.name)}
                          className="cursor-pointer"
                        >
                          <Pencil size={16} className="mr-2" />
                          Rename Deck
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteDeck(deck.id)}
                          className="cursor-pointer text-red-accent"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete Deck
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </>
          ) : (
            // Archived decks
            archivedDecks.map(deck => (
              <div 
                key={deck.id} 
                className="flex items-center p-4 hover:bg-gray-50 border-b border-gray-100"
              >
                <div className="w-6 mr-2">
                  <input 
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-accent"
                  />
                </div>
                <Link to={`/deck/${deck.id}`} className="flex-1 flex items-center text-gray-800 hover:text-blue-accent">
                  <Book size={18} className="mr-2 text-gray-400" />
                  {deck.name}
                </Link>
                <div className="w-24 text-right text-gray-600">{deck.totalCards} Total</div>
                <div className="w-24 text-right text-green-500">{deck.easy} Easy</div>
                <div className="w-24 text-right text-blue-accent">{deck.good} Good</div>
                <div className="w-24 text-right text-amber-500">{deck.hard} Hard</div>
                <div className="w-48 text-right">
                  <span className="text-gray-400">Archived</span>
                </div>
                <div className="w-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-full hover:bg-gray-100">
                        <MoreVertical size={16} className="text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => {
                          const updatedDecks = data.decks.map(d => 
                            d.id === deck.id ? { ...d, archived: false } : d
                          );
                          toast.success('Deck unarchived successfully!');
                        }}
                        className="cursor-pointer"
                      >
                        <Archive size={16} className="mr-2" />
                        Unarchive Deck
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteDeck(deck.id)}
                        className="cursor-pointer text-red-accent"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete Deck
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialog} onOpenChange={setNewFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Folder Name</Label>
              <Input 
                id="name" 
                placeholder="Enter folder name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialog(false)}>Cancel</Button>
            <Button onClick={handleAddFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Deck Dialog */}
      <Dialog open={newDeckDialog} onOpenChange={setNewDeckDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Deck</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Deck Name</Label>
              <Input 
                id="name" 
                placeholder="Enter deck name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDeckDialog(false)}>Cancel</Button>
            <Button onClick={handleAddDeck}>Create Deck</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Deck Dialog */}
      <Dialog open={renameDeckDialog} onOpenChange={setRenameDeckDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Deck</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename">New Name</Label>
              <Input 
                id="rename" 
                placeholder="Enter new name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDeckDialog(false)}>Cancel</Button>
            <Button onClick={handleRenameDeck}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

const Index = () => (
  <FlashcardProvider>
    <IndexContent />
  </FlashcardProvider>
);

export default Index;
