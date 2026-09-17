import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { UrlCreator } from './components/UrlCreator';
import { UrlList } from './components/UrlList';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { useOwnerToken } from './hooks/useOwnerToken';
import { useToast } from './hooks/useToast';
import { useUrls } from './hooks/useUrls';
import type { UrlRecord } from './types/url';
import './App.css';

function App() {
  const ownerToken = useOwnerToken();
  const { toasts, showToast, dismiss } = useToast();
  const { urls, isLoading, loadError, refresh, addUrlOptimistically, removeUrl, deletingCodes } =
    useUrls(ownerToken);
  const [newlyAddedCode, setNewlyAddedCode] = useState<string | null>(null);

  function handleCreated(record: UrlRecord) {
    addUrlOptimistically(record);
    setNewlyAddedCode(record.shortCode);
    setTimeout(() => setNewlyAddedCode(null), 900);
  }

  function scrollToCreate() {
    document.getElementById('create')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div id="top">
      <div className="aurora-layer" aria-hidden="true" />
      <Header />

      <main>
        <Hero />

        <section id="create" className="creator-section" aria-labelledby="create-heading">
          <h2 id="create-heading" className="sr-only">
            Create a short URL
          </h2>
          <UrlCreator ownerToken={ownerToken} onCreated={handleCreated} showToast={showToast} />
        </section>

        <UrlList
          urls={urls}
          isLoading={isLoading}
          loadError={loadError}
          onRefresh={refresh}
          onDelete={removeUrl}
          deletingCodes={deletingCodes}
          newlyAddedCode={newlyAddedCode}
          showToast={showToast}
          onCreateClick={scrollToCreate}
        />
      </main>

      <Footer />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

export default App;
