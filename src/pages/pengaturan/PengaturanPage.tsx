"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Switch,
  Separator,
  Tabs,
  RadioGroup,
  Radio,
  Label,
  Description,
  TextField,
  InputGroup,
  TextArea,
} from "@heroui/react";
import { LuSun, LuMoon, LuMonitor } from "react-icons/lu";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "next-themes";

const APP_VERSION = "0.0.1";

const PengaturanPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get current theme for display
  const currentTheme = mounted
    ? theme === "system"
      ? systemTheme
      : theme
    : "light";
  const displayTheme = mounted ? theme : "system";

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-bold text-foreground">Pengaturan</h1>
        <p className="text-muted text-xs">
          Kelola pengaturan aplikasi dan preferensi Anda
        </p>
      </div>

      <div className="bg-surface rounded-3xl p-6 flex-1 flex flex-col min-h-0">
        <Tabs
          defaultSelectedKey="profil"
          className="w-full gap-4 flex-1 flex flex-col"
        >
          <Tabs.ListContainer>
            <Tabs.List
              aria-label="Pengaturan"
              className="w-fit *:h-8 *:w-fit *:px-4 *:text-xs *:font-normal"
            >
              <Tabs.Tab id="profil">
                Profil
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="toko">
                Toko
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="tema">
                Tema
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="notifikasi">
                Notifikasi
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="umum">
                Umum
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          {/* Profil Tab */}
          <Tabs.Panel id="profil">
            <div className="flex flex-col gap-3 text-left">
              <TextField
                value={authLoading ? "Loading..." : user?.name || ""}
                isReadOnly
                className="max-w-md"
              >
                <Label className="text-xs font-medium">Nama</Label>
                <InputGroup className="shadow-none border ">
                  <InputGroup.Input />
                </InputGroup>
              </TextField>
              <TextField
                type="email"
                value={authLoading ? "Loading..." : user?.email || ""}
                isReadOnly
                className="max-w-md"
              >
                <Label className="text-xs font-medium">Email</Label>
                <InputGroup className="shadow-none border ">
                  <InputGroup.Input />
                </InputGroup>
              </TextField>
              <TextField
                type="tel"
                defaultValue="+62 812 3456 7890"
                isReadOnly
                className="max-w-md"
              >
                <Label className="text-xs font-medium">Nomor Telepon</Label>
                <InputGroup className="shadow-none border ">
                  <InputGroup.Input />
                </InputGroup>
              </TextField>
            </div>
          </Tabs.Panel>

          {/* Toko Tab */}
          <Tabs.Panel id="toko">
            <div className="flex flex-col gap-3 text-left">
              <TextField defaultValue="Kadara Store" className="max-w-md">
                <Label className="text-xs font-medium">Nama Toko</Label>
                <InputGroup className="shadow-none border ">
                  <InputGroup.Input />
                </InputGroup>
              </TextField>
              <TextField
                defaultValue="Jl. Contoh No. 123, Jakarta"
                className="max-w-md"
              >
                <Label className="text-xs font-medium">Alamat</Label>
                <TextArea rows={3} className="shadow-none border " />
              </TextField>
              <Button
                variant="primary"
                className="bg-accent text-accent-foreground w-fit"
              >
                Simpan Perubahan
              </Button>
            </div>
          </Tabs.Panel>

          {/* Tema Tab */}
          <Tabs.Panel id="tema">
            <div className="flex flex-col gap-4 text-left">
              <RadioGroup
                value={displayTheme}
                onChange={(value) =>
                  setTheme(value as "light" | "dark" | "system")
                }
                name="theme"
              >
                <Label>Tema Aplikasi</Label>
                <Description>
                  Pilih tema yang sesuai dengan preferensi Anda
                </Description>
                <Radio value="light">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <div className="flex items-center gap-2">
                      <LuSun className="w-4 h-4" />
                      <div className="flex flex-col">
                        <Label>Terang</Label>
                        <Description>Gunakan tema terang</Description>
                      </div>
                    </div>
                  </Radio.Content>
                </Radio>
                <Radio value="dark">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <div className="flex items-center gap-2">
                      <LuMoon className="w-4 h-4" />
                      <div className="flex flex-col">
                        <Label>Gelap</Label>
                        <Description>Gunakan tema gelap</Description>
                      </div>
                    </div>
                  </Radio.Content>
                </Radio>
                <Radio value="system">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <div className="flex items-center gap-2">
                      <LuMonitor className="w-4 h-4" />
                      <div className="flex flex-col">
                        <Label>Sistem</Label>
                        <Description>Ikuti pengaturan sistem</Description>
                      </div>
                    </div>
                  </Radio.Content>
                </Radio>
              </RadioGroup>
              {mounted && (
                <div className="mt-2 p-3 rounded-lg bg-default/50">
                  <p className="text-xs text-muted">
                    Tema saat ini:{" "}
                    <span className="text-sm font-medium text-foreground capitalize">
                      {currentTheme === "dark" ? "Gelap" : "Terang"}
                      {displayTheme === "system" && " (Sistem)"}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </Tabs.Panel>

          {/* Notifikasi Tab */}
          <Tabs.Panel id="notifikasi">
            <div className="flex flex-col gap-4 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Notifikasi Email
                  </p>
                  <p className="text-xs text-muted">
                    Terima notifikasi melalui email
                  </p>
                </div>
                <Switch defaultSelected />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Notifikasi Stok Menipis
                  </p>
                  <p className="text-xs text-muted">
                    Dapatkan peringatan saat stok produk menipis
                  </p>
                </div>
                <Switch defaultSelected />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Notifikasi Transaksi
                  </p>
                  <p className="text-xs text-muted">
                    Terima notifikasi untuk setiap transaksi baru
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </Tabs.Panel>

          {/* Umum Tab */}
          <Tabs.Panel id="umum">
            <div className="flex flex-col gap-4 text-left">
              <div>
                <p className="text-xs text-muted">Versi Aplikasi</p>
                <p className="text-sm font-medium text-foreground">
                  v{APP_VERSION}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted">Terakhir Diupdate</p>
                <p className="text-sm font-medium text-foreground">
                  17 Apr 2026
                </p>
              </div>
            </div>
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};

export default PengaturanPage;
