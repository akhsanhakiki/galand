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
  Select,
  ListBox,
  Modal,
} from "@heroui/react";
import {
  LuSun,
  LuMoon,
  LuMonitor,
  LuUserPlus,
  LuTrash2,
  LuPencil,
} from "react-icons/lu";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "next-themes";
import type { User, UserCreate } from "../../utils/api/types";
import { getUsers, createUser, updateUser, deleteUser } from "../../utils/api";

const APP_VERSION = "0.0.1";

const PengaturanPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // User management state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<UserCreate>({
    email: "",
    name: "",
    role: "user",
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<"user" | "admin">("user");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await getUsers(0, 10);
      setUsers(data);
    } catch (error) {
      // Error handling
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInviteUser = async () => {
    if (!inviteForm.email || !inviteForm.name) {
      return;
    }
    try {
      await createUser(inviteForm);
      setIsInviteModalOpen(false);
      setInviteForm({ email: "", name: "", role: "user" });
      fetchUsers();
    } catch (error) {
      // Error handling
    }
  };

  const handleUpdateRole = async (
    userId: string,
    newRole: "user" | "admin"
  ) => {
    try {
      await updateUser(userId, { role: newRole });
      setEditingUserId(null);
      fetchUsers();
    } catch (error) {
      // Error handling
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      return;
    }
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (error) {
      // Error handling
    }
  };

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
              <Tabs.Tab id="pengguna">
                Pengguna
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

          {/* Pengguna Tab */}
          <Tabs.Panel id="pengguna">
            <div className="flex flex-col gap-4 text-left h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Daftar Pengguna
                  </p>
                  <p className="text-xs text-muted">
                    Kelola pengguna dan peran mereka
                  </p>
                </div>
                <Button
                  variant="primary"
                  className="bg-accent text-accent-foreground"
                  onPress={() => setIsInviteModalOpen(true)}
                  size="sm"
                >
                  <LuUserPlus className="w-3.5 h-3.5" />
                  <span className="text-xs">Undang Pengguna</span>
                </Button>
              </div>

              <Separator />

              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-muted">Memuat...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-muted">Tidak ada pengguna</p>
                </div>
              ) : (
                <div className="flex flex-col overflow-y-auto flex-1">
                  {users.map((u, index) => (
                    <div
                      key={u.id}
                      className={`flex items-center justify-between p-2 ${
                        index !== users.length - 1
                          ? "border-b border-gray-200/50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {u.image && (
                          <img
                            src={u.image}
                            alt={u.name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-muted truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {editingUserId === u.id ? (
                          <div className="flex items-center gap-1.5">
                            <Select
                              selectedKey={editingRole}
                              onSelectionChange={(key) => {
                                setEditingRole(key as "user" | "admin");
                              }}
                              className="w-28"
                            >
                              <Label className="text-[10px]">Peran</Label>
                              <Select.Trigger className="h-7 text-xs">
                                <Select.Value />
                                <Select.Indicator />
                              </Select.Trigger>
                              <Select.Popover>
                                <ListBox>
                                  <ListBox.Item
                                    key="user"
                                    id="user"
                                    textValue="user"
                                  >
                                    User
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                  <ListBox.Item
                                    key="admin"
                                    id="admin"
                                    textValue="admin"
                                  >
                                    Admin
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                </ListBox>
                              </Select.Popover>
                            </Select>
                            <Button
                              size="sm"
                              variant="primary"
                              className="bg-accent text-accent-foreground h-7 text-xs px-2"
                              onPress={() =>
                                handleUpdateRole(u.id, editingRole)
                              }
                            >
                              Simpan
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs px-2"
                              onPress={() => setEditingUserId(null)}
                            >
                              Batal
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-medium">
                              {u.role === "admin" ? "Admin" : "User"}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 min-w-7 p-0"
                              onPress={() => {
                                setEditingUserId(u.id);
                                setEditingRole(u.role);
                              }}
                            >
                              <LuPencil className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-danger h-7 w-7 min-w-7 p-0"
                              onPress={() => handleDeleteUser(u.id)}
                            >
                              <LuTrash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tabs.Panel>
        </Tabs>
      </div>

      {/* Invite User Modal */}
      <Modal.Backdrop
        isOpen={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Undang Pengguna Baru</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                <TextField
                  value={inviteForm.name}
                  onChange={(value) =>
                    setInviteForm({ ...inviteForm, name: value })
                  }
                >
                  <Label className="text-xs font-medium">Nama</Label>
                  <InputGroup className="shadow-none border">
                    <InputGroup.Input />
                  </InputGroup>
                </TextField>
                <TextField
                  type="email"
                  value={inviteForm.email}
                  onChange={(value) =>
                    setInviteForm({ ...inviteForm, email: value })
                  }
                >
                  <Label className="text-xs font-medium">Email</Label>
                  <InputGroup className="shadow-none border">
                    <InputGroup.Input />
                  </InputGroup>
                </TextField>
                <Select
                  selectedKey={inviteForm.role}
                  onSelectionChange={(key) => {
                    setInviteForm({
                      ...inviteForm,
                      role: key as "user" | "admin",
                    });
                  }}
                >
                  <Label className="text-xs font-medium">Peran</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item key="user" id="user" textValue="user">
                        User
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item key="admin" id="admin" textValue="admin">
                        Admin
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="ghost"
                onPress={() => setIsInviteModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                className="bg-accent text-accent-foreground"
                onPress={handleInviteUser}
              >
                Undang
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
};

export default PengaturanPage;
