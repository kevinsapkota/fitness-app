export default function RegisterPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Register</h1>

      <form className="mt-6 flex flex-col gap-4 max-w-sm">
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
        />

        <button className="bg-green-600 text-white p-2 rounded">
          Create Account
        </button>
      </form>
    </main>
  );
}
