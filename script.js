// script.js

const db = window.supabaseClient;

let products = [];
let categories = ["All"];
let store = {
  name: "ShopEasy",
  phone: ""
};

let selectedCategory = "All";

const categoryList = document.getElementById("categoryList");
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function renderStoreInfo() {
  document.getElementById("storeName").textContent = store.name;
  document.getElementById("footerStoreName").textContent = store.name;

  document.getElementById("footerPhone").textContent =
    store.phone ? "WhatsApp: +" + store.phone : "Contact us on WhatsApp";

  document.getElementById("contactLink").href =
    store.phone
      ? "https://wa.me/" + store.phone.replace(/\D/g, "")
      : "#";
}

function renderCategories() {
  categoryList.innerHTML = "";

  categories.forEach(category => {
    const button = document.createElement("button");

    button.className =
      "category-button" +
      (selectedCategory === category ? " active" : "");

    button.textContent = category;

    button.addEventListener("click", () => {
      selectedCategory = category;
      renderCategories();
      renderProducts();
    });

    categoryList.appendChild(button);
  });
}

function renderProducts() {
  const search = searchInput.value.trim().toLowerCase();

  const filteredProducts = products.filter(product => {
    const categoryMatches =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const searchMatches =
      product.name.toLowerCase().includes(search);

    return categoryMatches && searchMatches;
  });

  productGrid.innerHTML = "";

  if (filteredProducts.length === 0) {
    productGrid.innerHTML =
      '<p class="empty-message">No products found.</p>';
    return;
  }

  filteredProducts.forEach(product => {
    const message = encodeURIComponent(
      `Hello! I want to order ${product.name} for ₹${product.price}.`
    );

    const phone = store.phone.replace(/\D/g, "");

    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      ${
        product.image_url
          ? `<img src="${escapeHTML(product.image_url)}"
                  alt="${escapeHTML(product.name)}"
                  onerror="this.style.display='none'">`
          : ""
      }

      <h3>${escapeHTML(product.name)}</h3>

      <p class="product-description">
        ${escapeHTML(product.description || "")}
      </p>

      <p class="product-price">
        ₹${Number(product.price).toLocaleString("en-IN")}
      </p>

      <a class="order-button"
         href="${phone ? `https://wa.me/${phone}?text=${message}` : "#"}"
         target="_blank"
         rel="noopener">
        Order on WhatsApp
      </a>
    `;

    productGrid.appendChild(card);
  });
}

async function loadStore() {
  try {
    // Load active products
    const { data: productData, error: productError } = await db
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (productError) throw productError;

    products = productData || [];

    // Load categories
    const { data: categoryData, error: categoryError } = await db
      .from("categories")
      .select("name")
      .order("name");

    if (categoryError) throw categoryError;

    categories = [
      "All",
      ...(categoryData || []).map(item => item.name)
    ];

    // Load store settings
    const { data: storeData, error: storeError } = await db
      .from("store_settings")
      .select("store_name, whatsapp_phone")
      .eq("id", 1)
      .maybeSingle();

    if (storeError) throw storeError;

    if (storeData) {
      store = {
        name: storeData.store_name || "ShopEasy",
        phone: storeData.whatsapp_phone || ""
      };
    }

    renderStoreInfo();
    renderCategories();
    renderProducts();

  } catch (error) {
    console.error("Supabase loading error:", error);

    productGrid.innerHTML =
      '<p class="empty-message">Unable to load products. Please try again later.</p>';
  }
}

searchInput.addEventListener("input", renderProducts);

loadStore();