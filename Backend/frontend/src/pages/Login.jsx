import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/authService'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value.trim() }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    
    // Validate form
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      console.log('Submitting form:', { ...form, password: '[REDACTED]' })
      const data = await authService.login(form)
      
      await Swal.fire({
        icon: 'success',
        title: 'OTP Sent!',
        text: `Your OTP sent on : ${data.email}`,
        confirmButtonColor: '#4F46E5'
      })
      
      navigate('/otp-verify', { 
        state: { 
          email: form.email,
          password: form.password,
          otp: data.otp
        },
        replace: true
      })
    } catch (err) {
      console.error('Login error:', err)
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="relative bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-lg border border-white/20">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white/20 px-4 py-1 rounded-full text-sm text-white backdrop-blur-md shadow-md">
          🔐 Secure Login
        </div>

        <h2 className="text-white text-3xl font-bold text-center mb-8">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              placeholder="you@example.com"
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
              required
            />
          </div>
          <div>
            <label className="block text-white text-sm mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition 
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600'}
              text-white flex items-center justify-center shadow-md`}
          >
            {loading && (
              <span className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
        <p className="text-center text-sm text-white/70 mt-6">
          Don't have an account? <Link to="/signup" className="underline hover:text-white">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}
