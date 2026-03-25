"use client"

import React from "react"
import { Plane, Calendar, MapPin, Ticket } from "lucide-react"

interface TicketData {
  bookingId: string
  ticketNumber: string
  passengerName: string
  type: "FLIGHT" | "TOUR"
  title: string
  date: string
  time?: string
  guests: string
  accommodation?: string
  transport?: string
  addOns?: string[]
  total: string
  currency: string
  status: string
}

export const PrintableTicket = React.forwardRef<HTMLDivElement, { data: TicketData }>(({ data }, ref) => {
  return (
    <div ref={ref} className="bg-white p-8 w-[600px] hidden print:block">
      <div className="relative bg-stone-50 rounded-[40px] border border-stone-100 overflow-hidden shadow-sm">
        {/* Header branding */}
        <div className="bg-stone-900 px-8 py-8 text-white">
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Plane className="w-5 h-5 text-white transform -rotate-45" />
                 </div>
                 <h3 className="text-2xl font-black italic tracking-tighter">Vista<span className="text-emerald-500">.</span></h3>
              </div>
              <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.2em]">Official E-Ticket</p>
            </div>
            <div className="text-right">
               <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mb-1">Ticket Number</p>
               <p className="text-xl font-mono font-black text-emerald-400 leading-none">{data.ticketNumber}</p>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="flex-1">
              <p className="text-[10px] text-stone-500 font-bold uppercase mb-1">Passenger Name</p>
              <p className="text-lg font-bold truncate pr-4">{data.passengerName.toUpperCase()}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-stone-500 font-bold uppercase mb-1">Status</p>
              <div className="flex items-center gap-1.5 justify-end">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <p className="text-sm font-black text-emerald-400 uppercase">{data.status || 'Confirmed'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tear-off dash line */}
        <div className="relative flex items-center bg-stone-50 px-2 py-0">
          <div className="absolute left-0 -translate-x-1/2 w-8 h-8 bg-white border border-stone-100 rounded-full" />
          <div className="flex-1 border-t-2 border-dashed border-stone-200 h-0" />
          <div className="absolute right-0 translate-x-1/2 w-8 h-8 bg-white border border-stone-100 rounded-full" />
        </div>

        {/* Ticket Details Body */}
        <div className="bg-stone-50 px-8 py-8 text-stone-800">
           <div className="grid grid-cols-2 gap-y-8 gap-x-10 mb-10">
              <div className="space-y-1">
                 <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none">Category</p>
                 <p className="text-sm font-black flex items-center gap-2">
                   {data.type === "FLIGHT" ? <Plane className="w-4 h-4 text-emerald-600" /> : <Calendar className="w-4 h-4 text-emerald-600" />}
                   {data.type === "FLIGHT" ? "Commercial Flight" : "Premium Tour Package"}
                 </p>
              </div>
              <div className="space-y-1 text-right">
                 <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none">Booking ID</p>
                 <p className="text-sm font-black">#{data.bookingId}</p>
              </div>

              <div className="col-span-2 bg-white/50 border border-stone-100 rounded-2xl p-4 flex justify-between items-center">
                 <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Destination / Hotel</p>
                    <p className="text-base font-black leading-tight">
                       {data.title}
                    </p>
                 </div>
                 <div className="text-right">
                     <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Travel Date</p>
                     <p className="text-base font-black text-emerald-600">
                        {data.date}
                     </p>
                 </div>
              </div>

              <div className="space-y-1">
                 <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none">Accommodation / Class</p>
                 <p className="text-sm font-black">
                    {data.accommodation || data.type === 'FLIGHT' ? data.type === 'FLIGHT' ? 'Economy Cabin' : 'Standard Stay' : 'Standard'}
                 </p>
              </div>
              <div className="space-y-1 text-right">
                 <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none">Transport</p>
                 <p className="text-sm font-black">
                    {data.transport || "Included"}
                 </p>
              </div>

              <div className="space-y-1">
                 <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none">Total Investment</p>
                 <p className="text-lg font-black text-emerald-600">{data.total}</p>
              </div>
              <div className="space-y-1 text-right">
                 <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none">Currency</p>
                 <p className="text-sm font-bold text-stone-500">{data.currency} (International)</p>
              </div>
           </div>

           {/* Add-ons tag list */}
           {data.addOns && data.addOns.length > 0 && (
              <div className="mb-8 pt-6 border-t border-stone-200/50">
                 <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-3">Optional Services Included</p>
                 <div className="flex flex-wrap gap-2">
                    {data.addOns.map(a => (
                       <span key={a} className="text-[10px] px-3 py-1 bg-white border border-stone-100 rounded-full font-bold text-stone-600">
                          + {a}
                       </span>
                    ))}
                 </div>
              </div>
           )}

           {/* Simulated Barcode */}
           <div className="flex flex-col items-center pt-6 border-t border-stone-200/50">
              <div className="w-full h-16 flex gap-1 items-end justify-center px-4 overflow-hidden mb-2">
                {[4,10,6,12,8,15,4,2,10,14,5,11,7,16,4,2,9,13,4,10,6,12,8,15,4,2,10,14,5,11,7,16,4,2,9,13].map((h, i) => (
                   <div key={i} className="bg-stone-900 w-1 flex-1 rounded-t-sm" style={{ height: `${h * 4}px`, opacity: i % 3 === 0 ? 0.8 : 1 }} />
                ))}
              </div>
              <p className="text-[9px] font-mono text-stone-400 tracking-[0.5em] uppercase">{data.bookingId}</p>
           </div>
        </div>

        {/* Final footer */}
        <div className="bg-white px-8 py-4 flex justify-between items-center text-[8px] text-stone-400 font-bold uppercase tracking-widest border-t border-stone-50">
           <p>© VISTA TRAVEL GLOBAL SYSTEMS</p>
           <p>NON-TRANSFERABLE DOCUMENT</p>
        </div>
      </div>
    </div>
  )
})

PrintableTicket.displayName = "PrintableTicket"
