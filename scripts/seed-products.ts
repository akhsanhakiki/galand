/**
 * Seed script untuk menambahkan 20 produk material bangunan
 * 
 * Usage: 
 *   pnpm tsx scripts/seed-products.ts
 *   atau
 *   node --loader tsx scripts/seed-products.ts
 */

const buildingMaterials = [
  {
    name: "Semen Portland Tipe I",
    price: 75000,
    description: "Semen Portland untuk konstruksi umum, kemasan 50kg",
    stock: 150,
  },
  {
    name: "Pasir Beton",
    price: 180000,
    description: "Pasir halus untuk campuran beton, per m³",
    stock: 80,
  },
  {
    name: "Batu Split 1/2",
    price: 200000,
    description: "Batu split ukuran 1/2 untuk campuran beton, per m³",
    stock: 60,
  },
  {
    name: "Bata Merah Press",
    price: 650,
    description: "Bata merah press standar ukuran 20x10x5 cm, per biji",
    stock: 5000,
  },
  {
    name: "Bata Ringan Hebel",
    price: 8500,
    description: "Bata ringan AAC ukuran 60x20x10 cm, per biji",
    stock: 800,
  },
  {
    name: "Semen Mortar",
    price: 55000,
    description: "Semen mortar siap pakai untuk pasangan bata, kemasan 40kg",
    stock: 200,
  },
  {
    name: "Besi Beton Polos 8mm",
    price: 85000,
    description: "Besi beton polos diameter 8mm, per batang 12 meter",
    stock: 300,
  },
  {
    name: "Besi Beton Ulir 10mm",
    price: 120000,
    description: "Besi beton ulir diameter 10mm, per batang 12 meter",
    stock: 250,
  },
  {
    name: "Kawat Beton",
    price: 45000,
    description: "Kawat beton diameter 4mm, per roll 50kg",
    stock: 100,
  },
  {
    name: "Paku Beton 3 inch",
    price: 25000,
    description: "Paku beton ukuran 3 inch, per kg",
    stock: 150,
  },
  {
    name: "Kayu Meranti 5/7",
    price: 15000,
    description: "Kayu meranti ukuran 5x7 cm, per meter",
    stock: 400,
  },
  {
    name: "Triplek 9mm",
    price: 180000,
    description: "Triplek tebal 9mm ukuran 120x240 cm, per lembar",
    stock: 120,
  },
  {
    name: "Cat Tembok Emulsion",
    price: 350000,
    description: "Cat tembok emulsion 20 liter, warna putih",
    stock: 50,
  },
  {
    name: "Cat Besi Anti Karat",
    price: 280000,
    description: "Cat besi anti karat 5 liter, warna hitam",
    stock: 60,
  },
  {
    name: "Genteng Metal",
    price: 45000,
    description: "Genteng metal berwarna ukuran standar, per lembar",
    stock: 500,
  },
  {
    name: "Seng Gelombang",
    price: 85000,
    description: "Seng gelombang tebal 0.3mm, per lembar",
    stock: 300,
  },
  {
    name: "Pipa PVC 3/4 inch",
    price: 35000,
    description: "Pipa PVC diameter 3/4 inch, per batang 4 meter",
    stock: 200,
  },
  {
    name: "Keramik Lantai 40x40",
    price: 45000,
    description: "Keramik lantai ukuran 40x40 cm, per dus (isi 10)",
    stock: 150,
  },
  {
    name: "Keramik Dinding 25x40",
    price: 38000,
    description: "Keramik dinding ukuran 25x40 cm, per dus (isi 15)",
    stock: 180,
  },
  {
    name: "Semen Instan",
    price: 42000,
    description: "Semen instan untuk plesteran, kemasan 40kg",
    stock: 220,
  },
];

async function seedProducts() {
  const apiBaseUrl = process.env.SIMPLE_CASHIER_BASE_URL;
  
  if (!apiBaseUrl) {
    console.error("Error: SIMPLE_CASHIER_BASE_URL environment variable is required");
    console.error("Please set it in your .env file or export it before running this script");
    process.exit(1);
  }

  console.log(`Using API: ${apiBaseUrl}`);
  console.log("Starting to seed products...\n");
  
  let successCount = 0;
  let failCount = 0;

  for (const material of buildingMaterials) {
    try {
      const response = await fetch(`${apiBaseUrl}/products/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(material),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const created = await response.json();
      console.log(`✓ Created: ${material.name} (ID: ${created.id})`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to create ${material.name}:`, error instanceof Error ? error.message : error);
      failCount++;
    }
  }
  
  console.log(`\nSeeding completed!`);
  console.log(`Success: ${successCount}, Failed: ${failCount}`);
}

seedProducts().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
