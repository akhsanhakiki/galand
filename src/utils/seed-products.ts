import { createProduct } from "./api/products";
import type { ProductCreate } from "./api/types";

const buildingMaterials: ProductCreate[] = [
  {
    name: "Semen Portland Tipe I",
    price: 75000,
    cogs: 60000,
    description: "Semen Portland untuk konstruksi umum, kemasan 50kg",
    stock: 150,
    bundle_quantity: 20,
    bundle_price: 70000,
  },
  {
    name: "Pasir Beton",
    price: 180000,
    cogs: 140000,
    description: "Pasir halus untuk campuran beton, per m³",
    stock: 80,
    bundle_quantity: 10,
    bundle_price: 170000,
  },
  {
    name: "Batu Split 1/2",
    price: 200000,
    cogs: 160000,
    description: "Batu split ukuran 1/2 untuk campuran beton, per m³",
    stock: 60,
    bundle_quantity: 10,
    bundle_price: 190000,
  },
  {
    name: "Bata Merah Press",
    price: 650,
    cogs: 500,
    description: "Bata merah press standar ukuran 20x10x5 cm, per biji",
    stock: 5000,
    bundle_quantity: 1000,
    bundle_price: 600,
  },
  {
    name: "Bata Ringan Hebel",
    price: 8500,
    cogs: 7000,
    description: "Bata ringan AAC ukuran 60x20x10 cm, per biji",
    stock: 800,
    bundle_quantity: 100,
    bundle_price: 8000,
  },
  {
    name: "Semen Mortar",
    price: 55000,
    cogs: 45000,
    description: "Semen mortar siap pakai untuk pasangan bata, kemasan 40kg",
    stock: 200,
    bundle_quantity: 20,
    bundle_price: 52000,
  },
  {
    name: "Besi Beton Polos 8mm",
    price: 85000,
    cogs: 70000,
    description: "Besi beton polos diameter 8mm, per batang 12 meter",
    stock: 300,
    bundle_quantity: 20,
    bundle_price: 80000,
  },
  {
    name: "Besi Beton Ulir 10mm",
    price: 120000,
    cogs: 100000,
    description: "Besi beton ulir diameter 10mm, per batang 12 meter",
    stock: 250,
    bundle_quantity: 20,
    bundle_price: 115000,
  },
  {
    name: "Kawat Beton",
    price: 45000,
    cogs: 35000,
    description: "Kawat beton diameter 4mm, per roll 50kg",
    stock: 100,
    bundle_quantity: 10,
    bundle_price: 42000,
  },
  {
    name: "Paku Beton 3 inch",
    price: 25000,
    cogs: 20000,
    description: "Paku beton ukuran 3 inch, per kg",
    stock: 150,
    bundle_quantity: 20,
    bundle_price: 23000,
  },
  {
    name: "Kayu Meranti 5/7",
    price: 15000,
    cogs: 12000,
    description: "Kayu meranti ukuran 5x7 cm, per meter",
    stock: 400,
    bundle_quantity: 50,
    bundle_price: 14000,
  },
  {
    name: "Triplek 9mm",
    price: 180000,
    cogs: 140000,
    description: "Triplek tebal 9mm ukuran 120x240 cm, per lembar",
    stock: 120,
    bundle_quantity: 10,
    bundle_price: 170000,
  },
  {
    name: "Cat Tembok Emulsion",
    price: 350000,
    cogs: 280000,
    description: "Cat tembok emulsion 20 liter, warna putih",
    stock: 50,
    bundle_quantity: 5,
    bundle_price: 330000,
  },
  {
    name: "Cat Besi Anti Karat",
    price: 280000,
    cogs: 220000,
    description: "Cat besi anti karat 5 liter, warna hitam",
    stock: 60,
    bundle_quantity: 5,
    bundle_price: 265000,
  },
  {
    name: "Genteng Metal",
    price: 45000,
    cogs: 35000,
    description: "Genteng metal berwarna ukuran standar, per lembar",
    stock: 500,
    bundle_quantity: 100,
    bundle_price: 42000,
  },
  {
    name: "Seng Gelombang",
    price: 85000,
    cogs: 65000,
    description: "Seng gelombang tebal 0.3mm, per lembar",
    stock: 300,
    bundle_quantity: 20,
    bundle_price: 80000,
  },
  {
    name: "Pipa PVC 3/4 inch",
    price: 35000,
    cogs: 28000,
    description: "Pipa PVC diameter 3/4 inch, per batang 4 meter",
    stock: 200,
    bundle_quantity: 20,
    bundle_price: 33000,
  },
  {
    name: "Keramik Lantai 40x40",
    price: 45000,
    cogs: 35000,
    description: "Keramik lantai ukuran 40x40 cm, per dus (isi 10)",
    stock: 150,
    bundle_quantity: 10,
    bundle_price: 42000,
  },
  {
    name: "Keramik Dinding 25x40",
    price: 38000,
    cogs: 30000,
    description: "Keramik dinding ukuran 25x40 cm, per dus (isi 15)",
    stock: 180,
    bundle_quantity: 10,
    bundle_price: 36000,
  },
  {
    name: "Semen Instan",
    price: 42000,
    cogs: 33000,
    description: "Semen instan untuk plesteran, kemasan 40kg",
    stock: 220,
    bundle_quantity: 20,
    bundle_price: 40000,
  },
];

export async function seedProducts(): Promise<void> {
  console.log("Starting to seed products...");
  
  for (const material of buildingMaterials) {
    try {
      await createProduct(material);
      console.log(`✓ Created: ${material.name}`);
    } catch (error) {
      console.error(`✗ Failed to create ${material.name}:`, error);
    }
  }
  
  console.log("Seeding completed!");
}
