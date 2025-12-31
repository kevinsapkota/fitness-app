"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Login</h1>

      <form
        className="mt-6 flex flex-col gap-4 max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          alert(`Email: ${email}`);
        }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />

        <button className="bg-black text-white p-2 rounded">
          Login
        </button>
      </form>
    </main>
  );
}

