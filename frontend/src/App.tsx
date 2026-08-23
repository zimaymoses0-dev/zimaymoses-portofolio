import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Room } from "./scene/Room";
import { IntroOverlay } from "./ui/IntroOverlay";
import { Hud } from "./ui/Hud";
import { SectionPanel } from "./ui/SectionPanel";
import { AuthModal } from "./ui/AuthModal";
import { ResetPasswordModal } from "./ui/ResetPasswordModal";
import { NoWebGLFallback } from "./ui/NoWebGLFallback";

const ProjectSpace = lazy(() => import("./space/ProjectSpace").then((m) => ({ default: m.ProjectSpace })));
const StoryPage = lazy(() => import("./story/StoryPage").then((m) => ({ default: m.StoryPage })));
const AboutPage = lazy(() => import("./about/AboutPage").then((m) => ({ default: m.AboutPage })));
const WorkPage = lazy(() => import("./work/WorkPage").then((m) => ({ default: m.WorkPage })));
const FAQPage = lazy(() => import("./faq/FAQPage").then((m) => ({ default: m.FAQPage })));
const CredentialsPage = lazy(() =>
  import("./credentials/CredentialsPage").then((m) => ({ default: m.CredentialsPage }))
);
import { isWebGLSupported } from "./lib/webglSupport";
import { supabase } from "./lib/supabaseClient";
import { useAppStore, type View } from "./store/useAppStore";
import "./App.css";

const HASH_VIEW_ALIASES: Record<string, View> = {
  work: "work-overview",
  "work-overview": "work-overview",
  about: "about",
  story: "story",
  faq: "faq",
  credentials: "credentials",
  "project-space": "project-space",
  immersive: "immersive",
};

function App() {
  const setSession = useAppStore((s) => s.setSession);
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const setPasswordRecovery = useAppStore((s) => s.setPasswordRecovery);
  const [webglSupported] = useState(isWebGLSupported);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
    });

    return () => subscription.subscription.unsubscribe();
  }, [setSession, setPasswordRecovery]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const target = HASH_VIEW_ALIASES[hash];
    if (target) setView(target);
  }, [setView]);

  let page: ReactNode;

  if (view === "project-space") {
    page = (
      <Suspense fallback={<div className="app-root" />}>
        <ProjectSpace />
      </Suspense>
    );
  } else if (view === "story") {
    page = (
      <Suspense fallback={<div className="app-root" />}>
        <StoryPage />
      </Suspense>
    );
  } else if (view === "about") {
    page = (
      <Suspense fallback={<div className="app-root" />}>
        <AboutPage />
      </Suspense>
    );
  } else if (view === "work-overview") {
    page = (
      <Suspense fallback={<div className="app-root" />}>
        <WorkPage />
      </Suspense>
    );
  } else if (view === "faq") {
    page = (
      <Suspense fallback={<div className="app-root" />}>
        <FAQPage />
      </Suspense>
    );
  } else if (view === "credentials") {
    page = (
      <Suspense fallback={<div className="app-root" />}>
        <CredentialsPage />
      </Suspense>
    );
  } else if (!webglSupported) {
    page = <NoWebGLFallback />;
  } else {
    page = (
      <div className="app-root">
        <Canvas camera={{ position: [0, 2, 9], fov: 45 }}>
          <Suspense fallback={null}>
            <Room />
          </Suspense>
        </Canvas>

        <IntroOverlay />
        <Hud />
        <SectionPanel />
      </div>
    );
  }

  return (
    <>
      {page}
      <AuthModal />
      <ResetPasswordModal />
    </>
  );
}

export default App;
