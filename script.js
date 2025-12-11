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
  
  // Initialize with one accessory item
  let accessoryCount = 1;
  
  // Function to create a new accessory item
  function createAccessoryItem() {
    accessoryCount++;
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
    
    // Mobile: prevent zoom on input focus
    amountInput.addEventListener('focus', function() {
      this.style.fontSize = '16px';
    });
    
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
  
  // Function to update remove buttons state
  function updateRemoveButtons() {
    const items = accessoriesContainer.querySelectorAll('.accessory-item');
    const removeBtns = accessoriesContainer.querySelectorAll('.remove-btn');
    
    if (items.length <= 1) {
      removeBtns.forEach(btn => btn.disabled = true);
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
      
      if (select && select.value && amountInput && amountInput.value) {
        const price = prices[select.value];
        if (price) {
          const amount = parseInt(amountInput.value) || 0;
          if (amount >= 1 && amount <= 10) {
            total += price * amount;
          }
        }
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
    
    // Mobile: scroll to new item
    if (window.innerWidth < 768) {
      newItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
  
  // Initialize remove buttons state
  updateRemoveButtons();
  
  // Add event listeners to initial accessory item
  const initialSelect = accessoriesContainer.querySelector('.accessory-select');
  const initialAmount = accessoriesContainer.querySelector('.amount-input');
  
  if (initialSelect) {
    initialSelect.addEventListener('change', updateTotalPrice);
  }
  if (initialAmount) {
    initialAmount.addEventListener('input', updateTotalPrice);
    initialAmount.addEventListener('focus', function() {
      this.style.fontSize = '16px';
    });
  }
  
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
    let isValid = true;
    let errorMessage = "";
    
    // Validate each accessory item
    items.forEach((item, index) => {
      const select = item.querySelector('.accessory-select');
      const amountInput = item.querySelector('.amount-input');
      
      if (!select || !select.value) {
        isValid = false;
        errorMessage = `Accessory #${index + 1}: Please select an accessory type.`;
        return;
      }
      
      if (!amountInput || !amountInput.value) {
        isValid = false;
        errorMessage = `Accessory #${index + 1}: Please enter an amount.`;
        return;
      }
      
      const amount = parseInt(amountInput.value);
      if (isNaN(amount) || amount < 1 || amount > 10) {
        isValid = false;
        errorMessage = `Accessory #${index + 1}: Amount must be between 1 and 10.`;
        return;
      }
      
      hasValidAccessories = true;
      accessoryItems.push({
        type: select.value,
        amount: amount,
        price: prices[select.value] * amount
      });
    });

    if (!isValid) {
      alert(errorMessage);
      return;
    }

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
    
    if (message.length < 10) {
      alert("Message must be at least 10 characters.");
      return;
    }

    // Calculate total price
    const totalPrice = accessoryItems.reduce((sum, item) => sum + item.price, 0);

    // Build accessory list for Discord
    const accessoryList = accessoryItems.map(item => 
      `${item.type} × ${item.amount} = Rp ${item.price.toLocaleString('id-ID')}`
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
            { name: "Name", value: name || "Not provided" },
            { name: "Email", value: email || "Not provided" },
            { name: "Accessories", value: accessoryList || "No accessories selected" },
            { name: "Total Price", value: `Rp ${totalPrice.toLocaleString('id-ID')}` },
            { name: "Message", value: message.length > 1000 ? message.substring(0, 1000) + "..." : message || "No message" }
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
        
        // Reset form
        form.reset();
        
        // Reset accessories to one item
        accessoriesContainer.innerHTML = `
          <div class="accessory-item">
            <select class="accessory-select" required>
              <option value="">Select accessory type</option>
              <option value="Keychain">Keychain (13.000 IDR)</option>
              <option value="Pin">Pin (13.000 IDR)</option>
              <option value="Acrylic Standee">Acrylic Standee (21.000 IDR)</option>
            </select>
            <input class="amount-input" type="number" min="1" max="10" value="1" required>
            <button type="button" class="remove-btn" disabled>Remove</button>
          </div>
        `;
        
        // Reset accessory count
        accessoryCount = 1;
        
        // Re-initialize event listeners
        updateRemoveButtons();
        
        // Re-add event listeners to new initial item
        const newInitialSelect = accessoriesContainer.querySelector('.accessory-select');
        const newInitialAmount = accessoriesContainer.querySelector('.amount-input');
        
        if (newInitialSelect) {
          newInitialSelect.addEventListener('change', updateTotalPrice);
        }
        if (newInitialAmount) {
          newInitialAmount.addEventListener('input', updateTotalPrice);
          newInitialAmount.addEventListener('focus', function() {
            this.style.fontSize = '16px';
          });
        }
        
        // Reset total price
        updateTotalPrice();
        
        // Mobile: scroll to top after submission
        if (window.innerWidth < 768) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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
  
  // Mobile: handle keyboard properly
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      // On mobile, scroll back to top when done with keyboard
      if (window.innerWidth < 768) {
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }
    });
  });
});
