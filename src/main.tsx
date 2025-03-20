
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { FlashcardProvider } from './contexts/FlashcardContext.tsx'

createRoot(document.getElementById("root")!).render(
  <FlashcardProvider>
    <App />
  </FlashcardProvider>
);
