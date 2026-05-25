import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/movieService'
import toast from 'react-hot-toast'
import s from './Auth.module.css'

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name:'', email:'', phone:'', password:'', confirm:'' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Mật khẩu không khớp')
    if (form.password.length < 6) return toast.error('Mật khẩu ít nhất 6 ký tự')
    setLoading(true)
    try {
      const res = await authService.register({ full_name:form.full_name, email:form.email, phone:form.phone, password:form.password })
      login(res.data.data.user, res.data.data.token)
      toast.success('Đăng ký thành công!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại')
    } finally { setLoading(false) }
  }

  return (
    <div className={s.page}>
      <div className={s.left}>
        <div className={s.brand}>
          <div className={s.bIcon}>R</div>
          <div className={s.bName}>RAINBOW<span>CINEMAS</span></div>
        </div>
        <h1 className={s.tagline}>Tham Gia<br/>Rainbow<br/>Cinemas.</h1>
      </div>
      <div className={s.right}>
        <div className={s.card}>
          <h2 className={s.title}>Tạo Tài Khoản</h2>
          <p className={s.sub}>Đăng ký để bắt đầu đặt vé</p>
          <form onSubmit={submit} className={s.form}>
            {[
              { label:'Họ và tên', key:'full_name', type:'text', ph:'Nguyễn Văn A' },
              { label:'Email', key:'email', type:'email', ph:'name@mail.com' },
              { label:'Số điện thoại', key:'phone', type:'tel', ph:'0912345678' },
              { label:'Mật khẩu', key:'password', type:'password', ph:'Ít nhất 6 ký tự' },
              { label:'Xác nhận mật khẩu', key:'confirm', type:'password', ph:'Nhập lại mật khẩu' },
            ].map(f => (
              <div key={f.key} className={s.field}>
                <label>{f.label}</label>
                <input type={f.type} placeholder={f.ph} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  required={f.key !== 'phone'} />
              </div>
            ))}
            <button type="submit" className={s.btn} disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>
          <p className={s.switch}>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
        </div>
      </div>
    </div>
  )
}