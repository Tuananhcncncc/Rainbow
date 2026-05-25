import { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import s from './Navbar.module.css'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [drop, setDrop] = useState(false)
  const [menu, setMenu] = useState(false)

  const links = [
    { to: '/', label: 'Trang chủ' },
    { to: '/schedule', label: 'Lịch chiếu' },
    { to: '/price', label: 'Giá vé' },
  ]

  return (
    <>
      <nav className={s.nav}>
        <div className={s.inner}>
          <Link to="/" className={s.logo}>
            <div className={s.logoIcon}>R</div>
            <div>
              <div className={s.logoName}>RAINBOW</div>
              <div className={s.logoCin}>CINEMAS</div>
            </div>
          </Link>

          <div className={`${s.links} ${menu ? s.open : ''}`}>
            {links.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMenu(false)}
                className={`${s.link} ${pathname === l.to ? s.active : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className={s.right}>
            {isAuthenticated ? (
              <div className={s.userWrap}>
                <button className={s.userBtn} onClick={() => setDrop(!drop)}>
                  <div className={s.av}>{user?.full_name?.[0]?.toUpperCase()}</div>
                  <span>{user?.full_name?.split(' ').pop()}</span>
                  <span>▾</span>
                </button>
                {drop && (
                  <div className={s.drop}>
                    <div className={s.dropHead}>
                      <b>{user?.full_name}</b>
                      <span>{user?.email}</span>
                    </div>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className={s.dropItem} onClick={() => setDrop(false)}>🛠 Admin</Link>
                    )}
                    <Link to="/my-tickets" className={s.dropItem} onClick={() => setDrop(false)}>🎟 Vé của tôi</Link>
                    <button className={s.dropOut} onClick={() => { logout(); navigate('/'); setDrop(false); }}>🚪 Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : (
              <div className={s.authBtns}>
                <Link to="/login" className={s.loginBtn}>Đăng nhập</Link>
                <Link to="/register" className={s.regBtn}>Đăng ký</Link>
              </div>
            )}
            <button className={s.burger} onClick={() => setMenu(!menu)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>
      <div className={s.spacer} />
      <Outlet />
    </>
  )
}