import { useState, useEffect } from 'react'
import { showtimeService, movieService, cinemaService } from '../../services/movieService'
import { formatTime } from '../../utils/format'
import toast from 'react-hot-toast'
import s from './AdminTable.module.css'

export default function AdminShowtimes() {
  const [showtimes, setShowtimes] = useState([])
  const [movies, setMovies] = useState([])
  const [cinemas, setCinemas] = useState([])
  const [rooms, setRooms] = useState([])
  const [selectedCinema, setSelectedCinema] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    movie_id: '', room_id: '', show_date: '',
    start_time: '', end_time: '',
    format: '2D', language_type: 'long tieng',
    price_regular: 75000, price_vip: 100000
  })

  // Load cinemas và movies lúc đầu
  useEffect(() => {
    movieService.getAll({ status: 'now_showing' }).then(r => setMovies(r.data.data))
    cinemaService.getAll().then(r => {
      const list = r.data.data
      setCinemas(list)
      if (list.length) {
        setSelectedCinema(String(list[0].id))
        loadRooms(list[0].id)
        loadShowtimes(list[0].id, selectedDate)
      }
    })
  }, [])

  const loadShowtimes = async (cinemaId, date) => {
    if (!cinemaId) return
    setLoading(true)
    try {
      const r = await showtimeService.getByCinema(cinemaId, date)
      setShowtimes(r.data.data)
    } catch {
      setShowtimes([])
    } finally {
      setLoading(false)
    }
  }

  const loadRooms = async (cinemaId) => {
    try {
      const r = await cinemaService.getById(cinemaId)
      // API trả về array rows, lọc lấy room info
      const data = r.data.data
      const roomList = []
      const seen = new Set()
      for (const row of data) {
        if (row.room_id && !seen.has(row.room_id)) {
          seen.add(row.room_id)
          roomList.push({ id: row.room_id, name: row.room_name })
        }
      }
      setRooms(roomList)
    } catch (e) {
      setRooms([])
    }
  }

  const handleCinemaChange = (val) => {
    setSelectedCinema(val)
    loadRooms(val)
    loadShowtimes(val, selectedDate)
  }

  const handleDateChange = (val) => {
    setSelectedDate(val)
    loadShowtimes(selectedCinema, val)
  }

  const openForm = () => {
    setForm({
      movie_id: movies[0]?.id || '',
      room_id: rooms[0]?.id || '',
      show_date: selectedDate,
      start_time: '', end_time: '',
      format: '2D', language_type: 'long tieng',
      price_regular: 75000, price_vip: 100000
    })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.movie_id || !form.room_id || !form.show_date || !form.start_time || !form.end_time) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    try {
      await showtimeService.create(form)
      toast.success('Đã tạo suất chiếu!')
      setShowForm(false)
      loadShowtimes(selectedCinema, selectedDate)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi tạo suất chiếu')
    }
  }

  const remove = async (stId) => {
    if (!confirm('Xoá suất chiếu này?')) return
    try {
      await showtimeService.remove(stId)
      toast.success('Đã xoá')
      loadShowtimes(selectedCinema, selectedDate)
    } catch {
      toast.error('Không thể xoá suất chiếu đã có vé đặt')
    }
  }

  // Tạo danh sách ngày 30 ngày
  const dateOptions = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i - 7) // từ 7 ngày trước đến 23 ngày sau
    return d.toISOString().split('T')[0]
  })

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Quản Lý Lịch Chiếu</h1>
        <button className={s.addBtn} onClick={openForm}>+ Thêm suất chiếu</button>
      </div>

      {/* Filter bar */}
      <div className={s.filterRow}>
        <select
          value={selectedCinema}
          onChange={e => handleCinemaChange(e.target.value)}
          className={s.select}
        >
          {cinemas.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={selectedDate}
          onChange={e => handleDateChange(e.target.value)}
          className={s.select}
        >
          {dateOptions.map(d => (
            <option key={d} value={d}>
              {new Date(d).toLocaleDateString('vi-VN', { weekday:'short', day:'2-digit', month:'2-digit', year:'numeric' })}
            </option>
          ))}
        </select>

        <button
          className={s.editBtn}
          onClick={() => loadShowtimes(selectedCinema, selectedDate)}
        >
          🔄 Tải lại
        </button>
      </div>

      {/* Table */}
      {loading ? <div className="spinner" /> : (
        <div className={s.tableWrap}>
          {showtimes.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px', color:'#9999b8' }}>
              Không có suất chiếu nào ngày này.<br />
              <small>Hãy chọn ngày khác hoặc thêm suất chiếu mới.</small>
            </div>
          ) : (
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Phim</th>
                  <th>Phòng</th>
                  <th>Ngày</th>
                  <th>Giờ</th>
                  <th>Định dạng</th>
                  <th>Giá thường</th>
                  <th>Giá VIP</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {showtimes.map(st => (
                  <tr key={st.id}>
                    <td>{st.title}</td>
                    <td>{st.room_name}</td>
                    <td>{new Date(st.show_date).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <b>{formatTime(st.start_time)}</b>
                      {' — '}
                      {formatTime(st.end_time)}
                    </td>
                    <td>
                      <span style={{
                        padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700,
                        background: st.format === '3D' ? '#dbeafe' : '#f0f0f8',
                        color: st.format === '3D' ? '#1d4ed8' : '#6b6b8a'
                      }}>
                        {st.format}
                      </span>
                      {' '}{st.language_type}
                    </td>
                    <td>{Number(st.price_regular).toLocaleString('vi-VN')}đ</td>
                    <td>{Number(st.price_vip).toLocaleString('vi-VN')}đ</td>
                    <td>
                      <button className={s.delBtn} onClick={() => remove(st.id)}>Xoá</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Form thêm suất chiếu */}
      {showForm && (
        <div className={s.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <h2>Thêm Suất Chiếu</h2>
            <div className={s.formGrid}>
              <div className={s.field} style={{ gridColumn:'1/-1' }}>
                <label>Phim *</label>
                <select value={form.movie_id} onChange={e => setForm({ ...form, movie_id: e.target.value })}>
                  <option value="">-- Chọn phim --</option>
                  {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div className={s.field}>
                <label>Phòng chiếu *</label>
                <select value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })}>
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className={s.field}>
                <label>Ngày chiếu *</label>
                <input
                  type="date"
                  value={form.show_date}
                  onChange={e => setForm({ ...form, show_date: e.target.value })}
                />
              </div>
              <div className={s.field}>
                <label>Giờ bắt đầu *</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={e => setForm({ ...form, start_time: e.target.value })}
                />
              </div>
              <div className={s.field}>
                <label>Giờ kết thúc *</label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={e => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
              <div className={s.field}>
                <label>Định dạng</label>
                <select value={form.format} onChange={e => setForm({ ...form, format: e.target.value })}>
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="IMAX">IMAX</option>
                </select>
              </div>
              <div className={s.field}>
                <label>Ngôn ngữ</label>
                <select value={form.language_type} onChange={e => setForm({ ...form, language_type: e.target.value })}>
                  <option value="long tieng">Lồng tiếng</option>
                  <option value="phu de">Phụ đề</option>
                  <option value="goc">Bản gốc</option>
                </select>
              </div>
              <div className={s.field}>
                <label>Giá ghế thường (đ)</label>
                <input
                  type="number"
                  value={form.price_regular}
                  onChange={e => setForm({ ...form, price_regular: Number(e.target.value) })}
                />
              </div>
              <div className={s.field}>
                <label>Giá ghế VIP (đ)</label>
                <input
                  type="number"
                  value={form.price_vip}
                  onChange={e => setForm({ ...form, price_vip: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className={s.modalBtns}>
              <button className={s.saveBtn} onClick={save}>💾 Lưu suất chiếu</button>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Huỷ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}