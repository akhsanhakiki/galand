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
import type {
  User,
  Organization,
  OrganizationCreate,
  OrganizationUpdate,
  OrganizationMember,
  OrganizationMemberCreate,
  OrganizationMemberUpdate,
} from "../../utils/api/types";
import {
  getUsers,
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationMembers,
  addOrganizationMember,
  updateOrganizationMember,
  removeOrganizationMember,
} from "../../utils/api";

const APP_VERSION = "0.0.1";

const PengaturanPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // User management state (used for organization member selection)
  const [users, setUsers] = useState<User[]>([]);

  // Organization management state
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationsLoading, setOrganizationsLoading] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([]);
  const [orgMembersLoading, setOrgMembersLoading] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isEditOrgModalOpen, setIsEditOrgModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [orgForm, setOrgForm] = useState<OrganizationCreate>({
    name: "",
    logo: "",
    metadata: "",
  });
  const [memberForm, setMemberForm] = useState<OrganizationMemberCreate>({
    userId: "",
    role: "admin",
  });
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [editingOrgForm, setEditingOrgForm] = useState<OrganizationUpdate>({});
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberRole, setEditingMemberRole] = useState<string>("admin");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers(0, 10);
      setUsers(data);
    } catch (error) {
      // Error handling
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      fetchOrganizationMembers(selectedOrgId);
    }
  }, [selectedOrgId]);

  // Organization functions
  const fetchOrganizations = async () => {
    setOrganizationsLoading(true);
    try {
      const data = await getOrganizations(0, 100);
      setOrganizations(data);
      if (data.length > 0 && !selectedOrgId) {
        const firstOrgId = data[0].id;
        setSelectedOrgId(firstOrgId);
        fetchOrganizationMembers(firstOrgId);
      }
    } catch (error) {
      // Error handling
    } finally {
      setOrganizationsLoading(false);
    }
  };

  const fetchOrganizationMembers = async (organizationId: string) => {
    setOrgMembersLoading(true);
    try {
      const data = await getOrganizationMembers(organizationId);
      setOrgMembers(data);
    } catch (error) {
      // Error handling
    } finally {
      setOrgMembersLoading(false);
    }
  };

  const handleOpenEditOrganization = async (org: Organization) => {
    setEditingOrgId(org.id);
    setEditingOrgForm({
      name: org.name,
      logo: org.logo || "",
      metadata: org.metadata || "",
    });
    setIsEditOrgModalOpen(true);

    try {
      const latest = await getOrganization(org.id);
      setEditingOrgForm({
        name: latest.name,
        logo: latest.logo || "",
        metadata: latest.metadata || "",
      });
    } catch (error) {
      // Error handling
    }
  };

  const handleCreateOrganization = async () => {
    if (!orgForm.name) {
      return;
    }
    try {
      await createOrganization(orgForm);
      setIsOrgModalOpen(false);
      setOrgForm({ name: "", logo: "", metadata: "" });
      fetchOrganizations();
    } catch (error) {
      // Error handling
    }
  };

  const handleUpdateOrganization = async (orgId: string) => {
    try {
      await updateOrganization(orgId, editingOrgForm);
      setEditingOrgId(null);
      setEditingOrgForm({});
      setIsEditOrgModalOpen(false);
      fetchOrganizations();
    } catch (error) {
      // Error handling
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus toko ini?")) {
      return;
    }
    try {
      await deleteOrganization(orgId);
      if (selectedOrgId === orgId) {
        setSelectedOrgId(null);
        setOrgMembers([]);
      }
      fetchOrganizations();
    } catch (error) {
      // Error handling
    }
  };

  const handleAddMember = async () => {
    if (!selectedOrgId || !memberForm.userId) {
      return;
    }
    try {
      await addOrganizationMember(selectedOrgId, memberForm);
      setIsMemberModalOpen(false);
      setMemberForm({ userId: "", role: "admin" });
      fetchOrganizationMembers(selectedOrgId);
    } catch (error) {
      // Error handling
    }
  };

  const handleUpdateMember = async (memberId: string) => {
    if (!selectedOrgId) {
      return;
    }
    try {
      await updateOrganizationMember(selectedOrgId, memberId, {
        role: editingMemberRole,
      });
      setEditingMemberId(null);
      setEditingMemberRole("admin");
      fetchOrganizationMembers(selectedOrgId);
    } catch (error) {
      // Error handling
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedOrgId) {
      return;
    }
    if (!confirm("Apakah Anda yakin ingin menghapus anggota ini?")) {
      return;
    }
    try {
      await removeOrganizationMember(selectedOrgId, memberId);
      fetchOrganizationMembers(selectedOrgId);
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
              className="w-fit *:h-7 *:w-fit *:px-3 *:text-xs *:font-normal"
            >
              <Tabs.Tab id="profil">
                Profil
                <Tabs.Indicator />
              </Tabs.Tab>
              {user?.role === "admin" && (
                <Tabs.Tab id="toko">
                  Toko
                  <Tabs.Indicator />
                </Tabs.Tab>
              )}
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
          {user?.role === "admin" && (
            <Tabs.Panel id="toko">
              <div className="flex flex-col gap-4 text-left h-full">
              <div className="flex flex-row gap-4 flex-1 min-h-0 overflow-hidden">
                {/* First Column: Organizations List */}
                <div className="flex flex-col w-1/3 min-w-0 border-r border-gray-200/50 pr-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-foreground">Toko</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs px-2"
                      onPress={() => setIsOrgModalOpen(true)}
                    >
                      <LuUserPlus className="w-3 h-3" />
                      <span className="text-[10px]">Tambah Toko</span>
                    </Button>
                  </div>
                  {organizationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-sm text-muted">Memuat...</p>
                    </div>
                  ) : organizations.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-sm text-muted">Tidak ada toko</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 overflow-y-auto flex-1">
                      {organizations.map((org) => (
                        <div
                          key={org.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedOrgId === org.id
                              ? "border-accent bg-accent/10"
                              : "border-gray-200/50 bg-surface hover:bg-default/50"
                          }`}
                          onClick={() => setSelectedOrgId(org.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {org.logo && (
                                <img
                                  src={org.logo}
                                  alt={org.name}
                                  className="w-8 h-8 rounded"
                                />
                              )}
                              <div className="flex flex-col min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {org.name}
                                </p>
                                <p className="text-[10px] text-muted truncate">
                                  {org.slug}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 min-w-7 p-0"
                                onClick={(e) => e.stopPropagation()}
                                onPress={() => handleOpenEditOrganization(org)}
                              >
                                <LuPencil className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-danger h-7 w-7 min-w-7 p-0"
                                onClick={(e) => e.stopPropagation()}
                                onPress={() => handleDeleteOrganization(org.id)}
                              >
                                <LuTrash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          {org.metadata && (
                            <p className="text-[10px] text-muted mt-2 truncate">
                              {org.metadata}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Second Column: Members List */}
                <div className="flex flex-col flex-1 min-w-0">
                  {selectedOrgId ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-foreground">
                          Anggota
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs px-2"
                          onPress={() => setIsMemberModalOpen(true)}
                        >
                          <LuUserPlus className="w-3 h-3" />
                          <span className="text-[10px]">Tambah Anggota</span>
                        </Button>
                      </div>
                      {orgMembersLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <p className="text-sm text-muted">
                            Memuat anggota...
                          </p>
                        </div>
                      ) : orgMembers.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                          <p className="text-sm text-muted">
                            Tidak ada anggota
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 overflow-y-auto flex-1">
                          {orgMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-3 rounded-lg border border-gray-200/50 bg-surface"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {member.user.image && (
                                  <img
                                    src={member.user.image}
                                    alt={member.user.name}
                                    className="w-8 h-8 rounded-full"
                                  />
                                )}
                                <div className="flex flex-col min-w-0 flex-1">
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {member.user.name}
                                  </p>
                                  <p className="text-[10px] text-muted truncate">
                                    {member.user.email}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {editingMemberId === member.id ? (
                                  <div className="flex items-center gap-1.5">
                                    <Select
                                      selectedKey={editingMemberRole}
                                      onSelectionChange={(key) => {
                                        setEditingMemberRole(key as string);
                                      }}
                                      className="w-24"
                                    >
                                      <Select.Trigger className="h-7 text-xs">
                                        <Select.Value />
                                        <Select.Indicator />
                                      </Select.Trigger>
                                      <Select.Popover>
                                        <ListBox>
                                          <ListBox.Item
                                            key="admin"
                                            id="admin"
                                            textValue="admin"
                                          >
                                            Admin
                                            <ListBox.ItemIndicator />
                                          </ListBox.Item>
                                          <ListBox.Item
                                            key="user"
                                            id="user"
                                            textValue="user"
                                          >
                                            User
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
                                        handleUpdateMember(member.id)
                                      }
                                    >
                                      Simpan
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-xs px-2"
                                      onPress={() => {
                                        setEditingMemberId(null);
                                        setEditingMemberRole("admin");
                                      }}
                                    >
                                      Batal
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-medium">
                                      {member.role}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 min-w-7 p-0"
                                      onPress={() => {
                                        setEditingMemberId(member.id);
                                        setEditingMemberRole(member.role);
                                      }}
                                    >
                                      <LuPencil className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-danger h-7 w-7 min-w-7 p-0"
                                      onPress={() =>
                                        handleRemoveMember(member.id)
                                      }
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
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted">
                        Pilih toko untuk melihat anggota
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </Tabs.Panel>
          )}

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

      {/* Create Organization Modal */}
      <Modal.Backdrop isOpen={isOrgModalOpen} onOpenChange={setIsOrgModalOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Tambah Toko Baru</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                <TextField
                  value={orgForm.name}
                  onChange={(value) => setOrgForm({ ...orgForm, name: value })}
                >
                  <Label className="text-xs font-medium">Nama Toko</Label>
                  <InputGroup className="shadow-none border">
                    <InputGroup.Input />
                  </InputGroup>
                </TextField>
                <TextField
                  value={orgForm.logo || ""}
                  onChange={(value) => setOrgForm({ ...orgForm, logo: value })}
                >
                  <Label className="text-xs font-medium">Logo URL</Label>
                  <InputGroup className="shadow-none border">
                    <InputGroup.Input />
                  </InputGroup>
                </TextField>
                <TextField
                  value={orgForm.metadata || ""}
                  onChange={(value) =>
                    setOrgForm({ ...orgForm, metadata: value })
                  }
                >
                  <Label className="text-xs font-medium">Metadata</Label>
                  <TextArea rows={3} className="shadow-none border" />
                </TextField>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onPress={() => setIsOrgModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                className="bg-accent text-accent-foreground"
                onPress={handleCreateOrganization}
              >
                Tambah
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      {/* Edit Organization Modal */}
      <Modal.Backdrop
        isOpen={isEditOrgModalOpen}
        onOpenChange={(open) => {
          setIsEditOrgModalOpen(open);
          if (!open) {
            setEditingOrgId(null);
            setEditingOrgForm({});
          }
        }}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Edit Toko</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                <TextField
                  value={editingOrgForm.name || ""}
                  onChange={(value) =>
                    setEditingOrgForm({ ...editingOrgForm, name: value })
                  }
                >
                  <Label className="text-xs font-medium">Nama Toko</Label>
                  <InputGroup className="shadow-none border">
                    <InputGroup.Input />
                  </InputGroup>
                </TextField>
                <TextField
                  value={(editingOrgForm.logo as string) || ""}
                  onChange={(value) =>
                    setEditingOrgForm({ ...editingOrgForm, logo: value })
                  }
                >
                  <Label className="text-xs font-medium">Logo URL</Label>
                  <InputGroup className="shadow-none border">
                    <InputGroup.Input />
                  </InputGroup>
                </TextField>
                <TextField
                  value={(editingOrgForm.metadata as string) || ""}
                  onChange={(value) =>
                    setEditingOrgForm({ ...editingOrgForm, metadata: value })
                  }
                >
                  <Label className="text-xs font-medium">Metadata</Label>
                  <TextArea rows={3} className="shadow-none border" />
                </TextField>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="ghost"
                onPress={() => setIsEditOrgModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                className="bg-accent text-accent-foreground"
                isDisabled={
                  !editingOrgId || !(editingOrgForm.name || "").trim()
                }
                onPress={() => {
                  if (!editingOrgId) return;
                  handleUpdateOrganization(editingOrgId);
                }}
              >
                Simpan
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      {/* Add Member Modal */}
      <Modal.Backdrop
        isOpen={isMemberModalOpen}
        onOpenChange={setIsMemberModalOpen}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Tambah Anggota</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                <Select
                  placeholder="Pilih pengguna"
                  selectedKey={memberForm.userId}
                  onSelectionChange={(key) => {
                    setMemberForm({
                      ...memberForm,
                      userId: key as string,
                    });
                  }}
                >
                  <Label className="text-xs font-medium">Pengguna</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {users.map((user) => (
                        <ListBox.Item
                          key={user.id}
                          id={user.id}
                          textValue={user.name}
                        >
                          <div className="flex items-center gap-2">
                            {user.image && (
                              <img
                                src={user.image}
                                alt={user.name}
                                className="w-6 h-6 rounded-full"
                              />
                            )}
                            <div>
                              <p className="text-sm">{user.name}</p>
                              <p className="text-xs text-muted">{user.email}</p>
                            </div>
                          </div>
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
                <Select
                  selectedKey={memberForm.role}
                  onSelectionChange={(key) => {
                    setMemberForm({
                      ...memberForm,
                      role: key as string,
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
                      <ListBox.Item key="admin" id="admin" textValue="admin">
                        Admin
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item key="user" id="user" textValue="user">
                        User
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
                onPress={() => setIsMemberModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                className="bg-accent text-accent-foreground"
                onPress={handleAddMember}
              >
                Tambah
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
};

export default PengaturanPage;
