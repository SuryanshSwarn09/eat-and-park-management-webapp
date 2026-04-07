import React, { useState } from 'react';
import { Transaction, MenuItem } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SalesHistoryProps {
  transactions: Transaction[];
  menuItems: MenuItem[];
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ transactions, menuItems }) => {
  const [isExporting, setIsExporting] = useState(false);

  const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalPaymentsDone = transactions.length;
  const totalItemsServed = transactions.reduce((acc, t) => 
    acc + t.items.reduce((sum, item) => sum + item.quantity, 0), 0
  );

  const handleExportPDF = () => {
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      const dateStr = new Date().toLocaleDateString();
      const timeStr = new Date().toLocaleTimeString();

      doc.setFontSize(22);
      doc.setTextColor(44, 62, 80);
      doc.text("EAT 'N' PARK RESTAURANT", 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text('Daily Sales Registry Report', 14, 30);
      doc.text(`Generated: ${dateStr} at ${timeStr}`, 14, 36);

      doc.setDrawColor(241, 245, 249);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 45, 182, 30, 3, 3, 'FD');
      
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text('TOTAL REVENUE (INCL.)', 20, 55);
      doc.text('PAYMENTS DONE', 80, 55);
      doc.text('ITEMS SERVED', 140, 55);
      
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text(`INR ${totalRevenue.toFixed(0)}`, 20, 65);
      doc.text(`${totalPaymentsDone}`, 80, 65);
      doc.text(`${totalItemsServed}`, 140, 65);

      const tableData = [...transactions].reverse().map(tx => [
        `#${tx.id}`,
        `Table ${tx.tableId}`,
        tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tx.paymentMethod,
        `Rs. ${Math.round(tx.total)}`
      ]);

      autoTable(doc, {
        startY: 85,
        head: [['Invoice ID', 'Table', 'Time', 'Method', 'Total Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [15, 23, 42], 
          textColor: [255, 255, 255], 
          fontSize: 10,
          fontStyle: 'bold' 
        },
        bodyStyles: { 
          fontSize: 9, 
          textColor: [51, 65, 85] 
        },
        alternateRowStyles: { 
          fillColor: [248, 250, 252] 
        },
        margin: { top: 85 }
      });

      const fileName = `EatNPark_Registry_${dateStr.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('PDF Export Failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in space-y-6">
      <div className="shrink-0 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bill Registry</h2>
            <p className="text-slate-500 text-sm font-medium">Daily summary of finalized settlements (GST Inclusive).</p>
          </div>
          <button 
            onClick={handleExportPDF}
            disabled={transactions.length === 0 || isExporting}
            className={`w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${
              transactions.length === 0 
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
              : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
            }`}
          >
            {isExporting ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            <span>Daily PDF Report</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
            <p className="text-2xl font-black text-emerald-600 tracking-tighter">{totalPaymentsDone} Bills</p>
          </div>
          <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Daily Revenue (Incl.)</p>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{Math.round(totalRevenue)}</p>
          </div>
          <div className="bg-indigo-600 p-5 rounded-[1.5rem] shadow-xl flex flex-col justify-center text-white">
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Items Served</p>
            <p className="text-2xl font-black tracking-tighter">{totalItemsServed} Dishes</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-10">
        {transactions.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 flex flex-col items-center justify-center border border-slate-200 text-center mt-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
              </div>
              <h3 className="text-lg font-black text-slate-800">No Sales History</h3>
              <p className="text-slate-400 text-sm mt-1">Transactions will appear here after checkout.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {[...transactions].reverse().map((tx) => (
              <div key={tx.id} className="bg-white rounded-[1.5rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 opacity-20 group-hover:opacity-100"></div>
                
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">INV #{tx.id}</p>
                      <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight">Table {tx.tableId} Settlement</h4>
                  </div>
                  <div className="text-right shrink-0">
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase border border-emerald-100">
                          {tx.paymentMethod}
                      </span>
                      <p className="text-[9px] font-medium text-slate-400 mt-1">{tx.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 py-3 border-y border-slate-50">
                  {tx.items.map((item, idx) => {
                      const menu = menuItems.find(m => m.id === item.menuItemId);
                      return (
                          <div key={idx} className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                              <span className="text-slate-900 font-black text-[10px]">{item.quantity}x</span>
                              <span className="text-slate-500 font-bold text-[10px] truncate max-w-[100px]">{menu?.name}</span>
                          </div>
                      )
                  })}
                </div>

                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount Paid (Incl.)</span>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{Math.round(tx.total)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;