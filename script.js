let allProducts = [];
let cart = []; // Cart localStorage se load hoga on page load
const freeShippingThreshold = 300;

// Jab page load ho
document.addEventListener("DOMContentLoaded", () => {
  // PAGE LOAD PE CART CLEAR KAR DO
  localStorage.removeItem("cart");
  cart = [];

  const isSearchPage = window.location.pathname.includes("search.html");

  if (isSearchPage) {
    loadFilteredProducts();
  } else {
    loadAllProducts();
  }

  bindCloseEvents();
  bindNavbarEvents();
  updateCart();
});

// Index ke liye tamam products load karo
async function loadAllProducts() {
  try {
    const res = await fetch("products.json");
    const products = await res.json();
    allProducts = products;
    displayProducts(products);
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

// Search page ke liye filter karke products load karo
async function loadFilteredProducts() {
  try {
    const res = await fetch("products.json");
    const products = await res.json();
    allProducts = products;

    const query = localStorage.getItem("searchQuery")?.toLowerCase() || "";
    const selectedCategory = localStorage.getItem("selectedCategory") || "All";

    const filtered = products.filter((product) => {
      const matchesQuery = product.title.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });

    const titleElement = document.getElementById("searchTitle");
    if (titleElement) {
      titleElement.textContent = `Search Results for: "${query}" in "${selectedCategory}"`;
    }

    displayProducts(filtered);
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

// Products display karne ka function
function displayProducts(products) {
  const container = document.getElementById("products-container");
  container.innerHTML = "";

  if (!products || products.length === 0) {
    container.innerHTML = `<p class="no-products">Sorry, but nothing matched your search terms.</p>`;
    return;
  }

  products.forEach((product) => {
    const card = renderProductCard(product);
    container.appendChild(card);
  });

  bindProductEvents();
}

// Ek product card create karo
function renderProductCard(product) {
  const card = document.createElement("div");
  card.classList.add("product-card");
  card.innerHTML = `
    <div class="product-icons">
      <i class="fas fa-heart"></i>
      <i class="fas fa-random"></i>
      <i class="fas fa-eye eye-btn" data-id="${product.id}"></i>
    </div>
    <img src="${product.image}" alt="${product.title}" class="product-image">
    <div class="product-title">${product.title}</div>
    <div class="product-category">${product.category}</div>
    <div class="product-footer">
      <a href="#">$${product.price.toFixed(2)}</a>
      <a class="add-cart" href="#" 
         data-id="${product.id}" 
         data-title="${product.title}" 
         data-price="${product.price}" 
         data-image="${product.image}">
         Add to cart
      </a>
    </div>
  `;
  return card;
}

// Buttons ke event bind karo (Add to cart, eye button modal)
function bindProductEvents() {
  document.querySelectorAll(".add-cart").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      const title = this.dataset.title;
      const price = parseFloat(this.dataset.price);
      const image = this.dataset.image;

      // Agar button pe "View cart" likha ho to redirect
      if (this.textContent === "View cart") {
        const singleItem = { title, price, qty: 1, imgSrc: image };
        localStorage.setItem("selectedCartItem", JSON.stringify(singleItem));
        localStorage.removeItem("cart"); // clear cart
        window.location.href = "cart.html";
        return;
      }

      addToCart(title, price, image);
      this.textContent = "View cart";
    });
  });

  document.querySelectorAll(".eye-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const id = this.dataset.id;
      const product = allProducts.find((p) => p.id == id);
      if (product) {
        document.getElementById("modalImage").src = product.image;
        document.getElementById("modalTitle").innerText = product.title;
        document.getElementById("modalPrice").innerText = `$${product.price.toFixed(2)}`;
        document.getElementById("modalCategory").innerText = product.category;
        document.getElementById("productModal").style.display = "flex";
      }
    });
  });
}

