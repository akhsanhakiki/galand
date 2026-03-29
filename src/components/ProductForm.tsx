"use client";

import {
  Button,
  Input,
  Label,
  Modal,
  NumberField,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { LuCamera, LuImage } from "react-icons/lu";
import type { Product, ProductCreate, ProductUpdate } from "../utils/api";
import { createProduct, updateProduct, uploadProductPhoto } from "../utils/api";

interface ProductFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  /** Called after the modal closes; may return a Promise (e.g. reload list). */
  onSuccess: () => void | Promise<void>;
}

export default function ProductForm({
  product,
  isOpen,
  onClose,
  onSuccess,
}: ProductFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | undefined>();
  const [cogs, setCogs] = useState<number | undefined>();
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState<number | undefined>();
  const [bundleQuantity, setBundleQuantity] = useState<number | undefined>();
  const [bundlePrice, setBundlePrice] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  const revokeBlobPreview = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  useEffect(() => {
    revokeBlobPreview();
    setPendingPhotoFile(null);
    setPhotoPreviewUrl(null);
    if (product) {
      setName(product.name || "");
      setPrice(product.price);
      setCogs(product.cogs);
      setDescription(product.description || "");
      setStock(product.stock);
      setBundleQuantity(product.bundle_quantity);
      setBundlePrice(product.bundle_price);
    } else {
      setName("");
      setPrice(undefined);
      setCogs(undefined);
      setDescription("");
      setStock(undefined);
      setBundleQuantity(undefined);
      setBundlePrice(undefined);
    }
  }, [product, isOpen]);

  useEffect(() => {
    return () => {
      revokeBlobPreview();
    };
  }, []);

  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const contentType = file.type || "";
    if (!contentType.startsWith("image/")) {
      alert("Pilih file gambar (PNG, JPG, WebP).");
      return;
    }
    revokeBlobPreview();
    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;
    setPhotoPreviewUrl(url);
    setPendingPhotoFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !name ||
      price === undefined ||
      cogs === undefined ||
      stock === undefined ||
      bundleQuantity === undefined ||
      bundlePrice === undefined
    ) {
      alert("Harap isi semua field yang wajib");
      return;
    }

    try {
      setIsSubmitting(true);
      if (product) {
        const updateData: ProductUpdate = {};
        if (name !== product.name) updateData.name = name;
        if (price !== product.price) updateData.price = price;
        if (cogs !== product.cogs) updateData.cogs = cogs;
        if (description !== product.description)
          updateData.description = description;
        if (stock !== product.stock) updateData.stock = stock;
        if (bundleQuantity !== product.bundle_quantity)
          updateData.bundle_quantity = bundleQuantity;
        if (bundlePrice !== product.bundle_price)
          updateData.bundle_price = bundlePrice;

        if (pendingPhotoFile) {
          if (Object.keys(updateData).length > 0) {
            await updateProduct(product.id, updateData);
          }
          await uploadProductPhoto(product.id, pendingPhotoFile);
        } else {
          if (Object.keys(updateData).length === 0) {
            onClose();
            return;
          }
          await updateProduct(product.id, updateData);
        }
      } else {
        const createData: ProductCreate = {
          name,
          price,
          cogs,
          description,
          stock,
          bundle_quantity: bundleQuantity,
          bundle_price: bundlePrice,
        };
        const created = await createProduct(createData);
        if (pendingPhotoFile) {
          await uploadProductPhoto(created.id, pendingPhotoFile);
        }
      }
      onClose();
      resetForm();
      await Promise.resolve(onSuccess());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan produk";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    revokeBlobPreview();
    setPendingPhotoFile(null);
    setPhotoPreviewUrl(null);
    setName("");
    setPrice(undefined);
    setCogs(undefined);
    setDescription("");
    setStock(undefined);
    setBundleQuantity(undefined);
    setBundlePrice(undefined);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      if (!product) {
        resetForm();
      }
    }
  };

  const imageSrc = photoPreviewUrl ?? product?.photo_url ?? null;

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={handleClose}
      className="z-200 flex min-h-dvh items-center justify-center overflow-hidden px-3 pt-[max(0.5rem,env(safe-area-inset-top,0px))] pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:min-h-screen md:p-4"
    >
      <Modal.Container className="flex w-full max-w-full min-h-0 justify-center">
        <Modal.Dialog className="flex w-full max-h-[calc(100svh-5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-1.5rem)] max-w-md flex-col overflow-hidden md:max-h-[min(90dvh,720px)]">
          <Modal.CloseTrigger />
          <form
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            onSubmit={handleSubmit}
          >
            <Modal.Header className="shrink-0">
              <Modal.Heading>
                {product ? "Edit Produk" : "Buat Produk"}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Foto Produk</Label>
                  <div className="flex flex-col gap-3">
                    <div className="mx-auto w-full max-w-[min(100%,18rem)] sm:max-w-[min(100%,22rem)] aspect-square rounded-2xl border border-separator bg-foreground/5 overflow-hidden">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-muted text-center px-2">
                          Tanpa foto
                        </div>
                      )}
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handlePhotoSelected}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={handlePhotoSelected}
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
                        Pilih foto
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
                  isRequired
                  name="name"
                  onChange={setName}
                  value={name}
                >
                  <Label>Nama Produk</Label>
                  <Input placeholder="Masukkan nama produk" />
                </TextField>

                <NumberField
                  formatOptions={{
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }}
                  isRequired
                  minValue={0}
                  name="price"
                  value={price}
                  onChange={setPrice}
                >
                  <Label>Harga</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input className="w-full" />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                </NumberField>

                <NumberField
                  formatOptions={{
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }}
                  isRequired
                  minValue={0}
                  name="cogs"
                  value={cogs}
                  onChange={setCogs}
                >
                  <Label>COGS (Harga Pokok Penjualan)</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input className="w-full" />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                </NumberField>

                <TextField
                  name="description"
                  onChange={setDescription}
                  value={description}
                >
                  <Label>Deskripsi</Label>
                  <TextArea placeholder="Masukkan deskripsi produk" rows={3} />
                </TextField>

                <NumberField
                  isRequired
                  minValue={0}
                  name="stock"
                  value={stock}
                  onChange={setStock}
                >
                  <Label>Stok</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input className="w-full" />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                </NumberField>

                <NumberField
                  isRequired
                  minValue={1}
                  name="bundleQuantity"
                  value={bundleQuantity}
                  onChange={setBundleQuantity}
                >
                  <Label>Jumlah Bundle</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input className="w-full" />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                </NumberField>

                <NumberField
                  formatOptions={{
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }}
                  isRequired
                  minValue={0}
                  name="bundlePrice"
                  value={bundlePrice}
                  onChange={setBundlePrice}
                >
                  <Label>Harga Bundle</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input className="w-full" />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                </NumberField>
              </div>
            </Modal.Body>
            <Modal.Footer className="shrink-0">
              <Button
                isDisabled={isSubmitting}
                slot="close"
                variant="secondary"
              >
                Batal
              </Button>
              <Button isPending={isSubmitting} type="submit" variant="primary">
                {isSubmitting ? (
                  <>
                    <Spinner color="current" size="sm" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
