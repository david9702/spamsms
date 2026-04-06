// Shared types

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
}

export interface SmsDraft {
  contacts: Contact[];
  message: string;
}

export interface SendProgress {
  running: boolean;
  done: boolean;
  statusText: string;
}
