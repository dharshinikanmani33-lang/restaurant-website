// ========================================
// Shared navigation helpers
// ========================================

function addButtonRedirect(selector, targetUrl) {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach(function(button) {
        button.addEventListener("click", function(event) {
            event.preventDefault();
            window.location.href = targetUrl;
        });
    });
}

function formatPhone(value) {
    return value.replace(/\D/g, "");
}

function getSavedUsers() {
    const raw = localStorage.getItem("users");
    if (!raw) {
        const legacyUser = localStorage.getItem("user");
        if (legacyUser) {
            try {
                const user = JSON.parse(legacyUser);
                if (user && user.email) {
                    const users = [user];
                    localStorage.setItem("users", JSON.stringify(users));
                    return users;
                }
            } catch (error) {
                return [];
            }
        }
        return [];
    }
    try {
        return JSON.parse(raw) || [];
    } catch (error) {
        return [];
    }
}

function setSavedUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getUserByEmail(email) {
    if (!email) return null;
    return getSavedUsers().find(function(user) {
        return user.email.toLowerCase() === email.trim().toLowerCase();
    }) || null;
}

function getCurrentUserEmail() {
    return localStorage.getItem("currentUser") || "";
}

function getCurrentUser() {
    return getUserByEmail(getCurrentUserEmail());
}

function setLoggedInUser(email) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", email.trim().toLowerCase());
}

function clearLoggedInUser() {
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem("currentUser");
}

function isLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true";
}

function showElement(selector, show) {
    const el = document.querySelector(selector);
    if (el) {
        el.style.display = show ? "" : "none";
    }
}

function buildProfileModal() {
    if (document.getElementById("profileModal")) {
        return;
    }

    const container = document.createElement("div");
    container.id = "profileModal";
    container.className = "profile-modal";
    container.innerHTML = `
        <div class="profile-modal-content">
            <button id="closeProfileBtn" class="close-profile-btn">&times;</button>
            <h2>Your Profile</h2>
            <div id="profileView" class="profile-view">
                <p><strong>Name:</strong> <span id="profileNameDisplay"></span></p>
                <p><strong>Email:</strong> <span id="profileEmailDisplay"></span></p>
                <p><strong>Phone:</strong> <span id="profilePhoneDisplay"></span></p>
            </div>
            <button id="editProfileBtn" class="profile-btn">Edit Profile</button>
            <form id="profileForm" class="profile-form hidden">
                <label>Name
                    <input type="text" id="profileNameInput" />
                </label>
                <label>Phone
                    <input type="text" id="profilePhoneInput" />
                </label>
                <button type="submit" class="profile-btn">Save</button>
            </form>
        </div>
    `;
    document.body.appendChild(container);

    container.addEventListener("click", function(event) {
        if (event.target === container) {
            closeProfileModal();
        }
    });

    document.getElementById("closeProfileBtn").addEventListener("click", closeProfileModal);
    document.getElementById("editProfileBtn").addEventListener("click", function() {
        const user = getCurrentUser();
        if (!user) {
            alert("No user is currently logged in.");
            return;
        }
        document.getElementById("profileNameInput").value = user.name || "";
        document.getElementById("profilePhoneInput").value = user.mobile || "";
        showElement("#profileView", false);
        showElement("#profileForm", true);
    });

    document.getElementById("profileForm").addEventListener("submit", function(event) {
        event.preventDefault();

        const nameValue = document.getElementById("profileNameInput").value.trim();
        const phoneValue = formatPhone(document.getElementById("profilePhoneInput").value);

        if (!nameValue) {
            alert("Please enter your name.");
            return;
        }
        if (phoneValue.length !== 10) {
            alert("Please enter a valid 10 digit phone number.");
            return;
        }

        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert("No active user found.");
            return;
        }

        const users = getSavedUsers();
        const existingUser = users.find(function(user) {
            return user.email.toLowerCase() === currentUser.email.toLowerCase();
        });
        if (existingUser) {
            existingUser.name = nameValue;
            existingUser.mobile = phoneValue;
            setSavedUsers(users);
            fillProfileView();
            showElement("#profileForm", false);
            showElement("#profileView", true);
            alert("Profile updated successfully.");
        }
    });
}

