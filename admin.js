// admin.js

const db = window.supabaseClient;
const $ = id => document.getElementById(id);

let products = [];
let categories = [];
let store = {
  name: "ShopEasy",
  phone: ""
};

function showMessage(message, isError = false) {
  const element = $("adminMessage");
  element.textContent = message;
  element.style.color = isError ? "red" : "green";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function showLogin(message = "") {
  $("loginSection").hidden = false;
  $("adminDashboard").hidden = true;
  $("loginMessage").textContent = message;
}

function showDashboard() {
  $("loginSection").hidden = true;
  $("adminDashboard").hidden = false;
}

async function verifyAdmin(user) {
  const { data, error } = await db
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}

async function checkSession() {
  try {
    const { data, error } = await db.auth.getSession();

    if (error) throw error;

    const session = data.session;

    if (!session) {
      showLogin();
      return;
    }

    const isAdmin = await verifyAdmin(session.user);

    if (!isAdmin) {
      await db.auth.signOut();
      showLogin("This account does not have owner access.");
      return;
    }

    showDashboard();
    await loadDashboard();

  } catch (error) {
    console.error(error);
    showLogin("Unable to verify your login. Please try again.");
  }
}

// Login
$("loginForm").addEventListener("submit", async event => {
  event.preventDefault();

  const email = $("loginEmail").value.trim();
  const password = $("loginPassword").value;

  $("loginMessage").textContent = "Signing in...";

  try {
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    const isAdmin = await verifyAdmin(data.user);

    if (!isAdmin) {
      await db.auth.signOut();
      showLogin("This account is not authorized as a store owner.");
      return;
    }

    showDashboard();
    await loadDashboard();

  } catch (error) {
    console.error(error);
    showLogin(error.message || "Login failed. Check your email and password.");
  }
});

// Logout
$("logoutButton").addEventListener("click", async () => {
  const { error } = await db.auth.signOut();

  if (error) {
    showMessage(error.message, true);
    return;
  }

  showLogin("You have logged out.");
});

// Load all dashboard data
async function loadDashboard() {
  try {
    showMessage("Loading store data...");

    await Promise.all([
      loadProducts(),
      loadCategories(),
      loadStoreSettings()
    ]);

    renderCategories();
    renderProducts();
    renderStoreSettings();

    showMessage("Dashboard loaded successfully.");

  } catch (error) {
    console.error(error);
    showMessage(error.message || "Could not load dashboard data.", true);
  }
}

// Products
async function loadProducts() {
  const { data, error } = await db
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  products = data || [];
}

function renderProducts() {
  $("productManager").innerHTML = products.map(product => `
    <div class="admin-row">
      <span>
        <strong>${escapeHTML(product.name)}</strong><br>
        ₹${Number(product.price).toLocaleString("en-IN")}
        · ${escapeHTML(product.category)}
        ${product.is_active ? "" : " · Inactive"}
      </span>

      <div class="admin-actions">
        <button type="button" data-edit="${product.id}">Edit</button>
        <button type="button" class="delete-button"
          data-delete="${product.id}">
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

$("clearFormButton").addEventListener("click", clearForm);

// Add or update product
$("productForm").addEventListener("submit", async event => {
  event.preventDefault();

  const id = $("productId").value;

  const product = {
    name: $("productName").value.trim(),
    price: Number($("productPrice").value),
    category: $("productCategory").value,
    image_url: $("productImage").value.trim() || null,
    description: $("productDescription").value.trim(),
    is_active: true
  };

  if (
    !product.name ||
    !product.category ||
    !Number.isFinite(product.price) ||
    product.price < 0
  ) {
    showMessage("Please enter valid product details.", true);
    return;
  }

  try {
    if (id) {
      const { error } = await db
        .from("products")
        .update(product)
        .eq("id", Number(id));

      if (error) throw error;

      showMessage("Product updated successfully.");
    } else {
      const { error } = await db
        .from("products")
        .insert(product);

      if (error) throw error;

      showMessage("Product added successfully.");
    }

    clearForm();
    await loadProducts();
    renderProducts();

  } catch (error) {
    console.error(error);
    showMessage(error.message || "Unable to save product.", true);
  }
});

// Edit or delete products
$("productManager").addEventListener("click", async event => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");

  if (editButton) {
    const product = products.find(
      item => item.id === Number(editButton.dataset.edit)
    );

    if (!product) return;

    $("productId").value = product.id;
    $("productName").value = product.name;
    $("productPrice").value = product.price;
    $("productCategory").value = product.category;
    $("productImage").value = product.image_url || "";
    $("productDescription").value = product.description || "";

    $("formHeading").textContent = "Edit product";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (deleteButton) {
    const id = Number(deleteButton.dataset.delete);

    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const { error } = await db
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await loadProducts();
      renderProducts();
      showMessage("Product deleted successfully.");

    } catch (error) {
      console.error(error);
      showMessage(error.message || "Unable to delete product.", true);
    }
  }
});

// Categories
async function loadCategories() {
  const { data, error } = await db
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw error;

  categories = data || [];
}

function renderCategories() {
  $("productCategory").innerHTML = categories.map(category => `
    <option value="${escapeHTML(category.name)}">
      ${escapeHTML(category.name)}
    </option>
  `).join("");

  $("categoryManager").innerHTML = categories.map(category => `
    <div class="admin-row">
      <span>${escapeHTML(category.name)}</span>

      <button type="button" class="delete-button"
        data-delete-category="${category.id}">
        Delete
      </button>
    </div>
  `).join("");

  if (categories.length === 0) {
    $("categoryManager").innerHTML = "<p>No categories added yet.</p>";
  }
}

$("addCategoryButton").addEventListener("click", async () => {
  const name = $("categoryInput").value.trim();

  if (!name || name.toLowerCase() === "all") {
    showMessage("Please enter a valid category name.", true);
    return;
  }

  const alreadyExists = categories.some(
    category => category.name.toLowerCase() === name.toLowerCase()
  );

  if (alreadyExists) {
    showMessage("This category already exists.", true);
    return;
  }

  try {
    const { error } = await db
      .from("categories")
      .insert({ name });

    if (error) throw error;

    $("categoryInput").value = "";

    await loadCategories();
    renderCategories();

    showMessage("Category added successfully.");

  } catch (error) {
    console.error(error);
    showMessage(error.message || "Unable to add category.", true);
  }
});

$("categoryManager").addEventListener("click", async event => {
  const button = event.target.closest("[data-delete-category]");
  if (!button) return;

  const categoryId = Number(button.dataset.deleteCategory);
  const category = categories.find(item => item.id === categoryId);

  if (!category) return;

  const categoryHasProducts = products.some(
    product => product.category === category.name
  );

  if (categoryHasProducts) {
    showMessage(
      "Move or delete this category's products before deleting it.",
      true
    );
    return;
  }

  if (!confirm(`Delete category "${category.name}"?`)) return;

  try {
    const { error } = await db
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) throw error;

    await loadCategories();
    renderCategories();

    showMessage("Category deleted successfully.");

  } catch (error) {
    console.error(error);
    showMessage(error.message || "Unable to delete category.", true);
  }
});

// Store settings
async function loadStoreSettings() {
  const { data, error } = await db
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    store = {
      name: data.store_name || "ShopEasy",
      phone: data.whatsapp_phone || ""
    };
  }
}

function renderStoreSettings() {
  $("storeNameInput").value = store.name;
  $("phoneInput").value = store.phone;
}

$("saveStoreButton").addEventListener("click", async () => {
  const name = $("storeNameInput").value.trim();
  const phone = $("phoneInput").value.replace(/\D/g, "");

  if (!name || phone.length < 10) {
    showMessage("Enter a store name and a valid WhatsApp number.", true);
    return;
  }

  try {
    const { error } = await db
      .from("store_settings")
      .update({
        store_name: name,
        whatsapp_phone: phone,
        updated_at: new Date().toISOString()
      })
      .eq("id", 1);

    if (error) throw error;

    store = { name, phone };

    showMessage("Store settings saved successfully.");

  } catch (error) {
    console.error(error);
    showMessage(error.message || "Unable to save store settings.", true);
  }
});

// Check whether an owner session already exists
checkSession();