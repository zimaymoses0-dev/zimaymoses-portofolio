import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import type { SectionId, SectionItem } from "../data/sections";
import { fetchContentItems } from "../lib/api";

interface ContentItemsState {
  items: SectionItem[];
  loading: boolean;
  error: string | null;
}

export type View =
  | "immersive"
  | "project-space"
  | "story"
  | "about"
  | "work-overview"
  | "faq"
  | "credentials";

interface AppState {
  entered: boolean;
  activeSection: SectionId | null;
  authOpen: boolean;
  session: Session | null;
  view: View;
  passwordRecovery: boolean;
  contentItems: Partial<Record<SectionId, ContentItemsState>>;
  enter: () => void;
  openSection: (id: SectionId) => void;
  closeSection: () => void;
  openAuth: () => void;
  closeAuth: () => void;
  setSession: (session: Session | null) => void;
  setView: (view: View) => void;
  setPasswordRecovery: (value: boolean) => void;
  loadContentItems: (id: SectionId) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  entered: false,
  activeSection: null,
  authOpen: false,
  session: null,
  view: "immersive",
  passwordRecovery: false,
  contentItems: {},
  enter: () => set({ entered: true }),
  openSection: (id) => {
    set({ activeSection: id });
    get().loadContentItems(id);
  },
  closeSection: () => set({ activeSection: null }),
  openAuth: () => set({ authOpen: true }),
  closeAuth: () => set({ authOpen: false }),
  setSession: (session) => set({ session }),
  setView: (view) => set({ view }),
  setPasswordRecovery: (value) => set({ passwordRecovery: value }),
  loadContentItems: (id) => {
    const existing = get().contentItems[id];
    if (existing && (existing.loading || existing.items.length > 0)) return;

    set((state) => ({
      contentItems: { ...state.contentItems, [id]: { items: [], loading: true, error: null } },
    }));

    fetchContentItems(id)
      .then((items) => {
        set((state) => ({
          contentItems: { ...state.contentItems, [id]: { items, loading: false, error: null } },
        }));
      })
      .catch((err: Error) => {
        set((state) => ({
          contentItems: {
            ...state.contentItems,
            [id]: { items: [], loading: false, error: err.message },
          },
        }));
      });
  },
}));