function buildAccountPopup() {
    const modal = document.getElementById("accountPickerModal");
    if (!modal) {
        return;
    }

    const accountList = document.getElementById("accountList");
    if (!accountList) {
        return;
    }

    accountList.innerHTML = "";
    const users = getSavedUsers();
    if (users.length === 0) {
        accountList.innerHTML = "<p class='account-popup-text'>No saved accounts yet. Create a new account.</p>";
        return;
    }

    users.forEach(function(user) {
        const entry = document.createElement("div");
        entry.className = "account-entry";
        entry.innerHTML = `
            <div class="account-entry-heading">${user.name || user.email}</div>
            <div class="account-entry-text">Email: ${user.email}</div>
            <div class="account-entry-text">Password: ${user.password}</div>
        `;
        entry.addEventListener("click", function() {
            const emailInput = document.getElementById("loginEmail");
            const passwordInput = document.getElementById("loginPassword");
            emailInput.value = user.email;
            passwordInput.value = user.password;
            hideAccountPopup();
            emailInput.focus();
        });
        accountList.appendChild(entry);
    });

    const closeButton = document.getElementById("closeAccountPopup");
    if (closeButton) {
        closeButton.addEventListener("click", hideAccountPopup);
    }
}

function showAccountPopupIfNeeded() {
    if (getCurrentPage() !== "login.html") {
        return;
    }

    const users = getSavedUsers();
    if (users.length === 0) {
        return;
    }

    const modal = document.getElementById("accountPickerModal");
    if (modal) {
        buildAccountPopup();
        modal.style.display = "flex";
    }
}

function hideAccountPopup() {
    const modal = document.getElementById("accountPickerModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function loginWithCredentials(emailValue, passwordValue) {
    const emailError = document.getElementById("loginEmailError");
    const passwordError = document.getElementById("loginPasswordError");
    emailError.innerText = "";
    passwordError.innerText = "";

    let isValid = true;
    if (!emailValue.trim()) {
        emailError.innerText = "Please enter email";
        isValid = false;
    }

    if (!passwordValue.trim()) {
        passwordError.innerText = "Please enter password";
        isValid = false;
    }

    if (isValid) {
        const storedUser = getUserByEmail(emailValue);
        if (!storedUser) {
            emailError.innerText = "No account found";
            isValid = false;
        } else if (storedUser.password !== passwordValue) {
            passwordError.innerText = "Incorrect password";
            isValid = false;
        }
    }

    if (isValid) {
        setLoggedInUser(emailValue);
        setTimeout(function() {
            alert("🎉 Login Successful!");
            redirectTo("home.html");
        }, 100);
    }
}

function fillProfileView() {
    const user = getCurrentUser();
    if (!user) {
        return;
    }
    document.getElementById("profileNameDisplay").innerText = user.name || "";
    document.getElementById("profileEmailDisplay").innerText = user.email || "";
    document.getElementById("profilePhoneDisplay").innerText = user.mobile || "";
}

function openProfileModal() {
    buildProfileModal();
    fillProfileView();
    showElement("#profileForm", false);
    showElement("#profileView", true);
    const modal = document.getElementById("profileModal");
    if (modal) {
        modal.style.display = "flex";
    }
}

function closeProfileModal() {
    const modal = document.getElementById("profileModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function updateProfileButton() {
    const profileBtn = document.getElementById("profileBtn");
    if (profileBtn) {
        profileBtn.style.display = isLoggedIn() ? "inline-block" : "none";
    }
}

function updateAuthButtons() {
    updateAuthLinks();
    updateLogoutButton();
    updateProfileButton();
}

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf("/") + 1);
    return page ? page.toLowerCase() : "index.html";
}

function redirectTo(targetUrl) {
    if (!window.location.href.includes(targetUrl)) {
        window.location.href = targetUrl;
    }
}

function updateAuthLinks() {
    const authLinks = document.querySelectorAll("a[href='login.html'], a[href='signup.html']");
    authLinks.forEach(function(link) {
        link.style.display = isLoggedIn() ? "none" : "inline";
    });
}

function updateLogoutButton() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.style.display = isLoggedIn() ? "inline-block" : "none";
    }
}

function setupLogoutButton() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
            localStorage.setItem("isLoggedIn", "false");
            localStorage.removeItem("currentUser");
            redirectTo("login.html");
        });
    }
}

function enforceAuthentication() {
    const page = getCurrentPage();
    const publicPages = ["login.html", "signup.html", "index.html"];

    if (publicPages.includes(page)) {
        if (isLoggedIn() && page !== "index.html") {
            redirectTo("home.html");
        }
        return;
    }

    if (!isLoggedIn()) {
        redirectTo("login.html");
    }
}

// ========================================
// Page startup
// ========================================

