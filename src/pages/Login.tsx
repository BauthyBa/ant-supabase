import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    } else {
      setError("")
      navigate("/")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="glass-container max-w-md w-full p-8 rounded-2xl shadow-lg">
        <h2 className="glass-title text-2xl font-semibold text-center mb-6 text-white">
          Iniciar sesión
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full mt-1"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full mt-1"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button type="submit" className="glass-send w-full mt-2">
            Entrar
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <hr className="flex-1 border-gray-700" />
          <span className="text-gray-400 text-sm">ó</span>
          <hr className="flex-1 border-gray-700" />
        </div>

        <p className="text-sm text-center text-gray-300">
          ¿No tienes una cuenta?{" "}
          <a href="/signup" className="text-indigo-300 hover:underline">
            Regístrate
          </a>
        </p>
      </div>
    </div>
  )
}

export default Login
