
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

const $ = id => document.getElementById(id);

function saveData() {
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("store", JSON.stringify(store));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function renderStoreSettings() {
  $("storeNameInput").value = store.name;
  $("phoneInput").value = store.phone;
}

function renderCategories() {
  $("productCategory").innerHTML = categories
    .filter(category => category !== "All")
    .map(category => `
      <option value="${escapeHTML(category)}">
        ${escapeHTML(category)}
      </option>
    `).join("");

  $("categoryManager").innerHTML = categories
    .filter(category => category !== "All")
    .map(category => `
      <div class="admin-row">
        <span>${escapeHTML(category)}</span>
        <button class="delete-button"
          data-delete-category="${escapeHTML(category)}">
          Delete
        </button>
      </div>
    `).join("");
}

function renderProducts() {
  $("productManager").innerHTML = products.map(product => `
    <div class="admin-row">
      <span>
        <strong>${escapeHTML(product.name)}</strong><br>
        ₹${Number(product.price).toLocaleString("en-IN")}
        · ${escapeHTML(product.category)}
      </span>

      <div class="admin-actions">
        <button data-edit="${product.id}">Edit</button>
        <button class="delete-button" data-delete="${product.id}">
          Delete
        </button>
      </div>
    </div>
  `).join("");

  if (products.length === 0) {
    $("productManager").innerHTML = "<p>No products added yet.</p>";
  }
}

function clearForm() {
  $("productForm").reset();
  $("productId").value = "";
  $("formHeading").textContent = "Add a product";
}

$("saveStoreButton").addEventListener("click", () => {
  const name = $("storeNameInput").value.trim();
  const phone = $("phoneInput").value.replace(/\D/g, "");

  if (!name || phone.length < 10) {
    alert("Please enter a store name and valid phone number.");
    return;
  }

  store = { name, phone };
  saveData();
  alert("Store settings saved!");
});

$("addCategoryButton").addEventListener("click", () => {
  const category = $("categoryInput").value.trim();

  if (!category || category.toLowerCase() === "all") {
    alert("Please enter a valid category name.");
    return;
  }

  const alreadyExists = categories.some(
    item => item.toLowerCase() === category.toLowerCase()
  );

  if (alreadyExists) {
    alert("This category already exists.");
    return;
  }

  categories.push(category);
  $("categoryInput").value = "";

  saveData();
  renderCategories();
});

$("categoryManager").addEventListener("click", event => {
  const category = event.target.dataset.deleteCategory;
  if (!category) return;

  const categoryHasProducts = products.some(
    product => product.category === category
  );

  if (categoryHasProducts) {
    alert("Delete or move this category's products first.");
    return;
  }

  categories = categories.filter(item => item !== category);

  saveData();
  renderCategories();
});

$("productForm").addEventListener("submit", event => {
  event.preventDefault();

  const id = $("productId").value;

  const product = {
    id: id ? Number(id) : Date.now(),
    name: $("productName").value.trim(),
    price: Number($("productPrice").value),
    category: $("productCategory").value,
    image: $("productImage").value.trim(),
    description: $("productDescription").value.trim()
  };

  if (!product.name || !product.category || product.price < 0) {
    alert("Please enter valid product details.");
    return;
  }

  if (id) {
    products = products.map(item =>
      item.id === Number(id) ? product : item
    );
  } else {
    products.push(product);
  }

  saveData();
  clearForm();
  renderProducts();

  alert("Product saved successfully!");
});

$("clearFormButton").addEventListener("click", clearForm);

$("productManager").addEventListener("click", event => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;

  if (editId) {
    const product = products.find(
      item => item.id === Number(editId)
    );

    if (!product) return;

    $("productId").value = product.id;
    $("productName").value = product.name;
    $("productPrice").value = product.price;
    $("productCategory").value = product.category;
    $("productImage").value = product.image;
    $("productDescription").value = product.description;

    $("formHeading").textContent = "Edit product";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (deleteId) {
    const confirmed = confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    products = products.filter(
      item => item.id !== Number(deleteId)
    );

    saveData();
    renderProducts();
  }
});

renderStoreSettings();
renderCategories();
renderProducts();
