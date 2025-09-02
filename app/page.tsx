"use client";

import { useSession, signOut } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {session ? (
        <>
          <h1 className="text-3xl font-bold mb-4">
            Welcome, {session.user?.name || "User"} 👋
          </h1>
          <p className="mb-6">You are logged in as <b>{session.user?.role}</b>.</p>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </>
      ) : (
        <h1 className="text-2xl">Not logged in</h1>
      )}
    </div>
  );
}
