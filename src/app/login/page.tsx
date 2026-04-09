"use client"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation" // wait, no it's next/navigation
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false
    })

    if (res?.error) {
      setError("Identifiants incorrects")
    } else {
      window.location.href = "/admin"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-light mb-8 text-center tracking-wider text-white">
          SOFIANE <span className="font-bold">RAW</span>
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 rounded text-white focus:outline-none focus:border-zinc-500 transition"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 px-4 py-3 rounded text-white focus:outline-none focus:border-zinc-500 transition"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-white text-black font-medium py-3 rounded hover:bg-zinc-200 transition duration-300"
          >
            Se Connecter
          </button>
        </form>
      </div>
    </div>
  )
}
