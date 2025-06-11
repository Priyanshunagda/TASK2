import { Link } from 'react-router-dom'


export default function Home({ isLoggedIn }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 via-indigo-900 to-blue-900 text-white">
      <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-3xl p-12 w-full max-w-xl text-center animate-fade-in">
        <h1 className="text-4xl font-extrabold mb-6 tracking-tight">
          {isLoggedIn ? '🎉 Welcome Back!' : '👋 Welcome to Admin Portal'}
        </h1>

        <p className="text-white/80 text-lg mb-10">
          {isLoggedIn
            ? 'You are logged in and ready to explore.'
            : 'Please log in or sign up to continue.'}
        </p>

        {!isLoggedIn ? (
          <div className="flex justify-center gap-6">
            <Link to="/login">
              <button className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 transition rounded-xl font-medium shadow-lg">
                Log In
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-6 py-3 bg-green-500 hover:bg-green-600 transition rounded-xl font-medium shadow-lg">
                Sign Up
              </button>
            </Link>
          </div>
        ) : (
          <Link to="/dashboard">
            <button className="mt-6 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 transition rounded-xl font-medium shadow-lg">
              Go to Dashboard
            </button>
          </Link>
        )}

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-white/60">
          © {new Date().getFullYear()} Admin Portal
        </div>
      </div>
    </div>
  )
}
