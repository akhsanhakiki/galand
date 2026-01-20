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
  InputGroup,
} from "@heroui/react";
import { useEffect, useState } from "react";
import type { Expense, ExpenseCreate, ExpenseUpdate } from "../utils/api";
import { createExpense, updateExpense } from "../utils/api";

interface ExpenseFormProps {
  expense?: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  "tagihan",
  "operasional",
  "pembelian",
  "gaji",
  "lainnya",
];

const PAYMENT_METHODS = ["cash", "qris", "transfer", "kartu"];

export default function ExpenseForm({
  expense,
  isOpen,
  onClose,
  onSuccess,
}: ExpenseFormProps) {
  const [amount, setAmount] = useState<number | undefined>(0);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount);
      setDescription(expense.description || "");
      setDate(expense.date ? new Date(expense.date).toISOString().split("T")[0] : "");
      setCategory(expense.category || "");
      setPaymentMethod(expense.payment_method || "");
    } else {
      setAmount(0);
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategory("");
      setPaymentMethod("");
    }
  }, [expense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      amount === undefined ||
      !description ||
      !date ||
      !category ||
      !paymentMethod
    ) {
      alert("Harap isi semua field yang wajib");
      return;
    }

    try {
      setIsSubmitting(true);
      if (expense) {
        const updateData: ExpenseUpdate = {};
        if (amount !== expense.amount) updateData.amount = amount;
        if (description !== expense.description)
          updateData.description = description;
        const expenseDateStr = new Date(expense.date).toISOString().split("T")[0];
        if (date !== expenseDateStr)
          updateData.date = new Date(date).toISOString();
        if (category !== expense.category) updateData.category = category;
        if (paymentMethod !== expense.payment_method)
          updateData.payment_method = paymentMethod;
        await updateExpense(expense.id, updateData);
      } else {
        const createData: ExpenseCreate = {
          amount,
          description,
          date: new Date(date).toISOString(),
          category,
          payment_method: paymentMethod,
        };
        await createExpense(createData);
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      alert("Gagal menyimpan pengeluaran");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount(0);
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setCategory("");
    setPaymentMethod("");
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      if (!expense) {
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
                {expense ? "Edit Pengeluaran" : "Buat Pengeluaran"}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                <NumberField
                  formatOptions={{
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }}
                  isRequired
                  minValue={0}
                  name="amount"
                  value={amount}
                  onChange={setAmount}
                >
                  <Label>Jumlah</Label>
                  <NumberField.Group>
                    <NumberField.DecrementButton />
                    <NumberField.Input className="w-full" />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                </NumberField>

                <TextField
                  isRequired
                  name="description"
                  onChange={setDescription}
                  value={description}
                >
                  <Label>Deskripsi</Label>
                  <Input placeholder="Masukkan deskripsi pengeluaran" />
                </TextField>

                <TextField isRequired>
                  <Label>Tanggal</Label>
                  <InputGroup className="shadow-none border">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-transparent border-0 outline-none px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none"
                      required
                    />
                  </InputGroup>
                </TextField>

                <Select
                  isRequired
                  selectedKey={category}
                  onSelectionChange={(key) => setCategory(key as string)}
                >
                  <Label>Kategori</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {CATEGORIES.map((cat) => (
                        <ListBox.Item key={cat} id={cat} textValue={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>

                <Select
                  isRequired
                  selectedKey={paymentMethod}
                  onSelectionChange={(key) => setPaymentMethod(key as string)}
                >
                  <Label>Metode Pembayaran</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {PAYMENT_METHODS.map((method) => (
                        <ListBox.Item
                          key={method}
                          id={method}
                          textValue={method}
                        >
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
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
