import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <p className="text-xl font-bold text-gray-800 dark:text-white">
            Weboldal Demo
          </p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Üdvözöllek a weboldalon!</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Ez egy példa oldal, amely bemutatja, hogyan működik a beágyazott AI Chat Widget.
          Kattints a jobb alsó sarokban lévő ikonra a beszélgetés indításához!
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Tartalom {i}</h2>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        ))}
      </div>

      {/* A Widget beillesztése */}
      <ChatWidget />
    </main>
  );
}
