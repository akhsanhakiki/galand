"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Button,
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
  LuChevronRight,
  LuChevronLeft,
  LuCamera,
  LuImage,
  LuStore,
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
  uploadOrganizationLogo,
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
    metadata: "",
  });
  const [pendingCreateLogo, setPendingCreateLogo] = useState<File | null>(null);
  const [createLogoPreview, setCreateLogoPreview] = useState<string | null>(
    null,
  );
  const createLogoBlobRef = useRef<string | null>(null);
  const createPhotoInputRef = useRef<HTMLInputElement>(null);
  const createCameraInputRef = useRef<HTMLInputElement>(null);
  const [pendingEditLogo, setPendingEditLogo] = useState<File | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);
  const [editingOrgDisplayLogoUrl, setEditingOrgDisplayLogoUrl] = useState<
    string | null
  >(null);
  const editLogoBlobRef = useRef<string | null>(null);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);
  const editCameraInputRef = useRef<HTMLInputElement>(null);
  const [memberForm, setMemberForm] = useState<OrganizationMemberCreate>({
    userId: "",
    role: "admin",
  });
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [editingOrgForm, setEditingOrgForm] = useState<OrganizationUpdate>({});
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingMemberRole, setEditingMemberRole] = useState<string>("admin");
  const [isMdUp, setIsMdUp] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsMdUp(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (isMdUp !== true || selectedOrgId || organizations.length === 0) {
      return;
    }
    setSelectedOrgId(organizations[0].id);
  }, [isMdUp, selectedOrgId, organizations]);

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
      metadata: org.metadata || "",
    });
    setEditingOrgDisplayLogoUrl(org.logo);
    if (editLogoBlobRef.current) {
      URL.revokeObjectURL(editLogoBlobRef.current);
      editLogoBlobRef.current = null;
    }
    setPendingEditLogo(null);
    setEditLogoPreview(null);
    setIsEditOrgModalOpen(true);

    try {
      const latest = await getOrganization(org.id);
      setEditingOrgForm({
        name: latest.name,
        metadata: latest.metadata || "",
      });
      setEditingOrgDisplayLogoUrl(latest.logo);
    } catch (error) {
      // Error handling
    }
  };

  const handleCreateLogoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const contentType = file.type || "";
    if (!contentType.startsWith("image/")) {
      alert("Pilih file gambar (PNG, JPG, WebP).");
      return;
    }
    if (createLogoBlobRef.current) {
      URL.revokeObjectURL(createLogoBlobRef.current);
      createLogoBlobRef.current = null;
    }
    const url = URL.createObjectURL(file);
    createLogoBlobRef.current = url;
    setCreateLogoPreview(url);
    setPendingCreateLogo(file);
  };

  const handleEditLogoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const contentType = file.type || "";
    if (!contentType.startsWith("image/")) {
      alert("Pilih file gambar (PNG, JPG, WebP).");
      return;
    }
    if (editLogoBlobRef.current) {
      URL.revokeObjectURL(editLogoBlobRef.current);
      editLogoBlobRef.current = null;
    }
    const url = URL.createObjectURL(file);
    editLogoBlobRef.current = url;
    setEditLogoPreview(url);
    setPendingEditLogo(file);
  };

  const handleCreateOrganization = async () => {
    if (!orgForm.name) {
      return;
    }
    try {
      const created = await createOrganization({
        name: orgForm.name.trim(),
        ...(orgForm.metadata?.trim() ? { metadata: orgForm.metadata } : {}),
      });
      if (pendingCreateLogo) {
        await uploadOrganizationLogo(created.id, pendingCreateLogo);
      }
      if (createLogoBlobRef.current) {
        URL.revokeObjectURL(createLogoBlobRef.current);
        createLogoBlobRef.current = null;
      }
      setPendingCreateLogo(null);
      setCreateLogoPreview(null);
      setIsOrgModalOpen(false);
      setOrgForm({ name: "", metadata: "" });
      fetchOrganizations();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menambah toko");
    }
  };

  const handleUpdateOrganization = async (orgId: string) => {
    try {
      await updateOrganization(orgId, {
        name: (editingOrgForm.name || "").trim(),
        metadata: editingOrgForm.metadata ?? "",
      });
      if (pendingEditLogo) {
        await uploadOrganizationLogo(orgId, pendingEditLogo);
      }
      if (editLogoBlobRef.current) {
        URL.revokeObjectURL(editLogoBlobRef.current);
        editLogoBlobRef.current = null;
      }
      setPendingEditLogo(null);
      setEditLogoPreview(null);
      setEditingOrgId(null);
      setEditingOrgForm({});
      setIsEditOrgModalOpen(false);
      fetchOrganizations();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal memperbarui toko");
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

  const selectedOrganization =
    selectedOrgId === null
      ? undefined
      : organizations.find((o) => o.id === selectedOrgId);

  return (
    <div className="flex flex-col w-full h-full gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="hidden md:block text-lg font-bold text-foreground">
          Pengaturan
        </h1>
        <p className="hidden md:block text-muted text-xs">
          Kelola pengaturan aplikasi dan preferensi Anda
        </p>
      </div>

      <div className="bg-surface rounded-3xl p-4 flex-1 flex flex-col min-h-0">
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
                Lainnya
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
              <div className="flex flex-col gap-4 text-left h-full flex-1 min-h-0">
                <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0 overflow-hidden">
                  {/* First Column: Organizations List */}
                  <div
                    className={`flex flex-col w-full md:w-1/3 min-w-0 md:border-r md:border-gray-200/50 md:pr-4 min-h-0 ${
                      selectedOrgId ? "hidden md:flex" : "flex"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-foreground">
                        Toko
                      </p>
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
                                {org.logo ? (
                                  <img
                                    src={org.logo}
                                    alt={org.name}
                                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <LuStore className="w-6 h-6 text-primary" />
                                  </div>
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
                                  onPress={() =>
                                    handleOpenEditOrganization(org)
                                  }
                                >
                                  <LuPencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-danger h-7 w-7 min-w-7 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                  onPress={() =>
                                    handleDeleteOrganization(org.id)
                                  }
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
                  <div
                    className={`flex flex-col flex-1 min-w-0 min-h-0 ${
                      selectedOrgId ? "flex" : "hidden md:flex"
                    }`}
                  >
                    {selectedOrgId ? (
                      <>
                        <nav
                          className="md:hidden flex items-center gap-1 text-xs shrink-0 mb-3 -mt-1"
                          aria-label="Navigasi toko"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 -ml-2 gap-1 min-w-0"
                            onPress={() => setSelectedOrgId(null)}
                          >
                            <LuChevronLeft className="w-4 h-4 shrink-0" />
                            <span className="text-muted">Toko</span>
                          </Button>
                          <LuChevronRight
                            className="w-3 h-3 shrink-0 text-muted opacity-80"
                            aria-hidden
                          />
                          <span className="text-foreground font-medium truncate min-w-0">
                            {organizations.find((o) => o.id === selectedOrgId)
                              ?.name ?? "Toko"}
                          </span>
                        </nav>
                        {selectedOrganization ? (
                          <div className="shrink-0 mb-4">
                            <div className="flex gap-4 md:gap-5">
                              <div className="h-36 w-36 sm:h-40 sm:w-40 md:h-44 md:w-44 shrink-0 overflow-hidden rounded-2xl border border-separator bg-surface">
                                {selectedOrganization.logo ? (
                                  <img
                                    src={selectedOrganization.logo}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                    <LuStore className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 text-primary" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1 flex flex-col gap-1 justify-center">
                                <p className="text-base md:text-lg font-semibold text-foreground leading-tight">
                                  {selectedOrganization.name}
                                </p>
                                <p className="text-[11px] text-muted font-mono truncate">
                                  {selectedOrganization.slug}
                                </p>
                                {selectedOrganization.metadata?.trim() ? (
                                  <p className="text-xs md:text-sm text-muted mt-1 whitespace-pre-wrap wrap-break-word line-clamp-6 md:line-clamp-none">
                                    {selectedOrganization.metadata}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ) : null}
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

          {/* Lainnya Tab */}
          <Tabs.Panel id="notifikasi">
            <div className="flex flex-col gap-4 text-left">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted">Versi Aplikasi</p>
                <p className="text-sm font-medium text-foreground">
                  v{APP_VERSION}
                </p>
              </div>
              <Separator />
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted">Terakhir Diupdate</p>
                <p className="text-sm font-medium text-foreground">
                  25 Januari 2026
                </p>
              </div>
            </div>
          </Tabs.Panel>
        </Tabs>
      </div>

      {/* Create Organization Modal */}
      <Modal.Backdrop
        isOpen={isOrgModalOpen}
        onOpenChange={(open) => {
          setIsOrgModalOpen(open);
          if (!open) {
            if (createLogoBlobRef.current) {
              URL.revokeObjectURL(createLogoBlobRef.current);
              createLogoBlobRef.current = null;
            }
            setPendingCreateLogo(null);
            setCreateLogoPreview(null);
          }
        }}
      >
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
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium">Logo Toko</Label>
                  <div className="flex flex-col gap-3 w-full">
                    <div className="mx-auto flex w-full max-w-[min(100%,18rem)] sm:max-w-[min(100%,22rem)] aspect-square rounded-2xl border border-separator bg-foreground/5 overflow-hidden">
                      {createLogoPreview ? (
                        <img
                          src={createLogoPreview}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-muted text-center px-2">
                          Belum ada logo
                        </div>
                      )}
                    </div>
                    <input
                      ref={createPhotoInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleCreateLogoSelected}
                    />
                    <input
                      ref={createCameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={handleCreateLogoSelected}
                    />
                    <div className="flex flex-row justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onPress={() => createPhotoInputRef.current?.click()}
                      >
                        <LuImage className="w-3.5 h-3.5 shrink-0" />
                        Unggah foto
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onPress={() => createCameraInputRef.current?.click()}
                      >
                        <LuCamera className="w-3.5 h-3.5 shrink-0" />
                        Ambil foto
                      </Button>
                    </div>
                  </div>
                </div>
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
        className="z-200"
        onOpenChange={(open) => {
          setIsEditOrgModalOpen(open);
          if (!open) {
            if (editLogoBlobRef.current) {
              URL.revokeObjectURL(editLogoBlobRef.current);
              editLogoBlobRef.current = null;
            }
            setPendingEditLogo(null);
            setEditLogoPreview(null);
            setEditingOrgDisplayLogoUrl(null);
            setEditingOrgId(null);
            setEditingOrgForm({});
          }
        }}
      >
        <Modal.Container className="z-200">
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
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium">Logo Toko</Label>
                  <div className="flex flex-col gap-3">
                    <div className="mx-auto w-full max-w-[min(100%,18rem)] sm:max-w-[min(100%,22rem)] aspect-square rounded-2xl border border-separator bg-foreground/5 overflow-hidden">
                      {editLogoPreview || editingOrgDisplayLogoUrl ? (
                        <img
                          src={
                            editLogoPreview ?? editingOrgDisplayLogoUrl ?? ""
                          }
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-muted text-center px-2">
                          Belum ada logo
                        </div>
                      )}
                    </div>
                    <input
                      ref={editPhotoInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleEditLogoSelected}
                    />
                    <input
                      ref={editCameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={handleEditLogoSelected}
                    />
                    <div className="flex flex-row justify-start gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onPress={() => editPhotoInputRef.current?.click()}
                      >
                        <LuImage className="w-3.5 h-3.5 shrink-0" />
                        Unggah foto
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onPress={() => editCameraInputRef.current?.click()}
                      >
                        <LuCamera className="w-3.5 h-3.5 shrink-0" />
                        Ambil foto
                      </Button>
                    </div>
                  </div>
                </div>
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
