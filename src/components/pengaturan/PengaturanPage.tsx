import React from "react";
import { Card, Button, Surface, Switch, Separator } from "@heroui/react";
import {
  FaGear,
  FaUser,
  FaStore,
  FaBell,
  FaShield,
  FaPalette,
} from "react-icons/fa6";

const PengaturanPage = () => {
  return (
    <div className="flex flex-col w-full gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-muted">
          Kelola pengaturan aplikasi dan preferensi Anda
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card variant="default" className="p-6">
            <Card.Header className="flex items-center gap-3 pb-4">
              <Surface className="p-2 rounded-lg bg-accent/10">
                <FaUser className="w-5 h-5 text-accent" />
              </Surface>
              <Card.Title className="text-xl font-bold">Profil</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">
                  Nama
                </label>
                <input
                  type="text"
                  defaultValue="Admin"
                  className="px-4 py-2 rounded-lg border border-separator bg-field-background text-field-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="admin@kadara.com"
                  className="px-4 py-2 rounded-lg border border-separator bg-field-background text-field-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  defaultValue="+62 812 3456 7890"
                  className="px-4 py-2 rounded-lg border border-separator bg-field-background text-field-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <Button
                variant="primary"
                className="bg-accent text-accent-foreground w-fit"
              >
                Simpan Perubahan
              </Button>
            </Card.Content>
          </Card>

          <Card variant="default" className="p-6">
            <Card.Header className="flex items-center gap-3 pb-4">
              <Surface className="p-2 rounded-lg bg-accent/10">
                <FaStore className="w-5 h-5 text-accent" />
              </Surface>
              <Card.Title className="text-xl font-bold">Toko</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">
                  Nama Toko
                </label>
                <input
                  type="text"
                  defaultValue="Kadara Store"
                  className="px-4 py-2 rounded-lg border border-separator bg-field-background text-field-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">
                  Alamat
                </label>
                <textarea
                  defaultValue="Jl. Contoh No. 123, Jakarta"
                  rows={3}
                  className="px-4 py-2 rounded-lg border border-separator bg-field-background text-field-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>
              <Button
                variant="primary"
                className="bg-accent text-accent-foreground w-fit"
              >
                Simpan Perubahan
              </Button>
            </Card.Content>
          </Card>

          <Card variant="default" className="p-6">
            <Card.Header className="flex items-center gap-3 pb-4">
              <Surface className="p-2 rounded-lg bg-accent/10">
                <FaBell className="w-5 h-5 text-accent" />
              </Surface>
              <Card.Title className="text-xl font-bold">Notifikasi</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Notifikasi Email
                  </p>
                  <p className="text-sm text-muted">
                    Terima notifikasi melalui email
                  </p>
                </div>
                <Switch defaultSelected />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Notifikasi Stok Menipis
                  </p>
                  <p className="text-sm text-muted">
                    Dapatkan peringatan saat stok produk menipis
                  </p>
                </div>
                <Switch defaultSelected />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Notifikasi Transaksi
                  </p>
                  <p className="text-sm text-muted">
                    Terima notifikasi untuk setiap transaksi baru
                  </p>
                </div>
                <Switch />
              </div>
            </Card.Content>
          </Card>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card variant="default" className="p-6">
            <Card.Header className="pb-4">
              <Card.Title className="text-lg font-bold">Menu Cepat</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start">
                <FaPalette className="w-4 h-4 mr-2" />
                Tema
              </Button>
              <Button variant="ghost" className="justify-start">
                <FaShield className="w-4 h-4 mr-2" />
                Keamanan
              </Button>
              <Button variant="ghost" className="justify-start">
                <FaGear className="w-4 h-4 mr-2" />
                Umum
              </Button>
            </Card.Content>
          </Card>

          <Card variant="default" className="p-6">
            <Card.Header className="pb-4">
              <Card.Title className="text-lg font-bold">Informasi</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-3">
              <div>
                <p className="text-sm text-muted">Versi Aplikasi</p>
                <p className="font-medium text-foreground">v1.0.0</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted">Terakhir Diupdate</p>
                <p className="font-medium text-foreground">17 Apr 2026</p>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PengaturanPage;
