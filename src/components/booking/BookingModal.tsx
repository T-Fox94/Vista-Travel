"use client"

import React, { useState, useRef } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/store/auth-store"
import { useVistaStore } from "@/store/vista-store"
import {
  CheckCircle,
  Ticket,
  CreditCard,
  Printer,
  Download,
  Mail,
  ArrowLeft,
  ArrowRight,
  Loader2,
  MapPin,
  Calendar,
  Users,
  Car,
  Shield,
} from "lucide-react"

type BookingType = "FLIGHT" | "TOUR"
type Step = "form" | "tour_dates" | "transport" | "accommodation" | "add_ons" | "summary" | "payment" | "receipt"

export default function BookingModal({
  type = "FLIGHT",
  trigger,
  initialData,
}: {
  type?: BookingType
  trigger?: React.ReactNode
  initialData?: Record<string, any>
}) {
  const { toast } = useToast()
  const user = useAuthStore((s) => s.user)
  const receiptRef = useRef<HTMLDivElement>(null)

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("form")
  const [bookingResult, setBookingResult] = useState<{ bookingId: string; ticketId?: string } | null>(null)
  const [ticketNumber, setTicketNumber] = useState<string>("")

  // Form fields
  const [passengerName, setPassengerName] = useState("")
  const [phone, setPhone] = useState("")
  const [adults, setAdults] = useState<number>(1)
  const [children, setChildren] = useState<number>(0)
  const [idType, setIdType] = useState("Passport")
  const [idNumber, setIdNumber] = useState("")
  const [transportType, setTransportType] = useState("None")
  const [date, setDate] = useState("")
  const [flightClass, setFlightClass] = useState("Economy")
  const [roomType, setRoomType] = useState(initialData?.roomType || "Double Standard")
  
  // New Tour Package Fields
  const [selectedTransport, setSelectedTransport] = useState<{ label: string; price: number } | null>(null)
  const [selectedAccommodation, setSelectedAccommodation] = useState<{ label: string; priceAdjustment: number } | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<{ label: string; price: number }[]>([])
  const [selectedTourDate, setSelectedTourDate] = useState<string>("")

  // Pricing
  const [voucherCode, setVoucherCode] = useState("")
  const [voucherValidation, setVoucherValidation] = useState<any | null>(null)
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [subtotal, setSubtotal] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile">("card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const currency = useVistaStore((s) => s.currency)
  const setCurrency = useVistaStore((s) => s.setCurrency)
  const convertFromUSD = useVistaStore((s) => s.convertFromUSD)
  const convertToUSD = useVistaStore((s) => s.convertToUSD)

  const transportPrices: Record<string, number> = { None: 0, Road: 50, Flight: 150 }
  const currencySymbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", ZMW: "ZK" }
  const sym = currencySymbols[currency] || "$"

  // --- Pricing calculation ---
  React.useEffect(() => {
    if (type === "FLIGHT") {
      const base = Number(initialData?.basePrice || 0)
      const sub = base * adults + base * children * 0.7
      setSubtotal(sub)
      const disc = voucherValidation
        ? voucherValidation.discountType === "percentage"
          ? Math.min(sub * (voucherValidation.discountValue / 100), voucherValidation.maxDiscount || Infinity)
          : voucherValidation.discountValue
        : 0
      setDiscountAmount(disc)
      setTotal(Math.max(0, sub - disc))
    } else {
      // TOUR PRICING
      const adultBase = Number(initialData?.price || 0)
      const childBase = Number(initialData?.childPrice || adultBase * 0.7)
      
      const transportPrice = selectedTransport?.price || 0
      const roomPriceAdj = selectedAccommodation?.priceAdjustment || 0
      const addOnsPrice = selectedAddOns.reduce((acc, curr) => acc + curr.price, 0)
      
      const perAdult = adultBase + transportPrice + roomPriceAdj + addOnsPrice
      const perChild = childBase + transportPrice + roomPriceAdj + addOnsPrice
      
      const sub = (perAdult * adults) + (perChild * children)
      setSubtotal(sub)
      
      const disc = voucherValidation
        ? voucherValidation.discountType === "percentage"
          ? Math.min(sub * (voucherValidation.discountValue / 100), voucherValidation.maxDiscount || Infinity)
          : voucherValidation.discountValue
        : 0
      setDiscountAmount(disc)
      setTotal(Math.max(0, sub - disc))
    }
  }, [adults, children, selectedTransport, selectedAccommodation, selectedAddOns, voucherValidation, initialData])

  // --- Form submit → go to summary ---
  function handleFormNext(e: React.FormEvent) {
    e.preventDefault()
    if (!passengerName.trim()) {
      toast({ title: "Name required", description: "Please enter the passenger full name." })
      return
    }
    if (type === "TOUR" && !idNumber.trim()) {
      toast({ title: "ID required", description: "Please enter your ID number." })
      return
    }
    
    if (type === "TOUR") {
      setStep("tour_dates")
    } else {
      if (!date) {
        toast({ title: "Date required", description: "Please select a date." })
        return
      }
      setStep("summary")
    }
  }

  // --- Voucher validation ---
  async function validateVoucher() {
    if (!voucherCode.trim()) return
    try {
      const res = await fetch(`/api/vouchers/validate?code=${voucherCode}&type=${type}&amount=${subtotal}`)
      const data = await res.json()
      if (!data.success) {
        setVoucherValidation(null)
        setDiscountAmount(0)
        toast({ title: "Voucher invalid", description: data.error || "Voucher could not be applied." })
      } else {
        setVoucherValidation(data.voucher)
        setDiscountAmount(Number(data.voucher.discount || 0))
        toast({ title: "Voucher applied!", description: `${data.voucher.code} — saved ${sym}${data.voucher.discount}` })
      }
    } catch {
      toast({ title: "Voucher error", description: "Network error validating voucher." })
    }
  }

  // --- Payment → Create booking ---
  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      toast({ title: "Sign in required" })
      return
    }

    setLoading(true)
    const payload: Record<string, any> = {
      userId: user.id,
      type,
      passengerName,
      totalAmount: Math.round(convertToUSD(total)),
      voucherCode: voucherValidation?.code || null,
      adults,
      children,
      idType,
      idNumber,
      transportType,
    }

    if (type === "FLIGHT") {
      payload.passengers = adults + children
      payload.flightClass = flightClass
      payload.departureDate = date
      if (initialData?.flightId) payload.flightId = initialData.flightId
      if (initialData?.flightCode) payload.flightCode = initialData.flightCode
      if (initialData?.fromAirport) payload.fromAirport = initialData.fromAirport
      if (initialData?.toAirport) payload.toAirport = initialData.toAirport
      if (initialData?.fromCity) payload.fromCity = initialData.fromCity
      if (initialData?.toCity) payload.toCity = initialData.toCity
    } else {
      payload.guests = `${adults} Adults${children > 0 ? `, ${children} Children` : ""}`
      payload.tourDate = selectedTourDate || date
      payload.guestId = `${idType}: ${idNumber}`
      if (initialData?.id) payload.destinationId = initialData.id
      if (initialData?.hotelName) payload.hotelName = initialData.hotelName
      if (initialData?.duration) payload.duration = initialData.duration
      
      // Save full tour configuration
      payload.transport = selectedTransport?.label || "None"
      payload.accommodation = selectedAccommodation?.label || "Standard"
      payload.addOns = selectedAddOns.map(a => a.label).join(", ")
      payload.selectedTransport = selectedTransport
      payload.selectedAccommodation = selectedAccommodation
      payload.selectedAddOnsArr = selectedAddOns
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!data.success) {
        toast({ title: "Booking failed", description: data.error || "Unable to create booking." })
      } else {
        setBookingResult({ bookingId: data.booking.bookingId, ticketId: data.ticket?.id })
        setTicketNumber(data.ticket?.ticketNumber || data.booking.bookingId)
        // Simulate email sent
        setEmailSent(true)
        setStep("receipt")
      }
    } catch {
      toast({ title: "Error", description: "Network error while creating booking." })
    } finally {
      setLoading(false)
    }
  }

  // --- Print receipt ---
  function handlePrint() {
    if (!receiptRef.current) return
    const printWindow = window.open("", "_blank", "width=700,height=900")
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head>
          <title>Vista Ticket — ${bookingResult?.bookingId}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: system-ui, -apple-system, sans-serif; color: #1c1917; background: #fff; }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 300)
  }

  // --- Download receipt as text ---
  function handleDownload() {
    if (!bookingResult) return
    const content = [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "         VISTA TRAVEL — E-TICKET",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      `Ticket Number : ${ticketNumber}`,
      `Booking ID    : ${bookingResult.bookingId}`,
      `Passenger     : ${passengerName}`,
      `Date          : ${selectedTourDate || date}`,
      `Destination   : ${initialData?.title || initialData?.hotelName || "—"}`,
      `Guests        : ${adults} Adults${children > 0 ? `, ${children} Children` : ""}`,
      type === "TOUR" ? `Transport     : ${selectedTransport?.label || "Included"}` : `Class         : ${flightClass}`,
      type === "TOUR" ? `Stay          : ${selectedAccommodation?.label || "Standard"}` : "",
      type === "TOUR" && selectedAddOns.length > 0 ? `Add-ons       : ${selectedAddOns.map(a => a.label).join(", ")}` : "",
      `Total Paid    : ${sym}${convertFromUSD(total).toFixed(2)} (${currency})`,
      `Status        : CONFIRMED`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Thank you for booking with Vista!",
    ].filter(Boolean).join("\n")

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Vista-Ticket-${bookingResult.bookingId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // --- Reset all ---
  function resetModal() {
    setStep("form")
    setBookingResult(null)
    setTicketNumber("")
    setPassengerName("")
    setPhone("")
    setAdults(1)
    setChildren(0)
    setIdNumber("")
    setDate("")
    setVoucherCode("")
    setVoucherValidation(null)
    setCardNumber("")
    setCardExpiry("")
    setCardCvc("")
    setMobileNumber("")
    setEmailSent(false)
    setOpen(false)
  }

  // ─────────────────────────────────────────────────────────
  // STEP INDICATOR
  const steps: Step[] = type === "FLIGHT" 
    ? ["form", "summary", "payment", "receipt"]
    : ["form", "tour_dates", "transport", "accommodation", "add_ons", "summary", "payment", "receipt"]
  
  const stepLabels = type === "FLIGHT"
    ? ["Details", "Summary", "Payment", "Receipt"]
    : ["Details", "Dates", "Transport", "Stay", "Extras", "Summary", "Payment", "Receipt"]

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setStep("form") }}>
      <DialogTrigger asChild>
        <div onClick={(e) => e.stopPropagation()}>
          {trigger ?? <Button>Book {type === "FLIGHT" ? "Flight" : "Tour"}</Button>}
        </div>
      </DialogTrigger>

      <DialogContent
        className="max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress indicator — only show for steps 1-3 */}
        {step !== "receipt" && (
          <div className="flex items-center gap-1 mb-6 px-1 overflow-x-auto pb-2 scrollbar-hide">
            {steps.filter(s => s !== "receipt").map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 flex-shrink-0 ${step === s ? "text-emerald-600" : steps.indexOf(step) > i ? "text-emerald-400" : "text-gray-300"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${step === s ? "border-emerald-600 bg-emerald-600 text-white" : steps.indexOf(step) > i ? "border-emerald-400 bg-emerald-50 text-emerald-600" : "border-gray-200 text-gray-400"}`}>
                    {steps.indexOf(step) > i ? "✓" : i + 1}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${step === s ? "inline" : "hidden md:inline"}`}>{stepLabels[i]}</span>
                </div>
                {i < steps.filter(s => s !== "receipt").length - 1 && <div className={`w-4 sm:flex-1 h-0.5 rounded flex-shrink-0 ${steps.indexOf(step) > i ? "bg-emerald-400" : "bg-gray-100"}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ═══════════════ STEP 1 — BOOKING FORM ═══════════════ */}
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle>{type === "FLIGHT" ? "Book Flight" : "Book Tour"}</DialogTitle>
              <DialogDescription>
                {type === "FLIGHT" ? "Fill in your details below to continue." : `Booking: ${initialData?.title || "Selected Tour"}`}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleFormNext} className="grid gap-4 py-2">
              <div className="space-y-4">
                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+260..." />
                  </div>
                </div>

                {/* Guest counts */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500 uppercase font-bold">Adults</Label>
                    <div className="flex items-center gap-3">
                      <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => setAdults(Math.max(1, adults - 1))}>−</Button>
                      <span className="font-bold w-5 text-center">{adults}</span>
                      <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => setAdults(adults + 1)}>+</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500 uppercase font-bold">Children <span className="normal-case font-normal">(−30%)</span></Label>
                    <div className="flex items-center gap-3">
                      <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => setChildren(Math.max(0, children - 1))}>−</Button>
                      <span className="font-bold w-5 text-center">{children}</span>
                      <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => setChildren(children + 1)}>+</Button>
                    </div>
                  </div>
                </div>

                {/* Tour-specific fields */}
                {type === "TOUR" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ID Type</Label>
                      <select
                        value={idType}
                        onChange={(e) => setIdType(e.target.value)}
                        className="w-full bg-background border rounded-md px-3 py-2 text-sm"
                      >
                        <option value="National ID">National ID</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>{idType} Number</Label>
                      <Input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="ID number" required />
                    </div>
                  </div>
                )}

                {/* Flight specific class & date */}
                {type === "FLIGHT" && (
                  <>
                    <div className="space-y-2">
                      <Label>Flight Class</Label>
                      <select
                        value={flightClass}
                        onChange={(e) => setFlightClass(e.target.value)}
                        className="w-full bg-background border rounded-md px-3 py-2 text-sm"
                      >
                        <option value="Economy">Economy</option>
                        <option value="Business">Business</option>
                        <option value="First Class">First Class</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Departure Date</Label>
                      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>
                  </>
                )}

                {/* Shared Pricing Preview for Step 1 */}
                {(type === "FLIGHT" || step === "form") && (
                  <div className="bg-stone-900 text-white p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-sm text-gray-400">Currency</span>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as any)}
                        className="bg-transparent border-none focus:ring-0 text-sm font-bold text-emerald-400"
                      >
                        <option value="USD" className="bg-stone-900">USD</option>
                        <option value="EUR" className="bg-stone-900">EUR</option>
                        <option value="GBP" className="bg-stone-900">GBP</option>
                        <option value="ZMW" className="bg-stone-900">ZMW</option>
                      </select>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">{adults}× Adult{adults > 1 ? "s" : ""} {children > 0 ? `+ ${children}× Child` : ""}</span>
                        <span>{sym}{convertFromUSD(subtotal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10 mt-2">
                        <span>Total (Est.)</span>
                        <span className="text-emerald-400">{sym}{convertFromUSD(total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Voucher */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-gray-400 font-bold">Voucher Code</Label>
                  <div className="flex gap-2">
                    <Input value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} placeholder="Optional" className="bg-stone-50" />
                    <Button type="button" variant="outline" onClick={validateVoucher} className="shrink-0">Apply</Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-2 gap-2">
                <DialogClose asChild>
                  <Button variant="ghost" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  {type === "TOUR" ? "Continue to Dates" : "Review Booking"} <ArrowRight className="w-4 h-4" />
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

        {/* ═══════════════ STEP 1.1 — TOUR DATES ═══════════════ */}
        {step === "tour_dates" && (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle>Select Departure Date</DialogTitle>
              <DialogDescription>Choose one of the available dates for this tour.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-3">
              {(initialData?.availableDates || []).length > 0 ? (
                initialData?.availableDates.map((d: string) => (
                  <button
                    key={d}
                    onClick={() => setSelectedTourDate(d)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedTourDate === d ? "border-emerald-600 bg-emerald-50" : "border-gray-100 hover:border-emerald-200"}`}
                  >
                    <div className="flex items-center gap-3 text-stone-900 font-bold text-sm">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      {new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    {selectedTourDate === d && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                  </button>
                ))
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-2xl text-gray-400 text-sm italic">
                  No specific dates set. Please contact support after booking for scheduling.
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <Button variant="ghost" onClick={() => setStep("form")} className="w-full sm:flex-1 rounded-xl">Back</Button>
              <Button 
                onClick={() => setStep("transport")} 
                disabled={!selectedTourDate && (initialData?.availableDates || []).length > 0}
                className="w-full sm:flex-[2] bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Next: Transport <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ═══════════════ STEP 1.2 — TRANSPORT ═══════════════ */}
        {step === "transport" && (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle>Transport Options</DialogTitle>
              <DialogDescription>Select how you would like to reach the destination.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              {initialData?.transportOptions?.map((opt: any) => (
                <button
                  key={opt.label}
                  onClick={() => setSelectedTransport(opt)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedTransport?.label === opt.label ? "border-emerald-600 bg-emerald-50" : "border-gray-100 hover:border-emerald-200"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${selectedTransport?.label === opt.label ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                      <Car className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-stone-900">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.price === 0 ? "Included" : `+${sym}${convertFromUSD(opt.price).toLocaleString()} per person`}</p>
                    </div>
                  </div>
                  {selectedTransport?.label === opt.label && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                </button>
              ))}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <Button variant="ghost" onClick={() => setStep("tour_dates")} className="w-full sm:flex-1 rounded-xl">Back</Button>
              <Button 
                onClick={() => setStep("accommodation")} 
                disabled={!selectedTransport}
                className="w-full sm:flex-[2] bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Next: Accommodation <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ═══════════════ STEP 1.3 — ACCOMMODATION ═══════════════ */}
        {step === "accommodation" && (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle>Stay Preferences</DialogTitle>
              <DialogDescription>Which room type would you prefer?</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              {initialData?.accommodationOptions?.map((opt: any) => (
                <button
                  key={opt.label}
                  onClick={() => setSelectedAccommodation(opt)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedAccommodation?.label === opt.label ? "border-emerald-600 bg-emerald-50" : "border-gray-100 hover:border-emerald-200"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${selectedAccommodation?.label === opt.label ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                      <Hotel className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-stone-900">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.priceAdjustment === 0 ? "Standard rate" : `${opt.priceAdjustment > 0 ? '+' : '-'}${sym}${Math.abs(convertFromUSD(opt.priceAdjustment)).toLocaleString()} per person`}</p>
                    </div>
                  </div>
                  {selectedAccommodation?.label === opt.label && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                </button>
              ))}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <Button variant="ghost" onClick={() => setStep("transport")} className="w-full sm:flex-1 rounded-xl">Back</Button>
              <Button 
                onClick={() => setStep("add_ons")} 
                disabled={!selectedAccommodation}
                className="w-full sm:flex-[2] bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Next: Add-ons <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ═══════════════ STEP 1.4 — ADD-ONS ═══════════════ */}
        {step === "add_ons" && (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle>Enhance Your Experience</DialogTitle>
              <DialogDescription>Select optional activities and services.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              {initialData?.addOns?.map((opt: any) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    const exists = selectedAddOns.find(a => a.label === opt.label);
                    if (exists) {
                      setSelectedAddOns(selectedAddOns.filter(a => a.label !== opt.label));
                    } else {
                      setSelectedAddOns([...selectedAddOns, opt]);
                    }
                  }}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedAddOns.find(a => a.label === opt.label) ? "border-emerald-600 bg-emerald-50" : "border-gray-100 hover:border-emerald-200"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${selectedAddOns.find(a => a.label === opt.label) ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-stone-900">{opt.label}</p>
                      <p className="text-xs text-gray-500">+{sym}${convertFromUSD(opt.price).toLocaleString()} per person</p>
                    </div>
                  </div>
                  {selectedAddOns.find(a => a.label === opt.label) ? (
                    <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-100 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <Button variant="ghost" onClick={() => setStep("accommodation")} className="w-full sm:flex-1 rounded-xl">Back</Button>
              <Button 
                onClick={() => setStep("summary")} 
                className="w-full sm:flex-[2] bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Review Booking <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ═══════════════ STEP 2 — BOOKING SUMMARY ═══════════════ */}
        {step === "summary" && (
          <>
            <DialogHeader>
              <DialogTitle>Booking Summary</DialogTitle>
              <DialogDescription>Review your details before proceeding to payment.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Destination info */}
              <div className="rounded-2xl border border-stone-100 overflow-hidden">
                <div className="bg-emerald-600 text-white px-5 py-4">
                  <p className="text-xs text-emerald-200 uppercase tracking-wider font-semibold mb-1">{type === "FLIGHT" ? "Flight Booking" : "Tour Package"}</p>
                  <h3 className="text-xl font-bold">{initialData?.title || initialData?.hotelName || "—"}</h3>
                </div>
                <div className="p-5 grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">Passengers</p>
                      <p className="font-semibold">{adults} Adult{adults > 1 ? "s" : ""}{children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">{type === "FLIGHT" ? "Departure" : "Tour Date"}</p>
                      <p className="font-semibold">{type === "TOUR" ? (selectedTourDate ? new Date(selectedTourDate).toLocaleDateString() : (date || "—")) : (date || "—")}</p>
                    </div>
                  </div>
                  {type === "TOUR" && (
                    <>
                      <div className="flex items-start gap-2">
                        <Car className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-gray-400 text-xs">Transport</p>
                          <p className="font-semibold">{selectedTransport?.label || "None"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Hotel className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-gray-400 text-xs">Stay</p>
                          <p className="font-semibold">{selectedAccommodation?.label || "Standard"}</p>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs text-nowrap">Lead Traveler</p>
                      <p className="font-semibold truncate max-w-[120px]">{passengerName}</p>
                    </div>
                  </div>
                  {type === "TOUR" && selectedAddOns.length > 0 && (
                    <div className="flex items-start gap-2 col-span-2 mt-2 pt-2 border-t border-gray-50">
                      <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-gray-400 text-xs">Optional Add-ons</p>
                        <p className="font-semibold text-xs">{selectedAddOns.map(a => a.label).join(", ")}</p>
                      </div>
                    </div>
                  )}
                  {type === "TOUR" && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-gray-400 text-xs">{idType}</p>
                        <p className="font-semibold">{idNumber}</p>
                      </div>
                    </div>
                  )}
                  {type === "FLIGHT" && (
                    <div className="flex items-start gap-2">
                      <Ticket className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-gray-400 text-xs">Class</p>
                        <p className="font-semibold">{flightClass}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="bg-stone-50 rounded-2xl p-5 space-y-2">
                <p className="font-semibold text-stone-900 mb-3">Price Breakdown</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base Fare ({adults} Adult{children > 0 ? ` + ${children} Child` : ""})</span>
                  <span>{sym}{convertFromUSD(subtotal - (selectedTransport?.price || 0) * (adults + children) - (selectedAccommodation?.priceAdjustment || 0) * (adults + children) - selectedAddOns.reduce((acc, c) => acc + c.price, 0) * (adults + children)).toFixed(2)}</span>
                </div>
                {selectedTransport && selectedTransport.price > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Transport ({selectedTransport.label})</span>
                    <span>+{sym}{convertFromUSD(selectedTransport.price * (adults + children)).toFixed(2)}</span>
                  </div>
                )}
                {selectedAccommodation && selectedAccommodation.priceAdjustment !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Stay Upgrade ({selectedAccommodation.label})</span>
                    <span>{selectedAccommodation.priceAdjustment > 0 ? "+" : "−"}{sym}{Math.abs(convertFromUSD(selectedAccommodation.priceAdjustment * (adults + children))).toFixed(2)}</span>
                  </div>
                )}
                {selectedAddOns.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Add-ons ({selectedAddOns.length})</span>
                    <span>+{sym}{convertFromUSD(selectedAddOns.reduce((acc, c) => acc + c.price, 0) * (adults + children)).toFixed(2)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Voucher ({voucherValidation?.code})</span>
                    <span>−{sym}{convertFromUSD(discountAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-stone-200 pt-2 mt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-emerald-600">{sym}{convertFromUSD(total).toFixed(2)} ({currency})</span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(type === "TOUR" ? "add_ons" : "form")} className="gap-1">
                <ArrowLeft className="w-4 h-4" /> Edit
              </Button>
              <Button onClick={() => setStep("payment")} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                Proceed to Payment <ArrowRight className="w-4 h-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ═══════════════ STEP 3 — PAYMENT ═══════════════ */}
        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle>Secure Payment</DialogTitle>
              <DialogDescription>Total: {sym}{convertFromUSD(total).toFixed(2)} ({currency})</DialogDescription>
            </DialogHeader>

            <form onSubmit={handlePayment} className="space-y-5 py-2">
              {/* Method selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${paymentMethod === "card" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-stone-200 text-gray-500"}`}
                >
                  <CreditCard className="w-4 h-4" />
                  Credit / Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mobile")}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${paymentMethod === "mobile" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-stone-200 text-gray-500"}`}
                >
                  <span className="text-base">📱</span>
                  Mobile Money
                </button>
              </div>

              {paymentMethod === "card" ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Card Number</Label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())}
                      maxLength={19}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Expiry (MM/YY)</Label>
                      <Input
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, "").slice(0, 4)
                          if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2)
                          setCardExpiry(v)
                        }}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>CVC</Label>
                      <Input
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Mobile Money Number</Label>
                  <Input
                    placeholder="+260 97..."
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-400">A confirmation prompt will be sent to this number.</p>
                </div>
              )}

              {/* Security badge */}
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-stone-50 rounded-lg p-3">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Your payment is secured with 256-bit encryption. Vista Travel does not store your card details.</span>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setStep("summary")} className="gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 min-w-[160px]">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : <>Pay {sym}{convertFromUSD(total).toFixed(2)}</>}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

        {/* ═══════════════ STEP 4 — RECEIPT / TICKET ═══════════════ */}
        {step === "receipt" && bookingResult && (
          <div className="flex flex-col gap-5 py-2">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-9 h-9 text-emerald-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">Payment Successful!</h2>
              <p className="text-gray-400 text-sm mt-1">Your booking is confirmed and your e-ticket is ready.</p>
              {emailSent && (
                <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-emerald-600 bg-emerald-50 rounded-full px-3 py-1 w-fit mx-auto">
                  <Mail className="w-3 h-3" />
                  Ticket sent to {user?.email}
                </div>
              )}
            </div>

            {/* Ticket card */}
            <div ref={receiptRef} className="border-2 border-dashed border-stone-200 rounded-2xl overflow-hidden">
              {/* Top strip */}
              <div className="bg-stone-900 text-white px-6 py-5 flex justify-between items-start">
                <div>
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Vista Travel — E-Ticket</p>
                  <h3 className="text-lg font-bold">{initialData?.title || initialData?.hotelName || "Booking"}</h3>
                  <p className="text-gray-400 text-sm mt-0.5">{type === "FLIGHT" ? "Flight Booking" : "Tour Package"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Ticket No.</p>
                  <p className="font-mono font-bold text-emerald-400">{ticketNumber}</p>
                </div>
              </div>

              {/* Notch divider */}
              <div className="flex items-center -my-0">
                <div className="w-5 h-5 rounded-full bg-background border-2 border-dashed border-stone-200 -ml-2.5" />
                <div className="flex-1 border-t-2 border-dashed border-stone-200 mx-1" />
                <div className="w-5 h-5 rounded-full bg-background border-2 border-dashed border-stone-200 -mr-2.5" />
              </div>

              {/* Ticket body */}
              <div className="px-6 py-5 grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Booking ID</p>
                  <p className="font-bold text-stone-900">{bookingResult.bookingId}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Status</p>
                  <p className="font-bold text-emerald-600">✓ CONFIRMED</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Passenger</p>
                  <p className="font-semibold text-stone-900">{passengerName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">{type === "FLIGHT" ? "Departure" : "Tour Date"}</p>
                  <p className="font-semibold text-stone-900">{type === "TOUR" ? (selectedTourDate ? new Date(selectedTourDate).toLocaleDateString() : (date || "—")) : (date || "—")}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Guests</p>
                  <p className="font-semibold text-stone-900">{adults} Adult{adults > 1 ? "s" : ""}{children > 0 ? ` + ${children} Child` : ""}</p>
                </div>
                {type === "TOUR" && (
                  <>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Transport</p>
                      <p className="font-semibold text-stone-900">{selectedTransport?.label || "None"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Stay</p>
                      <p className="font-semibold text-stone-900">{selectedAccommodation?.label || "Standard"}</p>
                    </div>
                    {selectedAddOns.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Add-ons</p>
                        <p className="font-semibold text-stone-900">{selectedAddOns.map(a => a.label).join(", ")}</p>
                      </div>
                    )}
                  </>
                )}
                {type === "FLIGHT" && (
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Class</p>
                    <p className="font-semibold text-stone-900">{flightClass}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Total Paid</p>
                  <p className="font-bold text-stone-900">{sym}{convertFromUSD(total).toFixed(2)} ({currency})</p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-stone-50 px-6 py-3 text-center">
                <p className="text-xs text-gray-400">Thank you for booking with Vista Travel 🌍 — support@vistatravel.com</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={handlePrint} className="gap-1.5 text-sm">
                <Printer className="w-4 h-4" /> Print
              </Button>
              <Button variant="outline" onClick={handleDownload} className="gap-1.5 text-sm">
                <Download className="w-4 h-4" /> Download
              </Button>
              <Button
                className="gap-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  resetModal()
                  useVistaStore.getState().setPage("admin")
                  useVistaStore.getState().setAdminSection("tickets")
                }}
              >
                <Ticket className="w-4 h-4" /> My Tickets
              </Button>
            </div>

            <Button variant="ghost" onClick={resetModal} className="text-gray-400 text-xs">
              Close &amp; back to browsing
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
