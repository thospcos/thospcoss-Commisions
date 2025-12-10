// Discord Webhook URL - Replace if needed
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1444318939751518369/-9blXMbgbRx-r-Frr6OgENLAhgB_H3Vg6LV37u6qejKaFRcjSKOgqd5l5TYaHM_QQzGr";

// Store user data
let userData = {
  ip: 'Detecting...',
  userAgent: '',
  platform: '',
  timestamp: new Date().toISOString()
};

// Rate Limiter
class RateLimiter {
    constructor(limit, interval) {
        this.limit = limit;
        this.interval = interval;
        this.attempts = [];
    }

    canProceed() {
        const now = Date.now();
        this.attempts = this.attempts.filter(time => now - time < this.interval);
        
        if (this.attempts.length < this.limit) {
            this.attempts.push(now);
            return true;
        }
        return false;
    }

    getTimeToWait() {
        if (this.attempts.length === 0) return 0;
        const oldest = this.attempts[0];
        const now = Date.now();
        return Math.ceil((this.interval - (now - oldest)) / 1000);
    }
}

const rateLimiter = new RateLimiter(3, 5 * 60 * 1000); // 3 attempts per 5 minutes

// DOM Elements
const form = document.getElementById('contactForm');
const statusMessage = document.getElementById('statusMessage');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const charCounter = document.getElementById('charCounter');
const messageInput = document.getElementById('message');

// Fetch Public IP Address
function fetchIPAddress() {
    const ipDisplay = document.getElementById('ip-address-display');
    
    fetch("https://api.ipify.org/?format=json")
        .then(response => response.json())
        .then(data => {
            userData.ip = data.ip;
            ipDisplay.innerHTML = data.ip;
            ipDisplay.style.color = '#2cff6a';
            console.log("Public IP Address:", data.ip);
        })
        .catch(error => {
            console.error("Error fetching IP:", error);
            userData.ip = 'Failed to fetch';
            ipDisplay.innerHTML = 'Failed to fetch';
            ipDisplay.style.color = '#ff4444';
        });
}

// Get User Agent and Platform Info
function collectSystemInfo() {
    userData.userAgent = navigator.userAgent;
    userData.platform = navigator.platform;
    
    // Display system info
    document.getElementById('user-agent').textContent = 
        navigator.userAgent.substring(0, 30) + '...';
    document.getElementById('platform').textContent = navigator.platform;
}

// Show Status Message
function showStatus(text, type = 'info') {
    statusMessage.textContent = text;
    statusMessage.className = `status-message ${type}`;
}

// Hide Status Message
function hideStatus() {
    statusMessage.style.display = 'none';
}

// Clear Form Errors
function clearErrors() {
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.classList.remove('error');
    });
}

// Validate Form
function validateForm(name, email, message) {
    clearErrors();
    const errors = [];
    
    // Name validation
    if (!name || name.trim().length < 2) {
        errors.push("Name must be at least 2 characters");
        document.getElementById('name').classList.add('error');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push("Please enter a valid email address");
        document.getElementById('email').classList.add('error');
    }
    
    // Message validation
    if (!message || message.trim().length < 10) {
        errors.push("Message must be at least 10 characters");
        document.getElementById('message').classList.add('error');
    } else if (message.length > 2000) {
        errors.push("Message must be less than 2000 characters");
        document.getElementById('message').classList.add('error');
    }
    
    return errors;
}

// Format Discord Message with IP Info
function formatDiscordMessage(name, email, category, message) {
    const timestamp = new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const truncatedMessage = message.length > 1000 
        ? message.substring(0, 1000) + '... [message truncated]' 
        : message;

    return {
        content: "📬 **New Contact Form Submission**",
        embeds: [{
            title: "Contact Request",
            color: 0x2cff6a,
            fields: [
                {
                    name: "👤 Contact Information",
                    value: `**Name:** ${name}\n**Email:** ${email}\n**Category:** ${category || 'Not specified'}`,
                    inline: false
                },
                {
                    name: "📝 Message",
                    value: truncatedMessage,
                    inline: false
                },
                {
                    name: "🌐 Connection Info",
                    value: `**IP:** ${userData.ip}\n**Platform:** ${userData.platform}\n**Browser:** ${navigator.userAgent.substring(0, 50)}...`,
                    inline: false
                },
                {
                    name: "⏰ Received",
                    value: timestamp,
                    inline: false
                }
            ],
            footer: {
                text: "thOSp Secure Portal • IP Logged for Security"
            },
            timestamp: new Date().toISOString()
        }]
    };
}

// Handle Form Submission
async function handleSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const category = document.getElementById('category').value;
    const honeypot = document.getElementById('website').value;
    
    // Honeypot check
    if (honeypot) {
        console.log('Bot detected');
        showStatus('Thank you for your message!', 'success');
        form.reset();
        charCounter.textContent = '0/2000';
        return;
    }
    
    // Validate form
    const errors = validateForm(name, email, message);
    if (errors.length > 0) {
        showStatus(errors.join('\n'), 'error');
        return;
    }
    
    // Check rate limit
    if (!rateLimiter.canProceed()) {
        const waitTime = rateLimiter.getTimeToWait();
        showStatus(`Please wait ${waitTime} seconds before sending another message.`, 'error');
        return;
    }
    
    // Update UI
    submitBtn.disabled = true;
    btnText.textContent = 'SENDING...';
    btnSpinner.style.display = 'inline-block';
    showStatus('Sending your message securely...', 'info');
    
    try {
        // Prepare and send message with IP info
        const discordMessage = formatDiscordMessage(name, email, category, message);
        
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discordMessage)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to send: ${response.status}`);
        }
        
        // Success
        showStatus('✅ Message sent successfully! We will respond soon.', 'success');
        form.reset();
        charCounter.textContent = '0/2000';
        
        // Reset button after delay
        setTimeout(() => {
            btnText.textContent = 'SEND MESSAGE';
            btnSpinner.style.display = 'none';
            submitBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('Error:', error);
        showStatus(`❌ Failed to send: ${error.message}. Please try again.`, 'error');
        
        // Reset button
        btnText.textContent = 'TRY AGAIN';
        btnSpinner.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Fetch IP address on page load
    fetchIPAddress();
    
    // Collect system info
    collectSystemInfo();
    
    // Character counter for message
    messageInput.addEventListener('input', () => {
        const length = messageInput.value.length;
        charCounter.textContent = `${length}/2000`;
        
        // Update color based on length
        if (length > 1900) {
            charCounter.className = 'char-counter error';
        } else if (length > 1500) {
            charCounter.className = 'char-counter warning';
        } else {
            charCounter.className = 'char-counter';
        }
    });
    
    // Clear errors on input
    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('error');
            hideStatus();
        });
    });
    
    // Form submission
    form.addEventListener('submit', handleSubmit);
    
    // Focus on name field
    document.getElementById('name').focus();
    
    console.log('thOSp Contact Portal');
    console.log('User Agent:', navigator.userAgent);
    console.log('Platform:', navigator.platform);
});
