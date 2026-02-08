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

  // Receipt paper: 80mm width (≈302px at 96dpi). Fixed viewport so preview matches paper.
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Struk #${transaction.id}</title>
        <meta name="viewport" content="width=302, initial-scale=1, maximum-scale=1, user-scalable=no">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html {
            width: 80mm;
            max-width: 80mm;
            margin: 0 auto;
            background: #fff;
          }
          @page {
            size: 80mm 297mm;
            margin: 2mm;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 80mm;
            max-width: 80mm;
            min-width: 80mm;
            margin: 0 auto;
            padding: 3mm 2mm;
            color: #000;
            background: #fff;
            font-size: 9px;
            line-height: 1.2;
          }
          .header {
            text-align: center;
            margin-bottom: 4px;
            padding-bottom: 4px;
            border-bottom: 1px solid #000;
          }
          .header h1 {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 2px;
            text-transform: uppercase;
          }
          .header p {
            font-size: 9px;
          }
          .transaction-info {
            margin-bottom: 4px;
            font-size: 8px;
          }
          .transaction-info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          .transaction-info-label {
            font-weight: bold;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 3px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
            font-size: 8px;
          }
          th {
            text-align: left;
            padding: 2px 0;
            font-weight: bold;
            border-bottom: 1px solid #000;
            font-size: 8px;
          }
          th:last-child {
            text-align: right;
          }
          td {
            padding: 1px 0;
            border-bottom: 1px dotted #000;
            font-size: 8px;
          }
          tbody tr:last-child td {
            border-bottom: none;
          }
          .text-right {
            text-align: right;
          }
          .item-name {
            max-width: 42%;
            word-wrap: break-word;
          }
          .item-qty {
            text-align: center;
            width: 14%;
          }
          .item-price {
            text-align: right;
            width: 44%;
          }
          .total-section {
            margin-top: 4px;
            padding-top: 4px;
            border-top: 2px solid #000;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10px;
            font-weight: bold;
            margin-top: 2px;
          }
          .footer {
            margin-top: 6px;
            text-align: center;
            font-size: 8px;
            border-top: 1px dashed #000;
            padding-top: 4px;
          }
          @media print {
            html, body {
              width: 80mm !important;
              max-width: 80mm !important;
              min-width: 80mm !important;
              margin: 0 !important;
              padding: 2mm !important;
            }
            .no-print {
              display: none;
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
                    <td class="item-price">Rp${itemTotal.toLocaleString(
                      "id-ID"
                    )}</td>
                  </tr>
                  <tr>
                    <td colspan="3" style="font-size: 7px; padding-left: 0;">
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