// Cart me item add karo, localStorage aur UI update karo
function addToCart(title, price, image) {
  const savedCart = JSON.parse(localStorage.getItem("cart"));
  cart = savedCart && Array.isArray(savedCart) ? savedCart : [];

  const existing = cart.find((item) => item.title === title);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ title, price, qty: 1, imgSrc: image });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();

  document.getElementById("cartSidebar").classList.add("active");
}

// Cart sidebar UI update karo
function updateCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartSubtotal = document.getElementById("cartSubtotal");

  if (!cartItemsContainer || !cartSubtotal) return;

  cartItemsContainer.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item, index) => {
    subtotal += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.imgSrc}" alt="${item.title}">
      <div class="cart-item-info">
        <h4>${item.title}</h4>
        <div class="cart-item-qty">
          <input type="number" value="${item.qty}" min="1" data-index="${index}">
          <span>× $${item.price.toFixed(2)}</span>
        </div>
      </div>
      <div class="cart-item-remove" data-index="${index}"><i class="fa-solid fa-trash"></i></div>
    `;
    cartItemsContainer.appendChild(div);
  });

  cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  updateShipping(subtotal);

  document.querySelectorAll(".cart-item-qty input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const index = e.target.dataset.index;
      const newQty = parseInt(e.target.value);
      if (newQty > 0) {
        cart[index].qty = newQty;
      } else {
        cart[index].qty = 1;
        e.target.value = 1;
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCart();
    });
  });

  document.querySelectorAll(".cart-item-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.currentTarget.dataset.index;
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCart();
    });
  });
}

// Shipping progress update karo
function updateShipping(subtotal) {
  const remaining = freeShippingThreshold - subtotal;
  const shippingText = document.getElementById("shippingText");
  const shippingProgress = document.getElementById("shippingProgress");

  if (!shippingText || !shippingProgress) return;

  shippingText.textContent =
    remaining > 0
      ? `Add $${remaining.toFixed(2)} more to get free shipping!`
      : "You have free shipping!";

  const progress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  shippingProgress.style.width = `${progress}%`;
}

// Modal and cart sidebar close events
function bindCloseEvents() {
  const modal = document.getElementById("productModal");
  const closeModal = document.getElementById("closeModal");

  closeModal?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  document.getElementById("closeCart")?.addEventListener("click", () => {
    document.getElementById("cartSidebar").classList.remove("active");
  });

  document.querySelector(".view-cart-btn")?.addEventListener("click", () => {
    window.location.href = "cart.html";
  });

  document.querySelector(".checkout-btn")?.addEventListener("click", () => {
    window.location.href = "checkout.html";
  });
}

// Navbar dropdowns and search input events bind karo
function bindNavbarEvents() {
  const categoryToggle = document.querySelector(".category-toggle");
  const categoryLabel = document.getElementById("categoryLabel");
  const categoryItems = document.querySelectorAll(".category-item");
  const searchInput = document.getElementById("searchInput");
  const searchIcon = document.getElementById("searchIcon");

  categoryToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    categoryToggle.classList.toggle("open");
  });

  window.addEventListener("click", () => {
    categoryToggle.classList.remove("open");
  });

  categoryItems.forEach((item) => {
    item.addEventListener("click", () => {
      categoryLabel.textContent = item.textContent;
      categoryToggle.classList.remove("open");
    });
  });

  searchInput?.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      runSearch();
    }
  });

  searchIcon?.addEventListener("click", runSearch);
}

// Search chalao, localStorage me query and category save karo, page redirect karo
function runSearch() {
  const query = document.getElementById("searchInput")?.value.trim();
  const category = document.getElementById("categoryLabel")?.textContent;

  if (!query) {
    alert("Please type something to search.");
    return;
  }

  const selectedCategory =
    category && category.toLowerCase() !== "select category" ? category : "All";

  localStorage.setItem("searchQuery", query);
  localStorage.setItem("selectedCategory", selectedCategory);

  window.location.href = "search.html";
}
