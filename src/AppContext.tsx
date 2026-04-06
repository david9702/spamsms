/**
 * Global app state shared between screens via React Context.
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Contact } from './types';

interface AppState {
  selectedContacts: Contact[];
  setSelectedContacts: (contacts: Contact[]) => void;
  messageText: string;
  setMessageText: (text: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [messageText, setMessageText] = useState('');

  return (
    <AppContext.Provider
      value={{
        selectedContacts,
        setSelectedContacts,
        messageText,
        setMessageText,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
