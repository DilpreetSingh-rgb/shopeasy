
const defaultProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 1299,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    description: "Comfortable wireless headphones."
  },
  {
    id: 2,
    name: "Classic T-Shirt",
    price: 499,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
    description: "A simple everyday T-shirt."
  },
  {
    id: 3,
    name: "Smart Watch",
    price: 1999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    description: "A stylish everyday smartwatch."
  }
];

function readData(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

let products = readData("products", defaultProducts);
let categories = readData("categories", [
  "All", "Electronics", "Clothing"
]);
let store = readData("store", {
  name: "ShopEasy",
  phone: "919999999999"
});

let selectedCategory = "All";

const categoryList = document.getElementById("categoryList");
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
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
    "WhatsApp: +" + store.phone;

  document.getElementById("contactLink").href =
    "https://wa.me/" + store.phone.replace(/\D/g, "");
}

function renderCategories() {
  categoryList.innerHTML = "";

  categories.forEach(category => {
    const button = document.createElement("button");
    button.className = "category-button" +
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
  const search = searchInput.value.toLowerCase();

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

    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${escapeHTML(product.image)}"
           alt="${escapeHTML(product.name)}"
           onerror="this.style.display='none'">

      <h3>${escapeHTML(product.name)}</h3>

      <p class="product-description">
        ${escapeHTML(product.description || "")}
      </p>

      <p class="product-price">
        ₹${Number(product.price).toLocaleString("en-IN")}
      </p>

      <a class="order-button"
         href="https://wa.me/${store.phone.replace(/\D/g, "")}?text=${message}"
         target="_blank" rel="noopener">
        Order on WhatsApp
      </a>
    `;

    productGrid.appendChild(card);
  });
}

searchInput.addEventListener("input", renderProducts);

renderStoreInfo();
renderCategories();
renderProducts();
