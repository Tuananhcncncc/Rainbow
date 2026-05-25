import { create } from 'zustand'

export const useBookingStore = create((set, get) => ({
  showtime: null,
  selectedSeats: [],
  selectedCombos: [],
  totalAmount: 0,

  setShowtime: (st) => set({ showtime: st, selectedSeats: [], selectedCombos: [], totalAmount: 0 }),

  toggleSeat: (seat) => {
    const { selectedSeats, showtime } = get()
    const exists = selectedSeats.find(s => s.id === seat.id)
    const newSeats = exists
      ? selectedSeats.filter(s => s.id !== seat.id)
      : selectedSeats.length >= 8 ? selectedSeats : [...selectedSeats, seat]
    set({ selectedSeats: newSeats })
    get()._recalc(newSeats, get().selectedCombos, showtime)
  },

  setCombo: (combo, qty) => {
    const { selectedCombos, showtime, selectedSeats } = get()
    let newCombos
    if (qty === 0) newCombos = selectedCombos.filter(c => c.id !== combo.id)
    else if (selectedCombos.find(c => c.id === combo.id))
      newCombos = selectedCombos.map(c => c.id === combo.id ? { ...c, quantity: qty } : c)
    else newCombos = [...selectedCombos, { ...combo, quantity: qty }]
    set({ selectedCombos: newCombos })
    get()._recalc(selectedSeats, newCombos, showtime)
  },

  _recalc: (seats, combos, st) => {
    if (!st) return
    const seatTotal = seats.reduce((s, seat) =>
      s + (seat.seat_type === 'vip' ? Number(st.price_vip) : Number(st.price_regular)), 0)
    const comboTotal = combos.reduce((s, c) => s + c.price * c.quantity, 0)
    set({ totalAmount: seatTotal + comboTotal })
  },

  clear: () => set({ showtime: null, selectedSeats: [], selectedCombos: [], totalAmount: 0 }),
}))