document.addEventListener("DOMContentLoaded", function() {
    enforceAuthentication();
    updateAuthButtons();
    setupLogoutButton();
    buildProfileModal();
    showAccountPopupIfNeeded();

    const profileBtn = document.getElementById("profileBtn");
    if (profileBtn) {
        profileBtn.addEventListener("click", openProfileModal);
    }

    const createAccountBtn = document.getElementById("createAccountBtn");
    if (createAccountBtn) {
        createAccountBtn.addEventListener("click", function() {
            redirectTo("signup.html");
        });
    }

    const loginNow = document.getElementById("loginNow");
    if (loginNow) {
        loginNow.addEventListener("click", function() {
            redirectTo("login.html");
        });
    }

    addButtonRedirect(".table-btn, .book-btn", "menu.html");
    addButtonRedirect("#exploreBtn", "menu.html");
    addButtonRedirect("#goCheckoutBtn", "checkout.html");

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const email = document.getElementById("loginEmail");
            const password = document.getElementById("loginPassword");

            loginWithCredentials(email.value, password.value);
        });
    }

    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const name = document.getElementById("signupName");
            const mobile = document.getElementById("signupMobile");
            const email = document.getElementById("signupEmail");
            const password = document.getElementById("signupPassword");
            const confirmPassword = document.getElementById("confirmPassword");

            const nameError = document.getElementById("signupNameError");
            const mobileError = document.getElementById("signupMobileError");
            const emailError = document.getElementById("signupEmailError");
            const passwordError = document.getElementById("signupPasswordError");
            const confirmPasswordError = document.getElementById("confirmPasswordError");

            nameError.innerText = "";
            mobileError.innerText = "";
            emailError.innerText = "";
            passwordError.innerText = "";
            confirmPasswordError.innerText = "";

            let isValid = true;
            const cleanMobile = formatPhone(mobile.value);

            if (!name.value.trim()) {
                nameError.innerText = "Enter your name";
                isValid = false;
            }

            if (cleanMobile.length !== 10) {
                mobileError.innerText = "Enter a valid 10 digit number";
                isValid = false;
            }

            if (!email.value.includes("@") || !email.value.includes(".")) {
                emailError.innerText = "Enter a valid email";
                isValid = false;
            }

            if (password.value.length < 6) {
                passwordError.innerText = "Password must contain at least 6 characters";
                isValid = false;
            }

            if (password.value !== confirmPassword.value) {
                confirmPasswordError.innerText = "Passwords do not match";
                isValid = false;
            }

            if (isValid) {
                const existingUser = getUserByEmail(email.value);
                if (existingUser) {
                    emailError.innerText = "An account with this email already exists.";
                    isValid = false;
                }
            }

            if (isValid) {
                const user = {
                    name: name.value.trim(),
                    mobile: cleanMobile,
                    email: email.value.trim().toLowerCase(),
                    password: password.value
                };
                const users = getSavedUsers();
                users.push(user);
                setSavedUsers(users);
                setLoggedInUser(user.email);
                alert("🎉 Account Created Successfully!");
                redirectTo("home.html");
            }
        });
    }

    const cartButtons = document.querySelectorAll(".cart-btn");
    const floatingCheckout = document.getElementById("floatingCheckout");
    cartButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            const foodName = this.dataset.name;
            const foodPrice = this.dataset.price;
            const foodImage = this.dataset.image;

            const foodItem = {
                name: foodName,
                price: foodPrice,
                image: foodImage
            };

            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            cart.push(foodItem);
            localStorage.setItem("cart", JSON.stringify(cart));

            if (floatingCheckout) {
                floatingCheckout.style.display = "flex";
            }

            this.innerText = "Added ✅";
            setTimeout(function() {
                button.innerText = "Add To Cart";
            }, 1000);
        });
    });

    const cartItemsContainer = document.getElementById("cartItems");
    if (cartItemsContainer) {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        let subtotal = 0;
        cartItemsContainer.innerHTML = "";

        cart.forEach(function(item) {
            subtotal += Number(item.price) || 0;
            cartItemsContainer.innerHTML += `
                <div class="cart-summary-item">
                    <img src="${item.image}">
                    <div>
                        <h4>${item.name}</h4>
                        <p>₹${item.price}</p>
                    </div>
                </div>
            `;
        });

        const tax = subtotal * 0.05;
        const delivery = 50;
        const total = subtotal + tax + delivery;

        const taxPrice = document.getElementById("taxPrice");
        if (taxPrice) {
            taxPrice.innerText = "₹" + Math.floor(tax);
        }

        const totalPrice = document.getElementById("totalPrice");
        if (totalPrice) {
            totalPrice.innerText = "₹" + Math.floor(total);
        }
    }

    const placeOrderBtn = document.querySelector(".place-order-btn");
    const orderPopup = document.getElementById("orderPopup");
    const popupTotal = document.getElementById("popupTotal");
    const closePopupBtn = document.getElementById("closePopupBtn");

    if (placeOrderBtn && orderPopup && popupTotal) {
        placeOrderBtn.addEventListener("click", function() {
            const totalPrice = document.getElementById("totalPrice");
            if (totalPrice) {
                popupTotal.innerText = totalPrice.innerText;
            }
            orderPopup.style.display = "flex";
        });
    }

    if (closePopupBtn) {
        closePopupBtn.addEventListener("click", function() {
            localStorage.removeItem("cart");
            redirectTo("home.html");
        });
    }
});
