type Props = {
  visible: boolean;
  onClick: () => void;
};

export function FAB({ visible, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-30 w-14 h-14 rounded-full btn-gold grid place-items-center transition-all duration-300 ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"
      }`}
      aria-label="إجراء سريع"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}
