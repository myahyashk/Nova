export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="nova-logo-glow">
        <img
          src="/Nova_Logo_Icon.png"
          alt="Loading..."
          className="w-12 h-12 object-contain animate-spin"
          style={{ animationDuration: '1.2s' }}
        />
      </div>
    </div>
  );
}
