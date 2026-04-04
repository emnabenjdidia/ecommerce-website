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

  document.getElementById("Hdays").innerHTML = days;
  document.getElementById("Hhours").innerHTML = hours;
  document.getElementById("Hmins").innerHTML = minutes;
  document.getElementById("Hsecs").innerHTML = seconds;
};

const interval = setInterval(updateCountDown, 1000);
updateCountDown();

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
  const showUsersInformations = document.querySelector(
    'button:has(a[href="/users-informations.html"])'
  );

  if (!user || user.role !== "admin") {
    if (addProductBtn) addProductBtn.style.display = "none";
    if (editProductBtn) editProductBtn.style.display = "none";
    if (showUsersInformations) showUsersInformations.style.display = "none";
  } else {
    if (addProductBtn) addProductBtn.style.display = "inline-block";
    if (editProductBtn) editProductBtn.style.display = "inline-block";
    if (showUsersInformations)
      showUsersInformations.style.display = "inline-block";
  }
});

/*-------------------------------------------------------------------------------------

                                          add to cartt 

-------------------------------------------------------------------------------                                          */
// List of discounted product IDs 
const discountedProductIds = [1, 2, 4, 5, 7, 8, 10, 12];

function bindAddToCartButtons() {
  const buttons = document.querySelectorAll(".add-to-cart-btn, .add-to-cart");

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to add items to the cart.");
        return;
      }
      const card = button.closest(".product-card") || button.closest(".card");

      const name = card.querySelector(".card-title")?.textContent?.trim();
      const productId = productIdMap.get(name);

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
            productId,
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
// Global: Map product name to ID
const productIdMap = new Map();

// Load on DOM ready
window.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCarouselProducts();
  fetchProducts();
  updateTotalLikesDisplay();
});

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

/*-------------------------------------------------------------------------------
                         Load Main Products
-------------------------------------------------------------------------------*/
async function loadProducts() {
  try {
    const res = await fetch(
      `${window.location.origin.replace("5173", "3000")}/api/products`
    );
    if (!res.ok) throw new Error("Failed to fetch products");

    const products = await res.json();
    const container = document.getElementById("products-container");
    container.innerHTML = "";

    products.slice(0, 4).forEach((product) => {
      productIdMap.set(product.name.trim(), product.id);

      const productHTML = `
        <div class="col-lg-3 col-md-6">
          <div class="product-card">
            <img src="${product.imageUrl}" alt="${product.name}" />
            <div class="card-body p-4">
              <h5 class="card-title">${product.name}</h5>
              <p class="card-text">${product.description}</p>
              <div class="product-price">${product.price.toLocaleString()} TND</div>
              <div class="product-icons">
                <div class="product-icon " data-id="${product.id}">
                  <i class="bi bi-heart"></i> 
                </div>
                <div class="product-icon"><i class="bi bi-arrow-left-right"></i></div>
                <div class="product-icon"><i class="bi bi-eye"></i></div>
              </div>
              <button class="add-to-cart-btn">Add to Cart</button>
            </div>
          </div>
        </div>
      `;
      container.insertAdjacentHTML("beforeend", productHTML);
    });

    bindLikeButtons();
  } catch (error) {
    console.error(error);
    alert("Error loading products: " + error.message);
  }
}

/*-------------------------------------------------------------------------------
                         Load Carousel Products
-------------------------------------------------------------------------------*/
async function loadCarouselProducts() {
  try {
    const res = await fetch(
      `${window.location.origin.replace("5173", "3000")}/api/products`
    );
    if (!res.ok) throw new Error("Failed to fetch products");

    const products = await res.json();
    const first8 = products.slice(0, 8);

    const slide1 = document.getElementById("slide-1");
    const slide2 = document.getElementById("slide-2");

    slide1.innerHTML = "";
    slide2.innerHTML = "";

    first8.slice(0, 4).forEach((product) => {
      productIdMap.set(product.name.trim(), product.id);
      slide1.innerHTML += createProductCard(product);
    });

    first8.slice(4, 8).forEach((product) => {
      productIdMap.set(product.name.trim(), product.id);
      slide2.innerHTML += createProductCard(product);
    });

    bindAddToCartButtons();
    bindLikeButtons();
  } catch (error) {
    console.error("Carousel error:", error);
  }
}

