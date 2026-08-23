export function CircleButton({ onClick, label = "EXPLORE MORE • " }: { onClick?: () => void; label?: string }) {
  const repeated = label.repeat(3);
  const pathId = "circle-button-path";

  return (
    <button className="faq-circle-btn" onClick={onClick} aria-label="Explore more">
      <svg viewBox="0 0 200 200" className="faq-circle-svg">
        <defs>
          <path id={pathId} d="M 100,100 m -75,0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" />
        </defs>
        <text fontSize="11" letterSpacing="2" fill="#f5f5f5">
          <textPath href={`#${pathId}`}>{repeated}</textPath>
        </text>
      </svg>
      <span className="faq-circle-arrow">→</span>
    </button>
  );
}
