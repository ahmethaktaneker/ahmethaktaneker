export function AmbientGlow({ className = "h-full" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute left-0 right-0 top-0 -z-10 overflow-hidden ${className}`}
    >
      <div className="ambient-blob-a absolute left-[-12%] top-[-18%] h-[52vw] w-[52vw] max-h-[560px] max-w-[560px] rounded-full bg-primary/[0.08] blur-[110px]" />
      <div className="ambient-blob-b absolute bottom-[-22%] right-[-14%] h-[46vw] w-[46vw] max-h-[480px] max-w-[480px] rounded-full bg-[#5a6d90]/[0.09] blur-[120px]" />
      <div className="bg-grain absolute inset-0" />
    </div>
  );
}
