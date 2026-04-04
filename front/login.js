document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    return alert("Please fill in both fields.");
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      alert("Login successful!");
      window.location.href = "/index.html";
    } else {
      alert(data.error || "Login failed");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Something went wrong. Check your connection.");
  }
});
