export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-3xl p-8 space-y-6">
        <h1 className="text-3xl font-bold">Cashier System</h1>
        <p className="text-gray-600">Welcome. Use the button below to open the POS interface.</p>
        <a
          href="/pos"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Open POS
        </a>
      </div>
    </main>
  );
}
