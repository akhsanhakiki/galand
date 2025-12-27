import React from "react";
import { Card, Button, Chip, Surface } from "@heroui/react";
import {
  FaWarehouse,
  FaPlus,
  FaMagnifyingGlass,
  FaBox,
  FaCircleExclamation,
} from "react-icons/fa6";

const GudangPage = () => {
  const products = [
    {
      id: 1,
      name: "Produk A",
      stock: 150,
      price: 50000,
      category: "Elektronik",
      status: "in-stock",
    },
    {
      id: 2,
      name: "Produk B",
      stock: 45,
      price: 75000,
      category: "Fashion",
      status: "in-stock",
    },
    {
      id: 3,
      name: "Produk C",
      stock: 5,
      price: 120000,
      category: "Elektronik",
      status: "low-stock",
    },
    {
      id: 4,
      name: "Produk D",
      stock: 0,
      price: 30000,
      category: "Makanan",
      status: "out-of-stock",
    },
    {
      id: 5,
      name: "Produk E",
      stock: 200,
      price: 25000,
      category: "Fashion",
      status: "in-stock",
    },
  ];

  const getStockStatus = (status: string) => {
    switch (status) {
      case "in-stock":
        return (
          <Chip color="success" variant="soft">
            Tersedia
          </Chip>
        );
      case "low-stock":
        return (
          <Chip color="warning" variant="soft">
            <FaCircleExclamation className="w-3 h-3 mr-1" />
            Stok Menipis
          </Chip>
        );
      case "out-of-stock":
        return (
          <Chip color="danger" variant="soft">
            Habis
          </Chip>
        );
      default:
        return (
          <Chip color="default" variant="soft">
            -
          </Chip>
        );
    }
  };

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Gudang</h1>
          <p className="text-muted">Kelola inventori dan stok produk</p>
        </div>
        <Button variant="primary" className="bg-accent text-accent-foreground">
          <FaPlus className="w-4 h-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="default" className="p-6">
          <Card.Header className="pb-2">
            <Card.Description className="text-sm text-muted">
              Total Produk
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex items-center justify-between">
            <Card.Title className="text-2xl font-bold text-foreground">
              125
            </Card.Title>
            <Surface className="p-3 rounded-xl bg-accent/10">
              <FaBox className="w-5 h-5 text-accent" />
            </Surface>
          </Card.Content>
        </Card>

        <Card variant="default" className="p-6">
          <Card.Header className="pb-2">
            <Card.Description className="text-sm text-muted">
              Stok Tersedia
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex items-center justify-between">
            <Card.Title className="text-2xl font-bold text-foreground">
              98
            </Card.Title>
            <Surface className="p-3 rounded-xl bg-success/10">
              <FaBox className="w-5 h-5 text-success" />
            </Surface>
          </Card.Content>
        </Card>

        <Card variant="default" className="p-6">
          <Card.Header className="pb-2">
            <Card.Description className="text-sm text-muted">
              Stok Menipis
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex items-center justify-between">
            <Card.Title className="text-2xl font-bold text-foreground">
              12
            </Card.Title>
            <Surface className="p-3 rounded-xl bg-warning/10">
              <FaCircleExclamation className="w-5 h-5 text-warning" />
            </Surface>
          </Card.Content>
        </Card>

        <Card variant="default" className="p-6">
          <Card.Header className="pb-2">
            <Card.Description className="text-sm text-muted">
              Habis
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex items-center justify-between">
            <Card.Title className="text-2xl font-bold text-foreground">
              15
            </Card.Title>
            <Surface className="p-3 rounded-xl bg-danger/10">
              <FaCircleExclamation className="w-5 h-5 text-danger" />
            </Surface>
          </Card.Content>
        </Card>
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
                placeholder="Cari produk..."
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted"
              />
            </Surface>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-separator">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                    Nama Produk
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                    Kategori
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                    Stok
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                    Harga
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-separator hover:bg-surface-secondary transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      {product.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {product.category}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-foreground">
                      {product.stock}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-foreground">
                      Rp {product.price.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4">
                      {getStockStatus(product.status)}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">
                        Edit
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

export default GudangPage;
