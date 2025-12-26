import React from "react";
import { Card, Button, Chip, Surface } from "@heroui/react";
import { FaTag, FaPlus, FaPenToSquare, FaTrash } from "react-icons/fa6";

const DiskonPage = () => {
  const discounts = [
    {
      id: 1,
      name: "Diskon Hari Raya",
      code: "LEBARAN50",
      value: 50,
      type: "percentage",
      status: "active",
    },
    {
      id: 2,
      name: "Flash Sale",
      code: "FLASH30",
      value: 30,
      type: "percentage",
      status: "active",
    },
    {
      id: 3,
      name: "Cashback",
      code: "CASH10K",
      value: 10000,
      type: "fixed",
      status: "inactive",
    },
    {
      id: 4,
      name: "Member Discount",
      code: "MEMBER20",
      value: 20,
      type: "percentage",
      status: "active",
    },
  ];

  return (
    <div className="flex flex-col w-full gap-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Diskon</h1>
          <p className="text-muted">Kelola kode diskon dan promo penjualan</p>
        </div>
        <Button variant="primary" className="bg-accent text-accent-foreground">
          <FaPlus className="w-4 h-4 mr-2" />
          Tambah Diskon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {discounts.map((discount) => (
          <Card key={discount.id} variant="default" className="p-6">
            <Card.Header className="flex items-start justify-between pb-4">
              <div className="flex items-center gap-3">
                <Surface className="p-3 rounded-xl bg-accent/10">
                  <FaTag className="w-5 h-5 text-accent" />
                </Surface>
                <div>
                  <Card.Title className="text-lg font-bold">
                    {discount.name}
                  </Card.Title>
                  <Card.Description className="text-sm">
                    Kode: {discount.code}
                  </Card.Description>
                </div>
              </div>
              <Chip
                color={discount.status === "active" ? "success" : "default"}
                variant="soft"
                size="sm"
              >
                {discount.status === "active" ? "Aktif" : "Tidak Aktif"}
              </Chip>
            </Card.Header>
            <Card.Content className="pb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  {discount.type === "percentage"
                    ? `${discount.value}%`
                    : `Rp ${discount.value.toLocaleString("id-ID")}`}
                </span>
                <span className="text-sm text-muted">
                  {discount.type === "percentage" ? "off" : "cashback"}
                </span>
              </div>
            </Card.Content>
            <Card.Footer className="flex gap-2 pt-4 border-t border-separator">
              <Button variant="tertiary" size="sm" className="flex-1">
                <FaPenToSquare className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" className="flex-1">
                <FaTrash className="w-3 h-3 mr-1" />
                Hapus
              </Button>
            </Card.Footer>
          </Card>
        ))}
      </div>

      <Card variant="default" className="p-6">
        <Card.Header>
          <Card.Title className="text-xl font-bold">
            Statistik Diskon
          </Card.Title>
          <Card.Description>Ringkasan penggunaan diskon</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Surface className="p-4 rounded-xl" variant="secondary">
              <p className="text-sm text-muted mb-2">Total Diskon Aktif</p>
              <p className="text-2xl font-bold text-foreground">3</p>
            </Surface>
            <Surface className="p-4 rounded-xl" variant="secondary">
              <p className="text-sm text-muted mb-2">Digunakan Hari Ini</p>
              <p className="text-2xl font-bold text-foreground">45</p>
            </Surface>
            <Surface className="p-4 rounded-xl" variant="secondary">
              <p className="text-sm text-muted mb-2">Total Penghematan</p>
              <p className="text-2xl font-bold text-foreground">Rp 2.450.000</p>
            </Surface>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default DiskonPage;
