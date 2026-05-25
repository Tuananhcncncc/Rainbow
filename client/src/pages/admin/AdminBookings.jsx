import { useState, useEffect } from 'react'
import { bookingService } from '../../services/movieService'
import { formatCurrency, formatDateShort, getStatusLabel, getStatusColor } from '../../utils/format'
import s from './AdminTable.module.css'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    bookingService.getAll({}).then(r => setBookings(r.data.data)).finally(() => setLoading(false))
  }, [])

  const filtered = bookings.filter(b =>
    !filter || b.status === filter ||
    b.full_name?.toLowerCase().includes(filter.toLowerCase()) ||
    b.booking_code?.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Quản Lý Đặt Vé</h1>
        <input className={s.searchInput} placeholder="Tìm mã vé, tên khách..." value={filter} onChange={e => setFilter(e.target.value)} />
      </div>
      {loading ? <div className="spinner" /> : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>Mã vé</th><th>Khách hàng</th><th>Phim</th><th>Suất chiếu</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td><span className={s.code}>{b.booking_code}</span></td>
                  <td><div>{b.full_name}</div><div className={s.email}>{b.email}</div></td>
                  <td>{b.title}</td>
                  <td>{formatDateShort(b.show_date)} {b.start_time?.slice(0,5)}</td>
                  <td><b>{formatCurrency(b.total_amount)}</b></td>
                  <td><span style={{ color:getStatusColor(b.status),background:`${getStatusColor(b.status)}18`,padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:700 }}>{getStatusLabel(b.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}