export const formatCurrency = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

export const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('vi-VN', { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric' })
  : ''

export const formatDateShort = (d) => d
  ? new Date(d).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' })
  : ''

// FIX CHÍNH: SQL Server TIME có thể là object {hours, minutes} hoặc string hoặc Date
export const formatTime = (t) => {
  if (!t) return ''

  // Dạng object từ mssql: { hours: 10, minutes: 0, seconds: 0, ... }
  if (typeof t === 'object' && !( t instanceof Date) && t.hours !== undefined) {
    const h = String(t.hours).padStart(2, '0')
    const m = String(t.minutes).padStart(2, '0')
    return `${h}:${m}`
  }

  // Dạng Date object (1970-01-01T10:00:00)
  if (t instanceof Date) {
    const h = String(t.getUTCHours()).padStart(2, '0')
    const m = String(t.getUTCMinutes()).padStart(2, '0')
    return `${h}:${m}`
  }

  // Dạng string "10:00:00" hoặc "10:00"
  if (typeof t === 'string') {
    // ISO string có chứa T (1970-01-01T10:00:00.000Z)
    if (t.includes('T')) {
      const date = new Date(t)
      const h = String(date.getUTCHours()).padStart(2, '0')
      const m = String(date.getUTCMinutes()).padStart(2, '0')
      return `${h}:${m}`
    }
    return t.slice(0, 5)
  }

  return String(t).slice(0, 5)
}

export const getRatingColor = (r) =>
  ({ P:'#22c55e', K:'#3b82f6', T13:'#f59e0b', T16:'#f97316', T18:'#ef4444' })[r] || '#6b7280'

export const getStatusLabel = (s) =>
  ({ pending:'Chờ thanh toán', confirmed:'Đã xác nhận', cancelled:'Đã huỷ', refunded:'Đã hoàn tiền' })[s] || s

export const getStatusColor = (s) =>
  ({ pending:'#f59e0b', confirmed:'#22c55e', cancelled:'#ef4444', refunded:'#6b7280' })[s] || '#6b7280'

export const getNext7Days = () => Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  return {
    value: d.toISOString().split('T')[0],
    label: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai'
      : d.toLocaleDateString('vi-VN', { weekday:'short', day:'2-digit', month:'2-digit' })
  }
})