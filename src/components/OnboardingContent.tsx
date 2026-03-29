"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  TextField,
  Label,
  InputGroup,
  TextArea,
  Spinner,
  Select,
  ListBox,
  Surface,
} from "@heroui/react";
import {
  LuStore,
  LuUsers,
  LuSparkles,
  LuCheck,
  LuCamera,
  LuImage,
} from "react-icons/lu";
import { useOrganization } from "../contexts/OrganizationContext";
import { useAuth } from "../contexts/AuthContext";
import {
  createOrganization,
  addOrganizationMember,
  getOrganizations,
  uploadOrganizationLogo,
} from "../utils/api/organizations";
import { updateUser } from "../utils/api/users";
import { getUsers } from "../utils/api/users";
import type { User } from "../utils/api/types";

type OnboardingStep = "welcome" | "create-toko" | "invite-user";

export default function OnboardingContent() {
  const { user } = useAuth();
  const {
    refreshOrganizations,
    currentOrganization,
    setCurrentOrganization,
    organizations,
  } = useOrganization();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgCreated, setOrgCreated] = useState(false);

  // Create toko form state
  const [orgForm, setOrgForm] = useState({
    name: "",
    metadata: "",
  });
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoBlobRef = useRef<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Invite user form state
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users for invite step
  useEffect(() => {
    if (step === "invite-user") {
      fetchUsers();
    }
  }, [step]);

  // Watch for organization to be set after creation
  useEffect(() => {
    if (orgCreated && step === "create-toko") {
      // Organization was created, check if it's available
      if (currentOrganization) {
        // Organization is available, move to invite step
        setStep("invite-user");
        setOrgCreated(false);
      } else if (organizations.length > 0) {
        // Organization exists in list but not set as current, set it as active
        const newOrg = organizations[0];
        setCurrentOrganization(newOrg)
          .then(() => {
            setStep("invite-user");
            setOrgCreated(false);
          })
          .catch(() => {
            // If setting fails, still move to invite step
            setStep("invite-user");
            setOrgCreated(false);
          });
      }
    }
  }, [
    currentOrganization,
    organizations,
    step,
    orgCreated,
    setCurrentOrganization,
  ]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getUsers(0, 100);
      // Filter out current user
      const filteredUsers = data.filter((u) => u.id !== user?.id);
      setUsers(filteredUsers);
    } catch (error) {
      setError("Gagal memuat daftar pengguna");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleLogoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const contentType = file.type || "";
    if (!contentType.startsWith("image/")) {
      setError("Pilih file gambar (PNG, JPG, WebP).");
      return;
    }
    if (logoBlobRef.current) {
      URL.revokeObjectURL(logoBlobRef.current);
      logoBlobRef.current = null;
    }
    const url = URL.createObjectURL(file);
    logoBlobRef.current = url;
    setLogoPreview(url);
    setPendingLogo(file);
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (logoBlobRef.current) {
        URL.revokeObjectURL(logoBlobRef.current);
      }
    };
  }, []);

  const handleCreateToko = async () => {
    if (!orgForm.name.trim()) {
      setError("Nama toko wajib diisi");
      return;
    }

    if (!user?.id) {
      setError("User tidak ditemukan");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create organization via API
      const newOrg = await createOrganization({
        name: orgForm.name,
        ...(orgForm.metadata?.trim() ? { metadata: orgForm.metadata } : {}),
      });
      if (pendingLogo) {
        await uploadOrganizationLogo(newOrg.id, pendingLogo);
      }

      // Update user role to admin
      await updateUser(user.id, { role: "admin" });

      // Refresh organizations to get the newly created org
      await refreshOrganizations();

      // Wait a bit for the organization to be available in Neon Auth
      // Then set it as active
      let retries = 0;
      const maxRetries = 10;
      let success = false;

      while (retries < maxRetries && !success) {
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Fetch organizations from API to check if the new org is available
        const orgs = await getOrganizations(0, 100);
        const createdOrg = orgs.find(
          (org) => org.id === newOrg.id || org.name === orgForm.name,
        );

        if (createdOrg) {
          // Convert to NeonOrganization format
          let metadata: Record<string, any> | null = null;
          try {
            if (createdOrg.metadata) {
              metadata =
                typeof createdOrg.metadata === "string"
                  ? JSON.parse(createdOrg.metadata)
                  : createdOrg.metadata;
            }
          } catch {
            metadata = null;
          }

          const neonOrg = {
            id: createdOrg.id,
            name: createdOrg.name,
            slug: createdOrg.slug,
            logo: createdOrg.logo,
            metadata,
            createdAt: createdOrg.createdAt,
          };

          // Set as active organization
          await setCurrentOrganization(neonOrg);
          // Refresh again to get the full organization with members
          await refreshOrganizations();
          success = true;
        }
        retries++;
      }

      // Mark that organization creation is complete
      // The useEffect will automatically move to invite step when currentOrganization is set
      setOrgCreated(true);
    } catch (error) {
      setError("Gagal membuat toko. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInviteUser = async () => {
    if (!selectedUserId) {
      setError("Pilih pengguna yang ingin diundang");
      return;
    }

    if (!currentOrganization) {
      setError("Toko tidak ditemukan");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addOrganizationMember(currentOrganization.id, {
        userId: selectedUserId,
        role: "user",
      });

      // Onboarding complete - redirect to ringkasan
      window.location.href = "/ringkasan";
    } catch (error) {
      setError("Gagal mengundang pengguna. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipInvite = () => {
    // Skip invite step - onboarding complete, redirect to ringkasan
    window.location.href = "/ringkasan";
  };

  return (
    <Surface className="p-6 rounded-3xl h-full flex flex-col">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {step === "welcome" && "Selamat Datang di Kadara"}
            {step === "create-toko" && "Buat Toko Pertama Anda"}
            {step === "invite-user" && "Undang Anggota Tim"}
          </h2>
        </div>

        <div>
          {step === "welcome" && (
            <div className="flex flex-col gap-6 py-4">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <LuSparkles className="w-10 h-10 text-primary" />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold text-foreground">
                    Kadara - Sistem Manajemen Toko Anda
                  </h2>
                  <p className="text-sm text-muted">
                    Kelola toko Anda dengan mudah dan efisien
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <LuStore className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      Kelola Produk & Stok
                    </h3>
                    <p className="text-xs text-muted">
                      Tambah, edit, dan kelola produk dengan mudah. Pantau stok
                      secara real-time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <LuUsers className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      Kelola Tim & Anggota
                    </h3>
                    <p className="text-xs text-muted">
                      Undang anggota tim dan atur peran mereka dengan mudah.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <LuCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      Laporan & Analitik
                    </h3>
                    <p className="text-xs text-muted">
                      Pantau penjualan, profit, dan pengeluaran dengan dashboard
                      yang informatif.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "create-toko" && (
            <div className="flex flex-col gap-4 py-2">
              {error && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              <TextField
                value={orgForm.name}
                onChange={(value) => {
                  setOrgForm({ ...orgForm, name: value });
                  setError(null);
                }}
                isRequired
              >
                <Label className="text-xs font-medium">Nama Toko</Label>
                <InputGroup className="shadow-none border">
                  <InputGroup.Input placeholder="Masukkan nama toko Anda" />
                </InputGroup>
              </TextField>

              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium">
                  Logo Toko (Opsional)
                </Label>
                <div className="flex flex-col gap-3 w-full">
                  <div className="mx-auto flex w-full max-w-[min(100%,18rem)] sm:max-w-[min(100%,22rem)] aspect-square rounded-2xl border border-separator bg-foreground/5 overflow-hidden">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
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
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleLogoSelected}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={handleLogoSelected}
                  />
                  <div className="flex flex-row justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      isDisabled={isSubmitting}
                      onPress={() => photoInputRef.current?.click()}
                    >
                      <LuImage className="w-3.5 h-3.5 shrink-0" />
                      Unggah foto
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      isDisabled={isSubmitting}
                      onPress={() => cameraInputRef.current?.click()}
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
                <Label className="text-xs font-medium">
                  Deskripsi (Opsional)
                </Label>
                <TextArea
                  rows={3}
                  className="shadow-none border"
                  placeholder="Deskripsi toko Anda"
                />
              </TextField>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted">
                  Setelah membuat toko, Anda akan menjadi admin dan dapat
                  mengundang anggota tim.
                </p>
              </div>
            </div>
          )}

          {step === "invite-user" && (
            <div className="flex flex-col gap-4 py-2">
              {error && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <LuCheck className="w-4 h-4 text-success" />
                  <p className="text-sm font-medium text-success">
                    Toko berhasil dibuat!
                  </p>
                </div>
                <p className="text-xs text-muted">
                  Sekarang Anda dapat mengundang anggota tim ke toko Anda.
                </p>
              </div>

              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="sm" />
                </div>
              ) : (
                <>
                  {users.length > 0 ? (
                    <Select
                      selectedKey={selectedUserId}
                      onSelectionChange={(key) => {
                        setSelectedUserId(key as string);
                        setError(null);
                      }}
                      placeholder="Pilih pengguna yang ingin diundang"
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
                                  <p className="text-xs text-muted">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  ) : (
                    <div className="p-4 rounded-lg bg-default-100 text-center">
                      <p className="text-sm text-muted">
                        Tidak ada pengguna lain yang dapat diundang.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {step === "welcome" && (
            <Button
              variant="primary"
              className="bg-accent text-accent-foreground w-full"
              onPress={() => setStep("create-toko")}
            >
              Buat Toko
            </Button>
          )}

          {step === "create-toko" && (
            <>
              <Button
                variant="ghost"
                onPress={() => setStep("welcome")}
                isDisabled={isSubmitting}
              >
                Kembali
              </Button>
              <Button
                variant="primary"
                className="bg-accent text-accent-foreground flex-1"
                onPress={handleCreateToko}
                isDisabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Membuat...
                  </>
                ) : (
                  "Buat Toko"
                )}
              </Button>
            </>
          )}

          {step === "invite-user" && (
            <>
              <Button
                variant="ghost"
                onPress={handleSkipInvite}
                isDisabled={isSubmitting}
              >
                Lewati
              </Button>
              <Button
                variant="primary"
                className="bg-accent text-accent-foreground flex-1"
                onPress={handleInviteUser}
                isDisabled={isSubmitting || !selectedUserId}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Mengundang...
                  </>
                ) : (
                  "Undang"
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </Surface>
  );
}
