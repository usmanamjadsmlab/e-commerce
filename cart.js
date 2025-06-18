// -------- Load Cart --------
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Agar selectedCartItem mila hai to usi ko cart me dalo
const selectedItem = JSON.parse(localStorage.getItem("selectedCartItem"));
if (selectedItem) {
  cart = [selectedItem]; // Sirf usi item ko rakhna hai
  localStorage.setItem("cart", JSON.stringify(cart)); // LocalStorage me update karo
  localStorage.removeItem("selectedCartItem"); // Use once only
}

// -------- DOM Elements --------
const cartTableBody = document.getElementById("cart-table-body");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const shippingMsg = document.getElementById("shipping-msg");
const shippingBar = document.getElementById("shipping-bar");
const updateBtn = document.getElementById("update-btn");
const checkoutBtn = document.getElementById("checkout-btn");

const FREE_SHIPPING_THRESHOLD = 300;

// -------- Update Cart UI --------
function updateCartUI() {
  cartTableBody.innerHTML = "";
  let subtotal = 0;

  if (cart.length === 0) {
    cartTableBody.innerHTML = `<tr><td colspan="4">Your cart is empty.</td></tr>`;
    subtotalEl.textContent = "$0.00";
    totalEl.textContent = "$0.00";
    shippingMsg.textContent = "Add $300.00 more to get free shipping!";
    shippingBar.style.width = "0%";
    return;
  }

  cart.forEach((item, index) => {
    const row = document.createElement("tr");

    const itemSubtotal = item.price * item.qty;
    subtotal += itemSubtotal;

    row.innerHTML = `
      <td>
        <div class="product-info">
          <img src="${item.imgSrc}" alt="${item.title}" />
          <span>${item.title}</span>
        </div>
      </td>
      <td>
        <input type="number" min="1" value="${item.qty}" data-index="${index}" class="qty-input">
      </td>
      <td>$${itemSubtotal.toFixed(2)}</td>
      <td>
        <button class="remove-btn" data-index="${index}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;

    cartTableBody.appendChild(row);
  });

  // Totals
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  totalEl.textContent = `$${subtotal.toFixed(2)}`;

  // Shipping progress
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  shippingMsg.textContent = remaining > 0
    ? `Add $${remaining.toFixed(2)} more to get free shipping!`
    : `You have free shipping!`;
  shippingBar.style.width = `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`;

  // Save back to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));
}

// -------- Bind Events --------
function bindCartEvents() {
  document.querySelectorAll(".qty-input").forEach(input => {
    input.addEventListener("input", e => {
      const index = e.target.dataset.index;
      const newQty = parseInt(e.target.value);
      cart[index].qty = newQty > 0 ? newQty : 1;

      updateBtn.disabled = false;
      updateBtn.classList.add("enabled");
    });
  });

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const index = e.currentTarget.dataset.index;
      cart.splice(index, 1);
      updateCartUI();
      bindCartEvents();

      updateBtn.disabled = false;
      updateBtn.classList.add("enabled");
    });
  });
}

// -------- Update Button Click --------
updateBtn.addEventListener("click", () => {
  updateCartUI();
  bindCartEvents();

  updateBtn.disabled = true;
  updateBtn.classList.remove("enabled");
});

// -------- Checkout Click --------
checkoutBtn.addEventListener("click", () => {
  localStorage.setItem("cart", JSON.stringify(cart));
  window.location.href = "checkout.html";
});

// -------- Initial Load --------
document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();
  bindCartEvents();

  updateBtn.disabled = true;
  updateBtn.classList.remove("enabled");
});
