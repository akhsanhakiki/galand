import type { Transaction, Product } from "./api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const exportToCSV = (transactions: Transaction[]) => {
  const headers = ["ID Transaksi", "Total Barang", "Jumlah", "Tanggal"];
  const rows = transactions.map((t) => [
    t.id.toString(),
    (t.items?.reduce((sum, item) => sum + item.quantity, 0) || 0).toString(),
    `Rp ${t.total_amount.toLocaleString("id-ID")}`,
    formatDate(t.created_at),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `transaksi_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToXLSX = (transactions: Transaction[]) => {
  const data = transactions.map((t) => ({
    "ID Transaksi": t.id,
    "Total Barang": t.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    Jumlah: t.total_amount,
    Tanggal: formatDate(t.created_at),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");

  XLSX.writeFile(
    workbook,
    `transaksi_${new Date().toISOString().split("T")[0]}.xlsx`
  );
};

export const exportToPDF = (transactions: Transaction[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const startY = margin + 10;
  let currentY = startY;

  doc.setFontSize(16);
  doc.text("Laporan Transaksi", margin, currentY);
  currentY += 10;

  doc.setFontSize(10);
  doc.text(
    `Tanggal Export: ${new Date().toLocaleString("id-ID")}`,
    margin,
    currentY
  );
  currentY += 8;

  const tableHeaders = ["ID", "Barang", "Jumlah", "Tanggal"];
  const colWidths = [20, 20, 40, 80];
  const rowHeight = 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");

  let xPos = margin;
  tableHeaders.forEach((header, index) => {
    doc.text(header, xPos, currentY);
    xPos += colWidths[index];
  });

  currentY += rowHeight;
  doc.setLineWidth(0.5);
  doc.line(margin, currentY - 2, pageWidth - margin, currentY - 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  transactions.forEach((transaction) => {
    if (currentY + rowHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin + 10;
    }

    const row = [
      transaction.id.toString(),
      (transaction.items?.reduce((sum, item) => sum + item.quantity, 0) || 0).toString(),
      `Rp ${transaction.total_amount.toLocaleString("id-ID")}`,
      formatDate(transaction.created_at),
    ];

    xPos = margin;
    row.forEach((cell, index) => {
      const cellText = doc.splitTextToSize(cell, colWidths[index] - 2);
      doc.text(cellText, xPos, currentY);
      xPos += colWidths[index];
    });

    currentY += rowHeight;
  });

  doc.save(`transaksi_${new Date().toISOString().split("T")[0]}.pdf`);
};

// Product export functions
export const exportProductsToCSV = (products: Product[]) => {
  const headers = [
    "Nama Produk",
    "Deskripsi",
    "Stok",
    "Harga",
    "COGS",
    "Jumlah Bundle",
    "Harga Bundle",
  ];
  const rows = products.map((p) => [
    p.name,
    p.description || "-",
    p.stock.toString(),
    `Rp ${p.price.toLocaleString("id-ID")}`,
    `Rp ${p.cogs.toLocaleString("id-ID")}`,
    p.bundle_quantity.toString(),
    `Rp ${p.bundle_price.toLocaleString("id-ID")}`,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `produk_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportProductsToXLSX = (products: Product[]) => {
  const data = products.map((p) => ({
    "Nama Produk": p.name,
    Deskripsi: p.description || "-",
    Stok: p.stock,
    Harga: p.price,
    COGS: p.cogs,
    "Jumlah Bundle": p.bundle_quantity,
    "Harga Bundle": p.bundle_price,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Produk");

  XLSX.writeFile(
    workbook,
    `produk_${new Date().toISOString().split("T")[0]}.xlsx`
  );
};

export const exportProductsToPDF = (products: Product[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const startY = margin + 10;
  let currentY = startY;

  doc.setFontSize(16);
  doc.text("Laporan Produk", margin, currentY);
  currentY += 10;

  doc.setFontSize(10);
  doc.text(
    `Tanggal Export: ${new Date().toLocaleString("id-ID")}`,
    margin,
    currentY
  );
  currentY += 8;

  const tableHeaders = [
    "Nama",
    "Deskripsi",
    "Stok",
    "Harga",
    "COGS",
    "Bundle Qty",
    "Bundle Price",
  ];
  const colWidths = [40, 40, 15, 30, 30, 20, 30];
  const rowHeight = 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");

  let xPos = margin;
  tableHeaders.forEach((header, index) => {
    doc.text(header, xPos, currentY);
    xPos += colWidths[index];
  });

  currentY += rowHeight;
  doc.setLineWidth(0.5);
  doc.line(margin, currentY - 2, pageWidth - margin, currentY - 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  products.forEach((product) => {
    if (currentY + rowHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin + 10;
    }

    const row = [
      product.name,
      product.description || "-",
      product.stock.toString(),
      `Rp ${product.price.toLocaleString("id-ID")}`,
      `Rp ${product.cogs.toLocaleString("id-ID")}`,
      product.bundle_quantity.toString(),
      `Rp ${product.bundle_price.toLocaleString("id-ID")}`,
    ];

    xPos = margin;
    row.forEach((cell, index) => {
      const cellText = doc.splitTextToSize(cell, colWidths[index] - 2);
      doc.text(cellText, xPos, currentY);
      xPos += colWidths[index];
    });

    currentY += rowHeight;
  });

  doc.save(`produk_${new Date().toISOString().split("T")[0]}.pdf`);
};
