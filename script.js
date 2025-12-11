// === CONFIG ===
const WEBHOOK_URL = "https://discord.com/api/webhooks/1448550152158838936/avMJGylaWKWS2YuHmTp2gfLFUerf-9P_pAb6qSo78wb8LA9eHFLB5U6YqaRGNOh6TqxV";

// === PRICE LIST ===
const prices = {
  "Keychain": 13000,
  "Pin": 13000,
  "Acrylic Standee": 21000
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("orderForm");
  const typeSelect = document.getElementById("type");
  const amountInput = document.getElementById("amount");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get all fields
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const type = typeSelect.value;
    const amount = parseInt(amountInput.value);
    const message = document.getElementById("message").value.trim();

    // Validation
    if (!name) {
      alert("Please enter your name.");
      return;
    }
    
    if (!email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid email address.");
      return;
    }
    
    if (!type) {
      alert("Please select an accessory type.");
      return;
    }
    
    if (amount < 1 || amount > 10) {
      alert("Amount must be between 1 and 10.");
      return;
    }
    
    if (message.length < 10) {
      alert("Message must be at least 10 characters.");
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
          title: "New Order Received",
          color: 0x2cff6a,
          fields: [
            { name: "Name", value: name, inline: true },
            { name: "Email", value: email, inline: true },
            { name: "Accessory Type", value: type, inline: true },
            { name: "Amount", value: String(amount), inline: true },
            { name: "Total Price", value: `Rp ${finalPrice.toLocaleString('id-ID')}`, inline: true },
            { name: "Message", value: message.length > 1000 ? message.substring(0, 1000) + "..." : message }
          ],
          timestamp: new Date().toISOString(),
          footer: { 
            text: "thosp • Commissions • " + new Date().toLocaleDateString('id-ID') 
          }
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
        alert("Order sent successfully! I'll contact you via email soon.");
        form.reset();
        amountInput.value = "1"; // Reset to default
      } else {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to send order. Please try again or contact me directly.");
    } finally {
      // Restore button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  // Price calculation display
  const priceDisplay = document.createElement('div');
  priceDisplay.style.marginTop = '10px';
  priceDisplay.style.padding = '12px 14px';
  priceDisplay.style.backgroundColor = '#0f1116';
  priceDisplay.style.borderRadius = '10px';
  priceDisplay.style.border = '1px solid #1f222b';
  priceDisplay.style.fontSize = '14px';
  priceDisplay.style.display = 'none';
  
  // Insert after the amount input
  amountInput.parentNode.insertBefore(priceDisplay, amountInput.nextSibling);

  // Update price when type or amount changes
  function updatePriceDisplay() {
    const type = typeSelect.value;
    const amount = parseInt(amountInput.value) || 0;
    
    if (type && amount > 0 && amount <= 10) {
      const finalPrice = prices[type] * amount;
      priceDisplay.textContent = `Estimated Price: Rp ${finalPrice.toLocaleString('id-ID')}`;
      priceDisplay.style.display = 'block';
      priceDisplay.style.color = '#2cff6a';
      priceDisplay.style.borderColor = '#2cff6a';
    } else {
      priceDisplay.style.display = 'none';
    }
  }

  typeSelect.addEventListener('change', updatePriceDisplay);
  amountInput.addEventListener('input', updatePriceDisplay);
});