function createProductCard(product) {
  return `
        <div class="col-lg-3 col-md-6">
          <div class="product-card">
            <img src="${product.imageUrl}" alt="${product.name}" />
            <div class="card-body p-4">
              <h5 class="card-title">${product.name}</h5>
              <p class="card-text">${product.description}</p>
              <div class="product-price">${product.price.toLocaleString()} TND</div>
              <div class="product-icons">
                <div class="product-icon " data-id="${product.id}">
                  <i class="bi bi-heart"></i> 
                </div>
                <div class="product-icon"><i class="bi bi-arrow-left-right"></i></div>
                <div class="product-icon"><i class="bi bi-eye"></i></div>
              </div>
              <button class="add-to-cart-btn">Add to Cart</button>
            </div>
          </div>
        </div>
      `;
}

/*-------------------------------------------------------------------------------
                        Load 2 Product Rows
-------------------------------------------------------------------------------*/
async function fetchProducts() {
  try {
    const res = await fetch("/api/products?limit=8");
    if (!res.ok) throw new Error("Failed to fetch products");

    const products = await res.json();
    const row1 = document.getElementById("product-row-1");
    const row2 = document.getElementById("product-row-2");

    row1.innerHTML = "";
    row2.innerHTML = "";

    products.slice(0, 4).forEach((product) => {
      row1.insertAdjacentHTML("beforeend", createSimpleCard1(product));
    });

    products.slice(4, 8).forEach((product) => {
      row2.insertAdjacentHTML("beforeend", createSimpleCard(product));
    });

    bindLikeButtons();
  } catch (error) {
    console.error("Error loading 2-row products:", error);
  }
}

function createSimpleCard(product) {
  productIdMap.set(product.name.trim(), product.id);
  return `
    <div class="col-6 col-lg-3 mb-3 d-flex">
      <div class="card h-100 d-flex flex-column">
        <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}" />
        <div class="card-body flex-grow-1">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">${product.description}</p>
        </div>
        <button class="add-to-cart mt-auto">Add to Cart</button>
      </div>
    </div>
  `;
}
function createSimpleCard1(product) {
  productIdMap.set(product.name.trim(), product.id);
  return `
    <div class="col-6 col-lg-3 mb-3 d-flex" style="z-index:100;" >
      <div class="card h-100 d-flex flex-column" >
        <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}" />
        <div class="card-body flex-grow-1">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">${product.description}</p>
        </div>
        <button class="add-to-cart mt-auto">Add to Cart</button>
      </div>
    </div>
  `;
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
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const user = JSON.parse(atob(token.split(".")[1])); // decode JWT payload
  const userId = user.userId;

  // Fill user info in dropdown
  document.getElementById("user-name").textContent = user.username;
  document.getElementById("user-email").textContent = user.email;

  // Edit profile handler
  document
    .getElementById("edit-profile-btn")
    .addEventListener("click", async () => {
      const newUsername = prompt("Enter new username:", user.username);
      const newEmail = prompt("Enter new email:", user.email);
      const newPassword = prompt("Enter new password:");

      if (newUsername || newEmail || newPassword) {
        try {
          const res = await fetch(`/api/users/${userId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify({
              username: newUsername,
              email: newEmail,
              password: newPassword,
            }),
          });

          if (!res.ok) throw new Error("Failed to update profile");
          alert("Profile updated! Please re-login.");
          localStorage.removeItem("token");
          location.href = "/login.html";
        } catch (err) {
          alert("Update failed: " + err.message);
        }
      }
    });

  // Delete account handler
  document
    .getElementById("delete-account-btn")
    .addEventListener("click", async () => {
      if (
        confirm(
          "Are you sure you want to delete your account? This cannot be undone."
        )
      ) {
        try {
          const res = await fetch(`/api/users/${userId}`, {
            method: "DELETE",
            headers: {
              Authorization: "Bearer " + token,
            },
          });

          if (!res.ok) throw new Error("Failed to delete account");
          alert("Account deleted. Goodbye!");
          localStorage.removeItem("token");
          location.href = "/register.html";
        } catch (err) {
          alert("Delete failed: " + err.message);
        }
      }
    });
});
