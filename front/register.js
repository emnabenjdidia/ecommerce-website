document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !email || !password) {
      return alert("Please fill in all fields.");
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registered successfully! Please log in.");
        window.location.href = "login.html";
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Something went wrong. Check your connection.");
    }
  });
