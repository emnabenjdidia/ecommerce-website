/*-------------------------------------------------------------------------------
                     User's information fetching and UI handling
-------------------------------------------------------------------------------*/
document.addEventListener("DOMContentLoaded", async () => {
  updateTotalLikesDisplay();
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
