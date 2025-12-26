import React from "react";
import { Card, Button, Chip, Surface } from "@heroui/react";
import {
  FaMagnifyingGlass,
  FaFilter,
  FaCircleCheck,
  FaClock,
  FaCircleXmark,
} from "react-icons/fa6";

const TransaksiPage = () => {
  const transactions = [
    {
      id: "INV-001",
      customer: "John Doe",
      amount: 250000,
      status: "completed",
      date: "17 Apr 2026",
    },
    {
      id: "INV-002",
      customer: "Jane Smith",
      amount: 450000,
      status: "pending",
      date: "15 Apr 2026",
    },
    {
      id: "INV-003",
      customer: "Bob Johnson",
      amount: 320000,
      status: "completed",
      date: "15 Apr 2026",
    },
    {
      id: "INV-004",
      customer: "Alice Brown",
      amount: 180000,
      status: "in-progress",
      date: "14 Apr 2026",
    },
    {
      id: "INV-005",
      customer: "Charlie Wilson",
      amount: 550000,
      status: "completed",
      date: "10 Apr 2026",
    },
  ];

  const getStatusChip = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Chip color="success" variant="soft">
            <FaCircleCheck className="w-3 h-3 mr-1" />
            Selesai
          </Chip>
        );
      case "pending":
        return (
          <Chip color="warning" variant="soft">
            <FaClock className="w-3 h-3 mr-1" />
            Menunggu
          </Chip>
        );
      case "in-progress":
        return (
          <Chip color="default" variant="soft">
            <FaClock className="w-3 h-3 mr-1" />
            Diproses
          </Chip>
        );
      default:
        return (
          <Chip color="danger" variant="soft">
            <FaCircleXmark className="w-3 h-3 mr-1" />
            Dibatalkan
          </Chip>
        );
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Transaksi</h1>
          <p className="text-muted">Kelola semua transaksi penjualan Anda</p>
        </div>
        <Button variant="primary" className="bg-accent text-accent-foreground">
          Transaksi Baru
        </Button>
      </div>

      <Card variant="default" className="p-6">
        <Card.Header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
          <div className="flex flex-1 gap-2">
            <Surface
              className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg"
              variant="secondary"
            >
              <FaMagnifyingGlass className="w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted"
              />
            </Surface>
            <Button variant="tertiary" isIconOnly>
              <FaFilter className="w-4 h-4" />
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-separator">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                    ID Transaksi
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                    Pelanggan
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                    Jumlah
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                    Tanggal
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-separator hover:bg-surface-secondary transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      {transaction.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {transaction.customer}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-foreground">
                      Rp {transaction.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusChip(transaction.status)}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">
                      {transaction.date}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default TransaksiPage;
