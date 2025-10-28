import Header from "../dashboard/products/components/Header"; // Importa el Header

export default function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header /> {/* El Header aquí para que aparezca en el POS */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}