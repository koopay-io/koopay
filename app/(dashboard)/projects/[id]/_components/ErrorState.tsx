export function ErrorState({ message = "Proyecto no encontrado" }: { message?: string }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">{message}</div>
    </div>
  );
}

