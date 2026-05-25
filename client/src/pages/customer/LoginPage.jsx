import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/movieService'
import toast from 'react-hot-toast'
import s from './Auth.module.css'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const from = useLocation().state?.from || '/'

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await authService.login(form)
      login(res.data.data.user, res.data.data.token)
      toast.success('Đăng nhập thành công!')
      navigate(res.data.data.user.role === 'admin' ? '/admin' : from)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại')
    } finally { setLoading(false) }
  }

  return (
    <div className={s.page}>
      <div className={s.left}>
        <div className={s.brand}>
          <div className={s.bIcon}>R</div>
          <div className={s.bName}>RAINBOW<span>CINEMAS</span></div>
        </div>
        <h1 className={s.tagline}>Movies.<br/>Moments.<br/>Memories.</h1>
        <p className={s.hint}>🧪 Test: admin@rainbowcinemas.vn / password123</p>
      </div>
      <div className={s.right}>
        <div className={s.card}>
          <h2 className={s.title}>Đăng Nhập</h2>
          <p className={s.sub}>Nhập email và mật khẩu để tiếp tục</p>
          <form onSubmit={submit} className={s.form}>
            <div className={s.field}>
              <label>Email</label>
              <input type="email" placeholder="name@mail.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className={s.field}>
              <label>Mật khẩu</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className={s.btn} disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          <p className={s.switch}>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
        </div>
      </div>
    </div>
  )
}