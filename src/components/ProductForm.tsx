"use client";

import {
  Button,
  Card,
  Input,
  Label,
  Modal,
  NumberField,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import { useEffect, useState } from "react";
import type { Product, ProductCreate, ProductUpdate } from "../utils/api";
import { createProduct, updateProduct } from "../utils/api";

interface ProductFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

  useEffect(() => {
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
        await updateProduct(product.id, updateData);
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
        await createProduct(createData);
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      alert("Gagal menyimpan produk");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
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

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={handleClose}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <Modal.CloseTrigger />
          <form onSubmit={handleSubmit}>
            <Modal.Header>
              <Modal.Heading>
                {product ? "Edit Produk" : "Buat Produk"}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
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
            <Modal.Footer>
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
