const countDown = document.querySelectorAll(".countdown");
const deadline = new Date("2025-08-31T23:59:59").getTime();

const updateCountDown = () => {
  const now = new Date().getTime();
  const timeLeft = deadline - now;

  if (timeLeft < 0) {
    clearInterval(interval);
    return;
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const list = [`${days}`, `${hours}`, `${minutes}`, `${seconds}`];
  let i = 0;
  countDown.forEach((element) => {
    element.innerHTML = `<p class="editcountdown">${list[i]}</p>`;
    i++;
  });
  document.getElementById("Hdays").innerHTML = days;
  document.getElementById("Hhours").innerHTML = hours;
  document.getElementById("Hmins").innerHTML = minutes;
  document.getElementById("Hsecs").innerHTML = seconds;
};

const interval = setInterval(updateCountDown, 1000);
updateCountDown();

// Product icon interaction
document.querySelectorAll(".product-icon").forEach((icon) => {
  icon.addEventListener("click", function () {
    this.style.transform = "scale(1.2)";
    setTimeout(() => {
      this.style.transform = "";
    }, 200);
  });
});

/*-------------------------------------------------------------------------------
                     User's information fetching and UI handling
-------------------------------------------------------------------------------*/
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found, redirecting to login...");
    window.location.href = "/login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch user");

    const user = await res.json();

    const userNameEl = document.getElementById("user-name");
    const userEmailEl = document.getElementById("user-email");

    if (userNameEl && userEmailEl && user.username && user.email) {
      userNameEl.textContent = user.username;
      userEmailEl.textContent = user.email;
    } else {
      console.warn("User DOM elements or user data missing");
    }

    // Dropdown toggle
    const userBtn = document.querySelector(".bi-person");
    const dropdown = document.getElementById("user-dropdown");

    if (userBtn && dropdown) {
      userBtn.parentElement.addEventListener("click", () => {
        dropdown.style.display =
          dropdown.style.display === "none" ? "block" : "none";
      });
    }

    // Logout
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "/login.html";
      });
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  }
});

// Helper function to decode JWT token payload
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

// Show/hide admin buttons based on user role
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = token ? parseJwt(token) : null;

  const addProductBtn = document.querySelector(
    'button:has(a[href="/add-product.html"])'
  );
  const editProductBtn = document.querySelector(
    'button:has(a[href="/edit-product.html"])'
  );

  if (!user || user.role !== "admin") {
    if (addProductBtn) addProductBtn.style.display = "none";
    if (editProductBtn) editProductBtn.style.display = "none";
  } else {
    if (addProductBtn) addProductBtn.style.display = "inline-block";
    if (editProductBtn) editProductBtn.style.display = "inline-block";
  }
});
// fetch productssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
document.addEventListener("DOMContentLoaded", async () => {
  await fetchAndRenderProductsById();
  bindAddToCartButtons();
  bindLikeButtons();
  updateTotalLikesDisplay();
});

