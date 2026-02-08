"use client";

import {
  Button,
  Input,
  Label,
  Modal,
  NumberField,
  Select,
  ListBox,
  Spinner,
  TextField,
} from "@heroui/react";
import { useEffect, useState } from "react";
import type {
  Discount,
  DiscountCreate,
  DiscountUpdate,
  Product,
} from "../utils/api";
import { createDiscount, updateDiscount, getProducts } from "../utils/api";

interface DiscountFormProps {
  discount?: Discount | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DiscountForm({
  discount,
  isOpen,
  onClose,
  onSuccess,
}: DiscountFormProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<"individual_item" | "for_all_item">(
    "individual_item"
  );
  const [percentage, setPercentage] = useState<number | undefined>(0);
  const [productId, setProductId] = useState<number | undefined>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (discount) {
      setName(discount.name || "");
      setCode(discount.code || "");
      setType(discount.type);
      setPercentage(discount.percentage);
      setProductId(discount.product_id);
    } else {
      setName("");
      setCode("");
      setType("individual_item");
      setPercentage(0);
      setProductId(undefined);
    }
  }, [discount, isOpen]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      // Error handling
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !code || percentage === undefined) {
      alert("Harap isi semua field yang wajib");
      return;
    }

    if (type === "individual_item" && !productId) {
      alert("Harap pilih produk untuk diskon individual");
      return;
    }

    try {
      setIsSubmitting(true);
      if (discount) {
        const updateData: DiscountUpdate = {};
        if (name !== discount.name) updateData.name = name;
        if (code !== discount.code) updateData.code = code;
        if (type !== discount.type) updateData.type = type;
        if (percentage !== discount.percentage)
          updateData.percentage = percentage;
        if (productId !== discount.product_id)
          updateData.product_id = productId;
        await updateDiscount(discount.id, updateData);
      } else {
        const createData: DiscountCreate = {
          name,
          code,
          type,
          percentage,
          product_id: type === "individual_item" ? productId : undefined,
        };
        await createDiscount(createData);
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      alert("Gagal menyimpan diskon");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCode("");
    setType("individual_item");
    setPercentage(0);
    setProductId(undefined);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      if (!discount) {
        resetForm();
      }
    }
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={handleClose} className="z-200">
      <Modal.Container className="z-200">
        <Modal.Dialog className="sm:max-w-2xl">
          <Modal.CloseTrigger />
          <form onSubmit={handleSubmit}>
            <Modal.Header>
              <Modal.Heading>
                {discount ? "Edit Diskon" : "Buat Diskon"}
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
                  <Label>Nama Diskon</Label>
                  <Input placeholder="Masukkan nama diskon" />
                </TextField>

                <TextField
                  isRequired
                  name="code"
                  onChange={setCode}
                  value={code}
                >
                  <Label>Kode Diskon</Label>
                  <Input placeholder="Masukkan kode diskon" />
                </TextField>

                <Select
                  isRequired
                  selectedKey={type}
                  onSelectionChange={(key) =>
                    setType(key as "individual_item" | "for_all_item")
                  }
                >
                  <Label>Tipe Diskon</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item
                        key="individual_item"
                        id="individual_item"
                        textValue="Diskon Per Item"
                      >
                        Diskon Per Item
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item
                        key="for_all_item"
                        id="for_all_item"
                        textValue="Diskon Semua Item"
                      >
                        Diskon Semua Item
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>

                {type === "individual_item" && (
                  <Select
                    className="w-full"
                    isDisabled={loadingProducts}
                    isRequired
                    placeholder="Pilih produk"
                    selectedKey={productId?.toString()}
                    onSelectionChange={(key) => setProductId(Number(key))}
                  >
                    <Label>Produk</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {products.map((product) => (
                          <ListBox.Item
                            key={product.id}
                            id={product.id.toString()}
                            textValue={product.name}
                          >
                            {product.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                )}

                <NumberField
                  isRequired
                  minValue={0}
                  maxValue={100}
                  name="percentage"
                  value={percentage}
                  onChange={setPercentage}
                >
                  <Label>Persentase Diskon (%)</Label>
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
