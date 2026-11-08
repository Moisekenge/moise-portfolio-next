import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap relative z-[2] flex min-h-svh flex-col justify-center">
      <h1 className="text-[clamp(3rem,10vw,9rem)] font-medium leading-none tracking-[-0.05em]">Nothing here.</h1>
      <Link href="/" className="link-line mt-8 w-fit">
        Back home
      </Link>
    </main>
  );
}
