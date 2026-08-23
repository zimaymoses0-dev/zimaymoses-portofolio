import mzLogo from "../assets/mz-logo.png";
import { QuickContactForm } from "./QuickContactForm";
import "./NoWebGLFallback.css";

export function NoWebGLFallback() {
  return (
    <div className="fallback-root">
      <img src={mzLogo} alt="Moses Z. Zimay" className="fallback-logo" />
      <p className="eyebrow">MOSES Z. ZIMAY — CREATIVE DIRECTOR</p>
      <h1 className="fallback-title">
        This site's immersive experience needs a browser with 3D graphics support.
      </h1>
      <p className="fallback-body">
        Your browser or device doesn't support WebGL, so the interactive Creative Room
        can't run here. You can still get in touch below.
      </p>
      <div className="fallback-contact">
        <QuickContactForm defaultOpen />
      </div>
    </div>
  );
}
