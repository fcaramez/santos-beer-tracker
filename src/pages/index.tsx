import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Santos Beer Tracker</title>
        <meta name="description" content="Santos Beer Tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen w-screen flex-col items-center justify-center">
        <h1 className="text-cyan-400">Hello canecas!</h1>
      </main>
    </>
  );
}
