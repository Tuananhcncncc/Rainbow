import { useState, useEffect } from 'react'
import { adminService } from '../../services/movieService'
import { formatCurrency, formatTime } from '../../utils/format'
import s from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getDashboard()
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" />

  const { today, chart, topMovies, recent, schedule } = data
  const maxRev = Math.max(...chart.map(c => Number(c.revenue)), 1)

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Dashboard</h1>
        <span className={s.date}>
          {new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </span>
      </div>

      {/* Stats — chỉ 2 card, bỏ "Đã huỷ" */}
      <div className={s.statsGrid}>
        <div className={s.statCard} style={{ borderTopColor: '#ff4d6d' }}>
          <div className={s.statIcon}>💰</div>
          <div className={s.statValue}>{formatCurrency(today.revenue)}</div>
          <div className={s.statLabel}>Doanh thu hôm nay</div>
        </div>
        <div className={s.statCard} style={{ borderTopColor: '#4cc9f0' }}>
          <div className={s.statIcon}>🎟</div>
          <div className={s.statValue}>{today.total_bookings}</div>
          <div className={s.statLabel}>Vé đã bán hôm nay</div>
        </div>
      </div>

      <div className={s.mainGrid}>
        {/* Biểu đồ doanh thu 7 ngày */}
        <div className={s.card}>
          <h2 className={s.cardTitle}>📈 Doanh thu 7 ngày</h2>
          <div className={s.chart}>
            {chart.map((c, i) => (
              <div key={i} className={s.bar}>
                <div
                  className={s.barFill}
                  style={{ height: `${(Number(c.revenue) / maxRev) * 100}%` }}
                />
                <span className={s.barLabel}>
                  {new Date(c.day).toLocaleDateString('vi-VN', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: '#9999b8' }}>
            Tổng 7 ngày:{' '}
            <b style={{ color: '#0a0a0f' }}>
              {formatCurrency(chart.reduce((s, c) => s + Number(c.revenue), 0))}
            </b>
          </div>
        </div>

        {/* Top phim */}
        <div className={s.card}>
          <h2 className={s.cardTitle}>🏆 Phim hot nhất</h2>
          <div className={s.topList}>
            {topMovies.map((m, i) => (
              <div key={i} className={s.topItem}>
                <span
                  className={s.topRank}
                  style={{
                    color: i === 0 ? '#ffd60a' : i === 1 ? '#c0c0c0' : '#cd7f32'
                  }}
                >
                  #{i + 1}
                </span>
                <div className={s.topInfo}>
                  <div className={s.topName}>{m.title}</div>
                  <div className={s.topMeta}>{m.tickets} vé</div>
                </div>
                <b className={s.topRev}>{formatCurrency(m.revenue)}</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={s.bottomGrid}>
        {/* Đặt vé gần đây */}
        <div className={s.card}>
          <h2 className={s.cardTitle}>🕐 Đặt vé gần đây</h2>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Phim</th>
                <th>Tiền</th>
                <th>TT</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i) => (
                <tr key={i}>
                  <td>{r.full_name}</td>
                  <td className={s.truncate}>{r.title}</td>
                  <td>{formatCurrency(r.total_amount)}</td>
                  <td>
                    <span className={s.stBadge} data-s={r.status}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lịch chiếu hôm nay */}
        <div className={s.card}>
          <h2 className={s.cardTitle}>📅 Lịch chiếu hôm nay</h2>
          {schedule.length === 0 ? (
            <div style={{ textAlign:'center', padding:'24px', color:'#9999b8', fontSize:14 }}>
              Không có suất chiếu hôm nay
            </div>
          ) : (
            <div className={s.schedList}>
              {schedule.map((sc, i) => {
                const pct = sc.total_seats > 0
                  ? Math.round((sc.booked / sc.total_seats) * 100)
                  : 0
                return (
                  <div key={i} className={s.schedItem}>
                    <div className={s.schedTime}>{formatTime(sc.start_time)}</div>
                    <div className={s.schedInfo}>
                      <div className={s.schedName}>
                        {sc.title} — {sc.room_name}
                      </div>
                      <div className={s.schedBar}>
                        <div className={s.schedFill} style={{ width: `${pct}%` }} />
                      </div>
                      <div className={s.schedMeta}>
                        {sc.booked}/{sc.total_seats} ghế ({pct}%) — {sc.district}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}