async function fetchAndRenderProductsById() {
  try {
    // These are the product IDs you want to display
    const selectedIds = [1, 2, 4, 5, 7, 8, 10, 12];

    // IDs of products you want to discount
    const discountedIds = [1, 2, 4, 5, 7, 8, 10, 12];

    const container = document.getElementById("products-wrapper");
    container.innerHTML = "";

    let html = "";

    for (let i = 0; i < selectedIds.length; i++) {
      const id = selectedIds[i];

      // Start a new row every 4 products
      if (i % 4 === 0) {
        if (i !== 0) html += "</div>"; // Close previous row
        html += '<div class="row g-4 mt-4">';
      }

      // Fetch product by ID
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) continue;
      const product = await res.json();

      const isDiscounted = discountedIds.includes(product.id);
      const originalPrice = product.price.toFixed(2);
      const discountedPrice = isDiscounted
        ? (product.price / 2).toFixed(2)
        : originalPrice;

      html += `
        <div class="col-lg-3 col-md-6">
          <div class="product-card">
            ${isDiscounted ? `<div class="sale-badge">50% OFF</div>` : ""}
            <img src="${product.imageUrl}" alt="${product.name}" />
            <div class="card-body p-4">
              <h5 class="card-title">${product.name}</h5>
              <p class="card-text">${product.description || ""}</p>
              <div class="price-container">
                <div class="product-price">${discountedPrice} TND</div>
                ${
                  isDiscounted
                    ? `<div class="original-price">${originalPrice} TND</div>`
                    : ""
                }
              </div>
              <div class="product-icons">
                 <div class="product-icon " data-id="${product.id}">
                  <i class="bi bi-heart"></i> 
                </div>
                <div class="product-icon"><i class="bi bi-arrow-left-right"></i></div>
                <div class="product-icon"><i class="bi bi-eye"></i></div>
              </div>
              <button class="add-to-cart-btn" data-id="${
                product.id
              }">Add to Cart</button>
            </div>
          </div>
        </div>
      `;
    }

    html += "</div>"; // Close last row
    container.innerHTML = html;
  } catch (err) {
    console.error("Error loading products:", err);
  }
}
/*-------------------------------------------------------------------------------------

                                          add to cartt 

-------------------------------------------------------------------------------                                          */

function bindAddToCartButtons() {
  const buttons = document.querySelectorAll(".add-to-cart-btn, .add-to-cart");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to add items to the cart.");
        return;
      }

      const productId = button.getAttribute("data-id");
      const card = button.closest(".product-card") || button.closest(".card");
      const name = card.querySelector(".card-title")?.textContent?.trim();

      if (!productId) {
        alert("Product ID not found for " + name);
        return;
      }

      try {
        const res = await fetch("/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: parseInt(productId),
            quantity: 1,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Failed to add to cart");
        }

        const data = await res.json();
        alert(`🛒 ${name} added to cart successfully!`);
        console.log("Cart response:", data);
      } catch (error) {
        console.error("Add to cart error:", error);
        alert("❌ Failed to add to cart: " + error.message);
      }
    });
  });
}
/*-------------------------------------------------------------------------------
                             Like Button Handling
-------------------------------------------------------------------------------*/
function bindLikeButtons() {
  const likedData = JSON.parse(
    localStorage.getItem("likedProductsData") || "{}"
  );

  document.querySelectorAll(".product-icon[data-id]").forEach((btn) => {
    const productId = btn.dataset.id;
    const icon = btn.querySelector("i");

    // Initialize state
    const isLiked = likedData[productId]?.liked || false;

    if (isLiked) {
      icon.classList.remove("bi-heart");
      icon.classList.add("bi-heart-fill");
      icon.style.color = "";
    } else {
      icon.classList.remove("bi-heart-fill");
      icon.classList.add("bi-heart");
      icon.style.color = "rgba(165, 42, 42, 0.8)";
    }

    // Toggle on click
    btn.addEventListener("click", () => {
      const currentlyLiked = likedData[productId]?.liked || false;

      if (currentlyLiked) {
        icon.classList.remove("bi-heart-fill");
        icon.classList.add("bi-heart");
        icon.style.color = "rgba(165, 42, 42, 0.8)";
      } else {
        icon.classList.remove("bi-heart");
        icon.classList.add("bi-heart-fill");
        icon.style.color = "rgba(165, 42, 42, 0.8)";
      }

      likedData[productId] = {
        liked: !currentlyLiked,
      };

      localStorage.setItem("likedProductsData", JSON.stringify(likedData));
      updateTotalLikesDisplay();
    });
  });
}
function updateTotalLikesDisplay() {
  const likedData = JSON.parse(
    localStorage.getItem("likedProductsData") || "{}"
  );
  let totalLikes = 0;

  for (const id in likedData) {
    if (likedData[id].liked) {
      totalLikes += 1;
    }
  }

  const globalLikeCountEl = document.querySelector(".like-count");
  globalLikeCountEl.textContent = totalLikes > 1 ? totalLikes : "";
}
