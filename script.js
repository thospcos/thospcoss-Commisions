// === CONFIG ===
const WEBHOOK_URL = "https://discord.com/api/webhooks/1448550152158838936/avMJGylaWKWS2YuHmTp2gfLFUerf-9P_pAb6qSo78wb8LA9eHFLB5U6YqaRGNOh6TqxV";

// === PRICE LIST === (use same keys as option values)
const prices = {
  "keychain": 13000,
  "pin": 13000,
  "standee": 21000
};

// For display names in Discord
const displayNames = {
  "keychain": "Keychain",
  "pin": "Pin",
  "standee": "Acrylic Standee"
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("orderForm");
  const typeSelect = document.getElementById("type");
  const amountInput = document.getElementById("amount");
  const priceInput = document.getElementById("price");
  
  // Function to update price display
  function updatePrice() {
    const type = typeSelect.value;
    const amount = parseInt(amountInput.value) || 0;
    
    if (type && amount > 0) {
      const finalPrice = prices[type] * amount;
      priceInput.value = finalPrice.toLocaleString() + " IDR";
    } else {
      priceInput.value = "";
    }
  }
  
  // Add event listeners for price calculation
  typeSelect.addEventListener("change", updatePrice);
  amountInput.addEventListener("input", updatePrice);
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get all fields
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const type = typeSelect.value;
    const amount = parseInt(amountInput.value);
    const message = document.getElementById("message").value.trim();
    const notify = document.getElementById("notify");

    // Validation
    if (!email.includes("@")) {
      showNotification("Please enter a valid email.", "error");
      return;
    }
    if (message.length < 10) {
      showNotification("Message must be at least 10 characters.", "error");
      return;
    }
    if (!type) {
      showNotification("Please select an accessory type.", "error");
      return;
    }
    if (amount < 1 || amount > 10) {
      showNotification("Amount must be between 1 and 10.", "error");
      return;
    }

    // Price calculation
    const finalPrice = prices[type] * amount;

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    // Build Discord embed
    const payload = {
      username: "Order Notifier",
      embeds: [
        {
          title: "New Order Received!",
          color: 0x2cff6a,
          fields: [
            { name: "Name", value: name || "Not provided" },
            { name: "Email", value: email },
            { name: "Accessory Type", value: displayNames[type] || type },
            { name: "Amount", value: String(amount) },
            { name: "Price", value: finalPrice.toLocaleString() + " IDR" },
            { name: "Message", value: message.substring(0, 1000) }
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "thosp • Commisions" }
        }
      ]
    };

    // Send to Discord
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showNotification("Order sent successfully!", "success");
        form.reset();
        priceInput.value = "";
      } else {
        showNotification("Failed to send order. Server returned error.", "error");
      }
    } catch (err) {
      console.error("Error:", err);
      showNotification("Error sending order. Check console for details.", "error");
    } finally {
      // Restore button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  function showNotification(message, type) {
    const notify = document.getElementById("notify");
    notify.textContent = message;
    notify.style.color = type === "success" ? "#2cff6a" : "#ff4d4d";
    notify.style.opacity = "1";
    
    setTimeout(() => {
      notify.style.opacity = "0";
    }, 5000);
  }
});
