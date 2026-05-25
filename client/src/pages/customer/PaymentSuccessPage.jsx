import { useLocation, useNavigate } from 'react-router-dom'
import s from './PaymentSuccessPage.module.css'

export default function PaymentSuccessPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const code = state?.booking_code || '—'

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.icon}>🎉</div>
        <h1 className={s.title}>Thanh Toán Thành Công!</h1>
        <p className={s.sub}>Cảm ơn bạn đã đặt vé tại Rainbow Cinemas</p>
        <div className={s.codeBox}>
          <span>Mã đặt vé của bạn</span>
          <b>{code}</b>
        </div>
        <p className={s.note}>Vui lòng xuất trình mã QR khi vào rạp</p>
        <div className={s.btns}>
          <button className={s.primaryBtn} onClick={() => navigate('/my-tickets')}>Xem vé của tôi</button>
          <button className={s.secondaryBtn} onClick={() => navigate('/')}>Về trang chủ</button>
        </div>
      </div>
    </div>
  )
}