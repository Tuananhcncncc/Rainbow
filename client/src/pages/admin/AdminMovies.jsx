import { useState, useEffect } from 'react'
import { movieService } from '../../services/movieService'
import { formatDateShort } from '../../utils/format'
import toast from 'react-hot-toast'
import s from './AdminTable.module.css'
import ts from './AdminMoviesTMDB.module.css'

export default function AdminMovies() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  // TMDB states
  const [tmdbQuery, setTmdbQuery] = useState('')
  const [tmdbResults, setTmdbResults] = useState([])
  const [tmdbLoading, setTmdbLoading] = useState(false)
  const [tmdbStep, setTmdbStep] = useState('search') // 'search' | 'manual'

  const [form, setForm] = useState({
    title: '', title_en: '', description: '', duration: 90,
    genre: '', director: '', cast_members: '', rating: 'P',
    poster_url: '', trailer_url: '', release_date: '',
    status: 'now_showing', tmdb_id: null
  })

  const load = () => {
    movieService.getAll({}).then(r => setMovies(r.data.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({
      title:'', title_en:'', description:'', duration:90,
      genre:'', director:'', cast_members:'', rating:'P',
      poster_url:'', trailer_url:'', release_date:'',
      status:'now_showing', tmdb_id: null
    })
    setTmdbQuery('')
    setTmdbResults([])
    setTmdbStep('search')
    setShowForm(true)
  }

  const openEdit = (m) => {
    setEditing(m)
    setForm({
      ...m,
      release_date: m.release_date?.split('T')[0] || ''
    })
    setTmdbStep('manual')
    setShowForm(true)
  }

  // Tim phim tren TMDB
  const handleTmdbSearch = async () => {
    if (!tmdbQuery.trim()) return
    setTmdbLoading(true)
    try {
      const res = await movieService.tmdbSearch(tmdbQuery)
      setTmdbResults(res.data.data || [])
      if (!res.data.data?.length) toast.error('Không tìm thấy phim trên TMDB')
    } catch {
      toast.error('Lỗi kết nối TMDB. Kiểm tra TMDB_TOKEN trong .env')
    } finally {
      setTmdbLoading(false)
    }
  }

  // Chon phim tu ket qua TMDB -> lay chi tiet
  const handleSelectTmdb = async (tmdbId) => {
    setTmdbLoading(true)
    try {
      const res = await movieService.tmdbDetail(tmdbId)
      const data = res.data.data
      setForm(prev => ({
        ...prev,
        title:        data.title        || prev.title,
        title_en:     data.title_en     || prev.title_en,
        description:  data.description  || prev.description,
        duration:     data.duration     || prev.duration,
        genre:        data.genre        || prev.genre,
        director:     data.director     || prev.director,
        cast_members: data.cast_members || prev.cast_members,
        poster_url:   data.poster_url   || prev.poster_url,
        trailer_url:  data.trailer_url  || prev.trailer_url,
        release_date: data.release_date || prev.release_date,
        rating:       data.rating       || prev.rating,
        tmdb_id:      data.tmdb_id,
      }))
      setTmdbStep('manual')
      setTmdbResults([])
      toast.success('Đã điền thông tin từ TMDB! Kiểm tra lại trước khi lưu.')
    } catch {
      toast.error('Không lấy được chi tiết phim từ TMDB')
    } finally {
      setTmdbLoading(false)
    }
  }

  const save = async () => {
    if (!form.title || !form.duration || !form.genre || !form.release_date) {
      toast.error('Vui lòng điền đủ: Tên phim, Thể loại, Thời lượng, Ngày chiếu')
      return
    }
    try {
      if (editing) {
        await movieService.update(editing.id, form)
        toast.success('Đã cập nhật phim')
      } else {
        await movieService.create(form)
        toast.success('Đã thêm phim mới')
      }
      setShowForm(false)
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi lưu phim')
    }
  }

  const remove = async (id) => {
    if (!confirm('Xác nhận xoá phim này?')) return
    try {
      await movieService.remove(id)
      toast.success('Đã xoá phim')
      load()
    } catch {
      toast.error('Không thể xoá phim đang có lịch chiếu')
    }
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Quản Lý Phim</h1>
        <button className={s.addBtn} onClick={openAdd}>+ Thêm phim</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Phim</th>
                <th>Thể loại</th>
                <th>Thời lượng</th>
                <th>Rating</th>
                <th>Ngày chiếu</th>
                <th>Trạng thái</th>
                <th>TMDB</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(m => (
                <tr key={m.id}>
                  <td>
                    <div className={s.movieCell}>
                      <img
                        src={m.poster_url || `https://picsum.photos/seed/${m.id}/40/60`}
                        alt={m.title}
                        onError={e => { e.target.src = `https://picsum.photos/seed/${m.id}/40/60` }}
                      />
                      <div>
                        <div>{m.title}</div>
                        {m.title_en && <div style={{ fontSize:11, color:'#9999b8' }}>{m.title_en}</div>}
                      </div>
                    </div>
                  </td>
                  <td>{m.genre}</td>
                  <td>{m.duration} phút</td>
                  <td><span className={s.rBadge}>{m.rating}</span></td>
                  <td>{formatDateShort(m.release_date)}</td>
                  <td>
                    <span className={s.sBadge} data-s={m.status}>
                      {m.status === 'now_showing' ? 'Đang chiếu'
                        : m.status === 'coming_soon' ? 'Sắp chiếu'
                        : 'Kết thúc'}
                    </span>
                  </td>
                  <td>
                    {m.tmdb_id
                      ? <a href={`https://www.themoviedb.org/movie/${m.tmdb_id}`}
                           target="_blank" rel="noreferrer"
                           style={{ color:'#7b2fff', fontSize:12 }}>
                          🎬 #{m.tmdb_id}
                        </a>
                      : <span style={{ color:'#d1d5db', fontSize:11 }}>—</span>
                    }
                  </td>
                  <td>
                    <button className={s.editBtn} onClick={() => openEdit(m)}>Sửa</button>
                    <button className={s.delBtn} onClick={() => remove(m.id)}>Xoá</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div className={s.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={s.modal} style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Sửa phim' : 'Thêm phim mới'}</h2>

            {/* TMDB Search — chỉ hiện khi thêm mới */}
            {!editing && (
              <div className={ts.tmdbBox}>
                <div className={ts.tmdbTitle}>
                  <span>🎬</span>
                  <span>Tìm nhanh từ TMDB</span>
                  <button
                    className={ts.skipBtn}
                    onClick={() => setTmdbStep('manual')}
                  >
                    Nhập tay →
                  </button>
                </div>

                {tmdbStep === 'search' && (
                  <>
                    <div className={ts.searchRow}>
                      <input
                        placeholder="Nhập tên phim (tiếng Anh hoặc tiếng Việt)..."
                        value={tmdbQuery}
                        onChange={e => setTmdbQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleTmdbSearch()}
                        className={ts.searchInput}
                      />
                      <button
                        onClick={handleTmdbSearch}
                        disabled={tmdbLoading}
                        className={ts.searchBtn}
                      >
                        {tmdbLoading ? '⏳' : '🔍 Tìm'}
                      </button>
                    </div>

                    {tmdbResults.length > 0 && (
                      <div className={ts.results}>
                        {tmdbResults.map(m => (
                          <div
                            key={m.tmdb_id}
                            className={ts.resultItem}
                            onClick={() => handleSelectTmdb(m.tmdb_id)}
                          >
                            <img
                              src={m.poster_url || 'https://via.placeholder.com/50x75'}
                              alt={m.title}
                              className={ts.resultPoster}
                              onError={e => { e.target.src = 'https://via.placeholder.com/50x75' }}
                            />
                            <div className={ts.resultInfo}>
                              <div className={ts.resultTitle}>{m.title}</div>
                              <div className={ts.resultMeta}>
                                {m.title_en !== m.title && <span>{m.title_en}</span>}
                                <span>📅 {m.release_date?.slice(0, 4)}</span>
                                <span>⭐ {m.vote?.toFixed(1)}</span>
                              </div>
                            </div>
                            <span className={ts.selectHint}>Chọn →</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {tmdbStep === 'manual' && form.tmdb_id && (
                  <div className={ts.tmdbSelected}>
                    ✅ Đã chọn phim từ TMDB #{form.tmdb_id} — {form.title_en}
                    <button onClick={() => { setTmdbStep('search'); setTmdbResults([]) }} className={ts.reSearchBtn}>
                      Tìm lại
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Form nhập thông tin */}
            {(tmdbStep === 'manual' || editing) && (
              <div className={s.formGrid}>
                <div className={s.field} style={{ gridColumn:'1/-1' }}>
                  <label>Tên phim * (tiếng Việt)</label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="VD: Địa Đạo: Mặt Trời Trong Bóng Tối"
                  />
                </div>
                <div className={s.field}>
                  <label>Tên tiếng Anh</label>
                  <input
                    value={form.title_en || ''}
                    onChange={e => setForm({ ...form, title_en: e.target.value })}
                  />
                </div>
                <div className={s.field}>
                  <label>Thể loại *</label>
                  <input
                    value={form.genre}
                    onChange={e => setForm({ ...form, genre: e.target.value })}
                    placeholder="VD: Hành động, Kinh dị"
                  />
                </div>
                <div className={s.field}>
                  <label>Đạo diễn</label>
                  <input
                    value={form.director || ''}
                    onChange={e => setForm({ ...form, director: e.target.value })}
                  />
                </div>
                <div className={s.field}>
                  <label>Diễn viên</label>
                  <input
                    value={form.cast_members || ''}
                    onChange={e => setForm({ ...form, cast_members: e.target.value })}
                  />
                </div>
                <div className={s.field}>
                  <label>Thời lượng (phút) *</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                  />
                </div>
                <div className={s.field}>
                  <label>Ngày chiếu *</label>
                  <input
                    type="date"
                    value={form.release_date}
                    onChange={e => setForm({ ...form, release_date: e.target.value })}
                  />
                </div>
                <div className={s.field}>
                  <label>Rating *</label>
                  <select value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })}>
                    <option value="P">P — Mọi lứa tuổi</option>
                    <option value="K">K — Dưới 13 có phụ huynh</option>
                    <option value="T13">T13 — Trên 13 tuổi</option>
                    <option value="T16">T16 — Trên 16 tuổi</option>
                    <option value="T18">T18 — Trên 18 tuổi</option>
                  </select>
                </div>
                <div className={s.field}>
                  <label>Trạng thái</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="coming_soon">Sắp chiếu</option>
                    <option value="now_showing">Đang chiếu</option>
                    <option value="ended">Kết thúc</option>
                  </select>
                </div>
                <div className={s.field} style={{ gridColumn:'1/-1' }}>
                  <label>Link Poster (URL ảnh)</label>
                  <input
                    value={form.poster_url || ''}
                    onChange={e => setForm({ ...form, poster_url: e.target.value })}
                    placeholder="https://image.tmdb.org/t/p/w500/..."
                  />
                  {form.poster_url && (
                    <img
                      src={form.poster_url}
                      alt="preview"
                      style={{ marginTop:8, height:80, borderRadius:6, objectFit:'cover' }}
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  )}
                </div>
                <div className={s.field} style={{ gridColumn:'1/-1' }}>
                  <label>Link Trailer (YouTube embed)</label>
                  <input
                    value={form.trailer_url || ''}
                    onChange={e => setForm({ ...form, trailer_url: e.target.value })}
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  />
                </div>
                <div className={s.field} style={{ gridColumn:'1/-1' }}>
                  <label>Mô tả</label>
                  <textarea
                    rows={3}
                    value={form.description || ''}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    style={{ padding:'10px 14px', border:'1.5px solid #e8e8f4', borderRadius:8, fontFamily:'Nunito,sans-serif', fontSize:14, resize:'vertical' }}
                  />
                </div>
              </div>
            )}

            <div className={s.modalBtns} style={{ marginTop: 20 }}>
              <button className={s.saveBtn} onClick={save}>
                💾 {editing ? 'Cập nhật' : 'Lưu phim'}
              </button>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Huỷ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}