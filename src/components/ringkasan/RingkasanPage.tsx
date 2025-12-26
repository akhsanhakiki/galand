import React from "react";
import { Card, Surface } from "@heroui/react";
import {
  FaChartLine,
  FaMoneyBill,
  FaCartShopping,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa6";

const RingkasanPage = () => {
  return (
    <div className="flex flex-col w-full gap-6 p-4">
      <div className="flex flex-col gap-2 w-full">
        <h1 className="text-3xl font-bold text-foreground">Ringkasan</h1>
        <p className="text-muted">
          Pantau ringkasan penjualan dan inventori Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" className="p-6">
          <Card.Header className="pb-2">
            <Card.Description className="text-sm text-muted">
              Total Pendapatan
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex items-center justify-between">
            <div>
              <Card.Title className="text-2xl font-bold text-foreground">
                Rp 12.450.000
              </Card.Title>
              <div className="flex items-center gap-1 mt-2 text-success">
                <FaArrowUp className="w-3 h-3" />
                <span className="text-sm">↑ 12% dari bulan lalu</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-accent/10">
              <FaMoneyBill className="w-6 h-6 text-accent" />
            </div>
          </Card.Content>
        </Card>

        <Card variant="default" className="p-6">
          <Card.Header className="pb-2">
            <Card.Description className="text-sm text-muted">
              Total Penjualan
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex items-center justify-between">
            <div>
              <Card.Title className="text-2xl font-bold text-foreground">
                Rp 8.750.000
              </Card.Title>
              <div className="flex items-center gap-1 mt-2 text-success">
                <FaArrowUp className="w-3 h-3" />
                <span className="text-sm">↑ 8% dari bulan lalu</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-accent/10">
              <FaCartShopping className="w-6 h-6 text-accent" />
            </div>
          </Card.Content>
        </Card>

        <Card variant="default" className="p-6">
          <Card.Header className="pb-2">
            <Card.Description className="text-sm text-muted">
              Total Transaksi
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex items-center justify-between">
            <div>
              <Card.Title className="text-2xl font-bold text-foreground">
                245
              </Card.Title>
              <div className="flex items-center gap-1 mt-2 text-success">
                <FaArrowUp className="w-3 h-3" />
                <span className="text-sm">↑ 5% dari bulan lalu</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-accent/10">
              <FaChartLine className="w-6 h-6 text-accent" />
            </div>
          </Card.Content>
        </Card>

        <Card variant="default" className="p-6">
          <Card.Header className="pb-2">
            <Card.Description className="text-sm text-muted">
              Produk Terjual
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex items-center justify-between">
            <div>
              <Card.Title className="text-2xl font-bold text-foreground">
                1,234
              </Card.Title>
              <div className="flex items-center gap-1 mt-2 text-danger">
                <FaArrowDown className="w-3 h-3" />
                <span className="text-sm">↓ 3% dari bulan lalu</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-accent/10">
              <FaCartShopping className="w-6 h-6 text-accent" />
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card variant="default" className="p-6">
          <Card.Header>
            <Card.Title className="text-xl font-bold">
              Grafik Penjualan
            </Card.Title>
            <Card.Description>
              Ringkasan penjualan dalam periode tertentu
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Surface
              className="h-64 flex items-center justify-center rounded-xl"
              variant="secondary"
            >
              <p className="text-muted">Grafik akan ditampilkan di sini</p>
            </Surface>
          </Card.Content>
        </Card>

        <Card variant="default" className="p-6">
          <Card.Header>
            <Card.Title className="text-xl font-bold">
              Produk Terlaris
            </Card.Title>
            <Card.Description>
              Daftar produk dengan penjualan tertinggi
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <Surface
                  key={item}
                  className="p-3 rounded-lg flex items-center justify-between"
                  variant="secondary"
                >
                  <div>
                    <p className="font-medium text-foreground">Produk {item}</p>
                    <p className="text-sm text-muted">
                      Terjual: {item * 10} unit
                    </p>
                  </div>
                  <span className="text-accent font-semibold">
                    Rp {(item * 50000).toLocaleString("id-ID")}
                  </span>
                </Surface>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default RingkasanPage;
