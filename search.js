document.addEventListener("DOMContentLoaded", () => {
  const productsContainer = document.getElementById("products-container");
  const searchTitle = document.getElementById("searchTitle");

  const searchQuery = localStorage.getItem("searchQuery")?.toLowerCase() || "";
  const selectedCategory = localStorage.getItem("selectedCategory") || "All";

  searchTitle.textContent = `Search results for "${searchQuery}" in "${selectedCategory}"`;

  fetch("products.json")
    .then((res) => res.json())
    .then((products) => {
      const filteredProducts = products.filter((product) => {
        const titleMatch = product.title.toLowerCase().includes(searchQuery);
        const categoryMatch =
          selectedCategory === "All" || product.category === selectedCategory;
        return titleMatch && categoryMatch;
      });

      if (filteredProducts.length === 0) {
        productsContainer.innerHTML = `<h3 style="grid-column: 1 / -1;">Sorry, no products found.</h3>`;
        return;
      }

      productsContainer.innerHTML = filteredProducts
        .map(
          (product) => `
        <div class="product-card" data-id="${product.id}">
          <div class="card-img">
            <img src="${product.image}" alt="${product.title}" />
          </div>
          <div class="card-body">
            <h3>${product.title}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
            <div class="card-buttons">
              <button class="btn-view" data-id="${product.id}">
                <i class="fa-regular fa-eye"></i>
              </button>
              <button class="btn-add-cart" data-id="${
                product.id
              }">Add to cart</button>
            </div>
          </div>
        </div>
      `
        )
        .join("");

      enableProductInteractivity(filteredProducts);
    });
});

function enableProductInteractivity(products) {
  const modal = document.getElementById("productModal");
  const closeModalBtn = document.getElementById("closeModal");

  document.querySelectorAll(".btn-view").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      const product = products.find((p) => p.id === id);
      if (!product) return;

      document.getElementById("modalImage").src = product.image;
      document.getElementById("modalTitle").textContent = product.title;
      document.getElementById(
        "modalPrice"
      ).textContent = `$${product.price.toFixed(2)}`;
      document.getElementById("modalCategory").textContent = product.category;

      modal.style.display = "flex";
    });
  });

  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  document.querySelectorAll(".btn-add-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      const product = products.find((p) => p.id === id);
      if (!product) return;

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItem = cart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`${product.title} added to cart!`);
    });
  });
}
