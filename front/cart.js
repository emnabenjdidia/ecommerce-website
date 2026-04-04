// List of discounted product IDs
const discountedProductIds = [1, 2, 4, 5, 7, 8, 10, 12];

document.addEventListener("DOMContentLoaded", loadCart);

async function loadCart() {
  const loadingState = document.getElementById("loading-state");
  const cartContainer = document.getElementById("cart-container");
  const cartSummaryContainer = document.getElementById(
    "cart-summary-container"
  );
  const cartItemsList = document.getElementById("cart-items-list");

  const token = localStorage.getItem("token");

  if (!token) {
    loadingState.innerHTML = `<p>You must be <a href="/login.html">logged in</a> to view your cart.</p>`;
    return;
  }

  try {
    const res = await fetch("/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch cart");

    const cart = await res.json();
    loadingState.style.display = "none";

    if (!cart?.cartItems?.length) {
      cartContainer.innerHTML = emptyCartHTML();
      cartContainer.style.display = "block";
      cartSummaryContainer.style.display = "none";
      return;
    }

    cartItemsList.innerHTML = "";

    cart.cartItems.forEach((item) => {
      const isDiscounted = discountedProductIds.includes(item.product.id);

      const originalPrice = item.product.price;
      const finalPrice = isDiscounted ? originalPrice / 2 : originalPrice;
      const itemTotal = finalPrice * item.quantity;

      // Store the actual unit price (finalPrice) in a data attribute for easy recalculation
      cartItemsList.innerHTML += `
        <div class="cart-item" data-item-id="${
          item.id
        }" data-unit-price="${finalPrice}">
          <div class="row align-items-center">
            <div class="col-md-6">
              <h5 class="mb-2">
                <i class="fas fa-box me-2 text-muted"></i>${item.product.name}
              </h5>
              <div class="price-container">
                <div class="product-price">${finalPrice.toFixed(2)} TND</div>
                ${
                  isDiscounted
                    ? `<div class="original-price">${originalPrice.toFixed(
                        2
                      )} TND</div>`
                    : ""
                }
              </div>
            </div>
            <div class="col-md-3">
              <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(this, 1)">+</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(this, -1)">-</button>
              </div>
            </div>
            <div class="col-md-3 text-end">
              <div class="item-total-price mb-2">${itemTotal.toFixed(
                2
              )} TND</div>
              <button class="remove-item" onclick="removeItem(this)">
                <i class="fas fa-trash me-1"></i>Remove
              </button>
            </div>
          </div>
        </div>
      `;
    });

    recalculateCartTotals();
    cartSummaryContainer.style.display = "block";
    cartContainer.style.display = "block";
  } catch (err) {
    console.error("Cart fetch error:", err);
    loadingState.innerHTML = `<p>Failed to load cart. Please try again later.</p>`;
  }
}

async function updateQuantity(button, change) {
  const token = localStorage.getItem("token");
  if (!token) return alert("You must be logged in.");

  const cartItem = button.closest(".cart-item");
  const qtyDisplay = cartItem.querySelector(".quantity-display");
  const currentQty = parseInt(qtyDisplay.textContent);
  const newQty = currentQty + change;
  const itemId = cartItem.dataset.itemId;

  if (newQty < 1) return;

  try {
    const res = await fetch(`/api/cart/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity: newQty }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update quantity");
    }

    qtyDisplay.textContent = newQty;

    const unitPrice = parseFloat(cartItem.dataset.unitPrice);
    const newTotal = unitPrice * newQty;

    cartItem.querySelector(".item-total-price").textContent =
      newTotal.toFixed(2) + " TND";

    recalculateCartTotals();
  } catch (err) {
    console.error("Error:", err);
    alert("Failed to update quantity: " + err.message);
  }
}

async function removeItem(button) {
  const cartItem = button.closest(".cart-item");
  const itemId = cartItem?.dataset?.itemId;
  const token = localStorage.getItem("token");

  if (!itemId || !token) {
    alert("Missing item or authentication.");
    return;
  }

  try {
    const res = await fetch(`/api/cart/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to remove item");

    cartItem.remove();
    recalculateCartTotals();

    if (!document.querySelectorAll(".cart-item").length) {
      document.getElementById("cart-container").innerHTML = emptyCartHTML();
      document.getElementById("cart-summary-container").style.display = "none";
    }
  } catch (err) {
    console.error("Remove item failed:", err);
    alert("❌ Failed to remove item from cart");
  }
}

async function clearCart() {
  const token = localStorage.getItem("token");
  if (!token) return alert("You must be logged in");

  if (!confirm("Are you sure you want to clear your cart?")) return;

  try {
    const res = await fetch("/api/cart/clear", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to clear cart");

    document.getElementById("cart-items-list").innerHTML = "";
    document.getElementById("cart-summary-container").style.display = "none";
    document.getElementById("cart-container").innerHTML = emptyCartHTML();
    document.getElementById("cart-container").style.display = "block";
  } catch (err) {
    console.error("Clear cart failed:", err);
    alert("❌ Failed to clear cart");
  }
}

function recalculateCartTotals() {
  let subtotal = 0;
  document.querySelectorAll(".cart-item").forEach((item) => {
    const unitPrice = parseFloat(item.dataset.unitPrice);
    const quantityText = item.querySelector(".quantity-display")?.textContent;
    const quantity = parseInt(quantityText);

    if (!isNaN(unitPrice) && !isNaN(quantity)) {
      subtotal += unitPrice * quantity;
    }
  });

  document.getElementById("subtotal").textContent =
    subtotal.toFixed(2) + " TND";
  document.getElementById("total").textContent = subtotal.toFixed(2) + " TND";
}

function emptyCartHTML() {
  return `
    <div class="feature-box cart-empty">
      <i class="fas fa-shopping-cart"></i>
      <h4>Your cart is empty</h4>
      <p>Start shopping to add items to your cart!</p>
      <button class="custom-btn mt-3" onclick="window.location.href='/index.html'" style="position: relative;">
        <i class="fas fa-arrow-left me-2"></i>Continue Shopping
      </button>
    </div>
  `;
}
document.getElementById("checkoutBtn").addEventListener("click", async () => {
  try {
    const response = await fetch("/api/cart/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    const data = await response.json();

    if (response.ok) {
      alert("Order placed successfully!");
      // Redirect or update UI
      window.location.href = "/cart.html"; // or show order summary
    } else {
      alert("Checkout failed: " + data.error);
    }
  } catch (error) {
    console.error("Checkout failed:", error);
    alert("An unexpected error occurred during checkout.");
  }
});
