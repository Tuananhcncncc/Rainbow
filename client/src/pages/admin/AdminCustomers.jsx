import { useState, useEffect } from 'react'
import { adminService } from '../../services/movieService'
import { formatCurrency, formatDateShort } from '../../utils/format'
import toast from 'react-hot-toast'
import s from './AdminTable.module.css'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = () => adminService.getCustomers().then(r => setCustomers(r.data.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const toggle = async (id) => {
    await adminService.toggleCustomer(id)
    toast.success('Đã cập nhật')
    load()
  }

  const filtered = customers.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Khách Hàng</h1>
        <input className={s.searchInput} placeholder="Tìm theo tên, email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading ? <div className="spinner" /> : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>Khách hàng</th><th>Điện thoại</th><th>Đơn đã đặt</th><th>Tổng chi tiêu</th><th>Ngày đăng ký</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><div className={s.customerName}>{c.full_name}</div><div className={s.email}>{c.email}</div></td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.total_bookings}</td>
                  <td>{formatCurrency(c.total_spent)}</td>
                  <td>{formatDateShort(c.created_at)}</td>
                  <td><span style={{ color:c.is_active?'#16a34a':'#dc2626',background:c.is_active?'#dcfce7':'#fee2e2',padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:700 }}>{c.is_active?'Hoạt động':'Bị khoá'}</span></td>
                  <td><button className={c.is_active ? s.delBtn : s.editBtn} onClick={() => toggle(c.id)}>{c.is_active ? 'Khoá' : 'Mở khoá'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}