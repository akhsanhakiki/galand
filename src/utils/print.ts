import type { Transaction } from "./api";

export const printTransaction = (transaction: Transaction) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Transaksi #${transaction.id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          @page {
            size: 80mm auto;
            margin: 5mm;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 70mm;
            max-width: 70mm;
            margin: 0 auto;
            padding: 5mm 0;
            color: #000;
            background: #fff;
            font-size: 10px;
            line-height: 1.2;
          }
          .header {
            text-align: center;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid #000;
          }
          .header h1 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 4px;
            text-transform: uppercase;
          }
          .header p {
            font-size: 10px;
          }
          .transaction-info {
            margin-bottom: 8px;
            font-size: 9px;
          }
          .transaction-info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .transaction-info-label {
            font-weight: bold;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            font-size: 9px;
          }
          th {
            text-align: left;
            padding: 3px 0;
            font-weight: bold;
            border-bottom: 1px solid #000;
            font-size: 9px;
          }
          th:last-child {
            text-align: right;
          }
          td {
            padding: 2px 0;
            border-bottom: 1px dotted #000;
            font-size: 9px;
          }
          tbody tr:last-child td {
            border-bottom: none;
          }
          .text-right {
            text-align: right;
          }
          .item-name {
            max-width: 40%;
            word-wrap: break-word;
          }
          .item-qty {
            text-align: center;
            width: 15%;
          }
          .item-price {
            text-align: right;
            width: 45%;
          }
          .total-section {
            margin-top: 8px;
            padding-top: 6px;
            border-top: 2px solid #000;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            font-weight: bold;
            margin-top: 4px;
          }
          .footer {
            margin-top: 12px;
            text-align: center;
            font-size: 9px;
            border-top: 1px dashed #000;
            padding-top: 8px;
          }
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            .no-print {
              display: none;
            }
            @page {
              size: 80mm auto;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Struk Transaksi</h1>
          <p>#${transaction.id}</p>
        </div>
        
        <div class="transaction-info">
          <div class="transaction-info-row">
            <span class="transaction-info-label">Tanggal:</span>
            <span>${formatDate(transaction.created_at)}</span>
          </div>
        </div>

        <div class="divider"></div>

        <table>
          <thead>
            <tr>
              <th class="item-name">Barang</th>
              <th class="item-qty">Qty</th>
              <th class="item-price">Total</th>
            </tr>
          </thead>
          <tbody>
            ${transaction.items
              ?.map((item) => {
                const itemTotal = item.price * item.quantity;
                return `
                  <tr>
                    <td class="item-name">${item.product_name}</td>
                    <td class="item-qty">${item.quantity}</td>
                    <td class="item-price">Rp${itemTotal.toLocaleString("id-ID")}</td>
                  </tr>
                  <tr>
                    <td colspan="3" style="font-size: 8px; padding-left: 0;">
                      ${item.quantity}x Rp${item.price.toLocaleString("id-ID")}
                    </td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>

        <div class="divider"></div>

        <div class="total-section">
          <div class="total-row">
            <span>TOTAL:</span>
            <span>Rp${transaction.total_amount.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <div class="footer">
          <p>Terima kasih atas kunjungan Anda</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();

  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 250);
};

