import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import s from './AdminLayout.module.css'

const menu = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/movies', label: 'Phim', icon: '🎬' },
  { to: '/admin/showtimes', label: 'Lịch chiếu', icon: '🕐' },
  { to: '/admin/bookings', label: 'Đặt vé', icon: '🎟' },
  { to: '/admin/customers', label: 'Khách hàng', icon: '👥' },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className={s.layout}>
      <aside className={s.sidebar}>
        <div className={s.logo}>
          <div className={s.logoIcon}>R</div>
          <div>
            <div className={s.logoName}>RAINBOW</div>
            <div className={s.logoSub}>Admin Panel</div>
          </div>
        </div>

        <nav className={s.nav}>
          {menu.map(m => (
            <NavLink key={m.to} to={m.to} end={m.end}
              className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''}`}>
              <span>{m.icon}</span>
              {m.label}
            </NavLink>
          ))}
        </nav>

        <div className={s.userBox}>
          <div className={s.av}>{user?.full_name?.[0]}</div>
          <div className={s.userInfo}>
            <b>{user?.full_name}</b>
            <span>Quản trị viên</span>
          </div>
          <button onClick={() => { logout(); navigate('/') }} title="Đăng xuất">🚪</button>
        </div>
      </aside>

      <main className={s.main}>
        <Outlet />
      </main>
    </div>
  )
}