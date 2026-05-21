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

function isLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true";
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
    updateAuthLinks();
    updateLogoutButton();
    setupLogoutButton();

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
            const emailError = document.getElementById("loginEmailError");
            const passwordError = document.getElementById("loginPasswordError");

            emailError.innerText = "";
            passwordError.innerText = "";

            let isValid = true;

            if (!email.value.trim()) {
                emailError.innerText = "Please enter email";
                isValid = false;
            }

            if (!password.value.trim()) {
                passwordError.innerText = "Please enter password";
                isValid = false;
            }

            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (isValid) {
                if (!storedUser) {
                    emailError.innerText = "No account found";
                    isValid = false;
                } else if (storedUser.email !== email.value.trim()) {
                    emailError.innerText = "Incorrect email";
                    isValid = false;
                } else if (storedUser.password !== password.value) {
                    passwordError.innerText = "Incorrect password";
                    isValid = false;
                }
            }

            if (isValid) {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("currentUser", email.value.trim());
                alert("🎉 Login Successful!");
                redirectTo("home.html");
            }
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
                const user = {
                    name: name.value.trim(),
                    mobile: cleanMobile,
                    email: email.value.trim(),
                    password: password.value
                };
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("currentUser", user.email);
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
