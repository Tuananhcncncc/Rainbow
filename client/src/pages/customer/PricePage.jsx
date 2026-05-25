import { formatCurrency } from '../../utils/format'
import s from './PricePage.module.css'

const prices = [
  { type: 'Ghế Thường — 2D', regular: 75000, note: 'Hàng A, B, C, G, H, I, J' },
  { type: 'Ghế VIP — 2D', regular: 100000, note: 'Hàng D, E, F (giữa phòng)' },
  { type: 'Ghế Thường — 3D', regular: 90000, note: 'Hàng A, B, E, F, G' },
  { type: 'Ghế VIP — 3D', regular: 120000, note: 'Hàng C, D' },
]

const comboPrices = [
  { name: 'Combo Đơn', desc: '1 Bắp vừa + 1 Pepsi', price: 79000 },
  { name: 'Combo Đôi', desc: '2 Bắp vừa + 2 Pepsi', price: 149000 },
  { name: 'Combo Gia Đình', desc: '2 Bắp lớn + 4 Pepsi + 2 Snack', price: 245000 },
  { name: 'Combo Sweet', desc: '1 Bắp lớn + 2 Pepsi', price: 129000 },
]

export default function PricePage() {
  return (
    <div className={s.page}>
      <div className="page-container">
        <h1 className={s.title}>Giá Vé</h1>
        <p className={s.sub}>Giá vé áp dụng tại tất cả cụm rạp Rainbow Cinemas Hà Nội</p>

        <h2 className={s.sectionTitle}>🎟 Giá vé theo loại ghế</h2>
        <div className={s.grid}>
          {prices.map((p, i) => (
            <div key={i} className={s.priceCard}>
              <div className={s.priceType}>{p.type}</div>
              <div className={s.priceAmount}>{formatCurrency(p.regular)}</div>
              <div className={s.priceNote}>{p.note}</div>
            </div>
          ))}
        </div>

        <h2 className={s.sectionTitle}>🍿 Giá Combo bắp nước</h2>
        <div className={s.comboGrid}>
          {comboPrices.map((c, i) => (
            <div key={i} className={s.comboCard}>
              <div className={s.comboIcon}>🍿</div>
              <div className={s.comboName}>{c.name}</div>
              <div className={s.comboDesc}>{c.desc}</div>
              <div className={s.comboPrice}>{formatCurrency(c.price)}</div>
            </div>
          ))}
        </div>

        <div className={s.note}>
          <b>Lưu ý:</b> Giá vé buổi tối (sau 18:00) và cuối tuần có thể cao hơn 10.000đ–15.000đ.
          Giá trên là giá tham khảo, giá chính thức hiển thị khi chọn suất chiếu.
        </div>
      </div>
    </div>
  )
}