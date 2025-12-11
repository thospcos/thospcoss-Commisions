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
  const accessoriesContainer = document.getElementById("accessoriesContainer");
  const addAccessoryBtn = document.getElementById("addAccessoryBtn");
  const totalPriceDisplay = document.getElementById("totalPrice");
  
  // Function to create a new accessory item
  function createAccessoryItem() {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'accessory-item';
    
    const select = document.createElement('select');
    select.className = 'accessory-select';
    select.required = true;
    
    const options = [
      {value: '', text: 'Select accessory type'},
      {value: 'Keychain', text: 'Keychain (13.000 IDR)'},
      {value: 'Pin', text: 'Pin (13.000 IDR)'},
      {value: 'Acrylic Standee', text: 'Acrylic Standee (21.000 IDR)'}
    ];
    
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      select.appendChild(option);
    });
    
    const amountInput = document.createElement('input');
    amountInput.className = 'amount-input';
    amountInput.type = 'number';
    amountInput.min = '1';
    amountInput.max = '10';
    amountInput.value = '1';
    amountInput.required = true;
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Remove';
    
    // Add event listeners
    select.addEventListener('change', updateTotalPrice);
    amountInput.addEventListener('input', updateTotalPrice);
    
    removeBtn.addEventListener('click', function() {
      itemDiv.remove();
      updateRemoveButtons();
      updateTotalPrice();
    });
    
    itemDiv.appendChild(select);
    itemDiv.appendChild(amountInput);
    itemDiv.appendChild(removeBtn);
    
    return itemDiv;
  }
  
  // Function to update remove buttons state (disable if only one item)
  function updateRemoveButtons() {
    const items = accessoriesContainer.querySelectorAll('.accessory-item');
    const removeBtns = accessoriesContainer.querySelectorAll('.remove-btn');
    
    if (items.length === 1) {
      removeBtns[0].disabled = true;
    } else {
      removeBtns.forEach(btn => btn.disabled = false);
    }
  }
  
  // Function to calculate and update total price
  function updateTotalPrice() {
    let total = 0;
    const items = accessoriesContainer.querySelectorAll('.accessory-item');
    
    items.forEach(item => {
      const select = item.querySelector('.accessory-select');
      const amountInput = item.querySelector('.amount-input');
      
      if (select.value && amountInput.value) {
        const price = prices[select.value];
        const amount = parseInt(amountInput.value) || 0;
        total += price * amount;
      }
    });
    
    totalPriceDisplay.textContent = total.toLocaleString('id-ID');
  }
  
  // Add accessory button click handler
  addAccessoryBtn.addEventListener('click', function() {
    const newItem = createAccessoryItem();
    accessoriesContainer.appendChild(newItem);
    updateRemoveButtons();
    updateTotalPrice();
  });
  
  // Initialize remove buttons state
  updateRemoveButtons();
  
  // Initial price calculation
  updateTotalPrice();
  
  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get basic fields
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    // Get all accessory items
    const accessoryItems = [];
    const items = accessoriesContainer.querySelectorAll('.accessory-item');
    
    let hasValidAccessories = false;
    
    items.forEach((item, index) => {
      const select = item.querySelector('.accessory-select');
      const amountInput = item.querySelector('.amount-input');
      
      if (select.value && amountInput.value) {
        hasValidAccessories = true;
        accessoryItems.push({
          type: select.value,
          amount: parseInt(amountInput.value) || 0,
          price: prices[select.value] * (parseInt(amountInput.value) || 0)
        });
      }
    });

    // Validation
    if (!name) {
      alert("Please enter your name.");
      return;
    }
    
    if (!email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid email address.");
      return;
    }
    
    if (!hasValidAccessories || accessoryItems.length === 0) {
      alert("Please add at least one accessory item.");
      return;
    }
    
    // Check if any amount is invalid
    for (const item of accessoryItems) {
      if (item.amount < 1 || item.amount > 10) {
        alert("Each accessory amount must be between 1 and 10.");
        return;
      }
    }
    
    if (message.length < 10) {
      alert("Message must be at least 10 characters.");
      return;
    }

    // Calculate total price
    const totalPrice = accessoryItems.reduce((sum, item) => sum + item.price, 0);

    // Build accessory list for Discord
    const accessoryList = accessoryItems.map(item => 
      `${item.type} × ${item.amount} = ${item.price.toLocaleString('id-ID')} IDR`
    ).join('\n');

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
            { name: "Name", value: name },
            { name: "Email", value: email },
            { name: "Accessories", value: accessoryList },
            { name: "Total Price", value: `${totalPrice.toLocaleString('id-ID')} IDR` },
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
        
        // Reset accessories to one item
        accessoriesContainer.innerHTML = '';
        const initialItem = createAccessoryItem();
        accessoriesContainer.appendChild(initialItem);
        updateRemoveButtons();
        updateTotalPrice();
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

  // Add event listeners to initial accessory item
  const initialSelect = accessoriesContainer.querySelector('.accessory-select');
  const initialAmount = accessoriesContainer.querySelector('.amount-input');
  
  initialSelect.addEventListener('change', updateTotalPrice);
  initialAmount.addEventListener('input', updateTotalPrice);
});
