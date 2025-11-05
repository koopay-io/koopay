export function LoadingState({ message = "Cargando proyecto..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">{message}</div>
    </div>
  );
}

