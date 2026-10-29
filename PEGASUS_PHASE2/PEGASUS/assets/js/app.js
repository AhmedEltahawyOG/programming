
/* =========================================================
   PEGASUS WEAR
   MAIN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       PRODUCTS
    ===================================================== */

    const PRODUCTS_KEY = "pegasusProducts";
    const CART_KEY = "pegasusCart";
    const WISHLIST_KEY = "pegasusWishlist";
    const ORDERS_KEY = "pegasusOrders";


    /* =====================================================
       GET ADMIN PRODUCTS
    ===================================================== */

    function getAdminProducts() {

        const savedProducts =
            JSON.parse(
                localStorage.getItem(PRODUCTS_KEY)
            ) || [];

        return Array.isArray(savedProducts)
            ? savedProducts
            : [];

    }


    /* =====================================================
       GET PRODUCT BY ID
    ===================================================== */

    function getProductById(productId) {

        return getAdminProducts().find(
            product =>
                String(product.id) ===
                String(productId)
        ) || null;

    }


   /* =====================================================
   PRODUCT SIZES
===================================================== */

function getProductSizes(product) {

    if (!product) {
        return [];
    }

    /*
     * First priority:
     * Use sizes saved from Admin Panel.
     */

    if (Array.isArray(product.sizes)) {

        const sizes = product.sizes
            .map(size => String(size).trim())
            .filter(Boolean);

        if (sizes.length > 0) {
            return [...new Set(sizes)];
        }
    }


    if (typeof product.sizes === "string") {

        const sizes = product.sizes
            .split(",")
            .map(size => size.trim())
            .filter(Boolean);

        if (sizes.length > 0) {
            return [...new Set(sizes)];
        }
    }


    /*
     * Fallback:
     * Clothing products get standard sizes.
     */

    const category =
        String(product.category || "")
            .toLowerCase()
            .trim();


    const clothingCategories = [
        "tshirt",
        "t-shirt",
        "t shirts",
        "t-shirts",
        "shirt",
        "shirts",
        "hoodie",
        "hoodies",
        "pants",
        "pant",
        "trousers",
        "joggers",
        "shorts"
    ];


    if (
        clothingCategories.includes(category)
    ) {

        return [
            "S",
            "M",
            "L",
            "XL",
            "XXL"
        ];

    }


    return [];

}
    /* =====================================================
       GET PRODUCT PRICE
    ===================================================== */

    function getProductPrice(product) {

        if (!product) {
            return 0;
        }

        const price =
            Number(product.price) || 0;

        const salePrice =
            Number(product.salePrice);


        if (
            product.salePrice !== undefined &&
            product.salePrice !== null &&
            product.salePrice !== "" &&
            !Number.isNaN(salePrice) &&
            salePrice > 0 &&
            salePrice < price
        ) {

            return salePrice;


        }


        return price;

    }


    /* =====================================================
       GET PRODUCT STOCK
    ===================================================== */

    function getProductStock(product) {

        if (!product) {
            return 0;
        }


        /* SIZE BASED STOCK */

        if (
            product.stock &&
            typeof product.stock === "object" &&
            !Array.isArray(product.stock)
        ) {

            return Object.values(product.stock)
                .reduce(
                    (total, value) => {

                        return total +
                            Math.max(
                                0,
                                Number(value) || 0
                            );

                    },
                    0
                );

        }

        /* OLD NUMERIC STOCK */

        if (
            typeof product.stock === "number" ||
            typeof product.stock === "string"
        ) {

            const stock =
                Number(product.stock);

            return Number.isNaN(stock)
                ? 0
                : Math.max(0, stock);

        }


        return 0;

    }


   /* =====================================================
   GET STOCK FOR SIZE
===================================================== */

function getStockForSize(product, size) {

    if (!product) {
        return 0;
    }


    if (
        product.stock &&
        typeof product.stock === "object" &&
        !Array.isArray(product.stock)
    ) {

        if (!size) {
            return getProductStock(product);
        }


        const requestedSize =
            String(size).trim();


        /*
         * Try exact match first.
         */

        if (
            Object.prototype.hasOwnProperty.call(
                product.stock,
                requestedSize
            )
        ) {

            return Math.max(
                0,
                Number(
                    product.stock[requestedSize]
                ) || 0
            );

        }


        /*
         * Try case-insensitive match.
         */

        const stockKey =
            Object.keys(product.stock).find(
                key =>
                    String(key)
                        .trim()
                        .toLowerCase() ===
                    requestedSize.toLowerCase()
            );


        if (stockKey !== undefined) {

            return Math.max(
                0,
                Number(
                    product.stock[stockKey]
                ) || 0
            );

        }


        return 0;

    }


    /*
     * Old products with normal numeric stock.
     */

    return getProductStock(product);

}

/* =====================================================
CREATE PRODUCT CARD
===================================================== */

function createProductCard(product) {


if (!product || !product.id) {
    return null;
}


const card =
    document.createElement("article");


card.className =
    "product-card";


const productId =
    String(product.id);


const category =
    String(product.category || "")
        .toLowerCase()
        .trim();


const originalPrice =
    Number(product.price) || 0;


const finalPrice =
    getProductPrice(product);


/* =================================================
   TOTAL STOCK
================================================= */

const totalStock =
    getProductStock(product);


/* =================================================
   PRODUCT IMAGE
================================================= */

const image =
    typeof product.image === "string"
        ? product.image.trim()
        : "";


const name =
    product.name || "Product";


const badge =
    product.badge || "";


const collection =
    product.collection ||
    category.toUpperCase();


const sizes =
    getProductSizes(product);


/* =================================================
   DATA ATTRIBUTES
================================================= */

card.dataset.productId =
    productId;


card.dataset.category =
    category;


card.dataset.price =
    finalPrice;


card.dataset.stock =
    totalStock;


card.dataset.name =
    name;


card.dataset.image =
    image;


card.dataset.collection =
    collection;


        /* =================================================
           SIZE HTML
        ================================================= */

        let sizeHTML = "";


        if (sizes.length > 0) {

            sizeHTML = `

                <div class="product-size-selector">

                    <span class="size-label">
                        SIZE
                    </span>

                    <div class="size-options">

                        ${sizes.map(size => {

                            const sizeStock =
                                getStockForSize(
                                    product,
                                    size
                                );

                            const disabled =
                                sizeStock <= 0;

                            return `

                                <button
                                    type="button"
                                    class="size-option ${disabled ? "disabled" : ""}"
                                    data-size="${size}"
                                    data-stock="${sizeStock}"
                                    aria-pressed="false"
                                    ${disabled ? "disabled" : ""}
                                >
                                    ${size}
                                </button>

                            `;

                        }).join("")}

                    </div>

                </div>

            `;

        }


        /* =================================================
           PRICE HTML
        ================================================= */

        let priceHTML = "";


        if (
            originalPrice > 0 &&
            finalPrice < originalPrice
        ) {

            priceHTML = `

                <p class="price">

                    <span class="old-price">
                        ${originalPrice} EGP
                    </span>

                    <span class="sale-price">
                        ${finalPrice} EGP
                    </span>

                </p>

            `;

        }

        else {

            priceHTML = `

                <p class="price">
                    ${finalPrice} EGP
                </p>

            `;

        }


        /* =================================================
           STOCK STATUS
        ================================================= */

        let stockHTML = "";


        if (totalStock <= 0) {

            stockHTML = `

                <span class="stock-status out-of-stock">
                    OUT OF STOCK
                </span>

            `;

        }

        else if (totalStock <= 5) {

            stockHTML = `

                <span class="stock-status low-stock">
                    Only ${totalStock} left
                </span>

            `;

        }


        /* =================================================
           BADGE
        ================================================= */

        const badgeHTML =
            badge
                ? `
                    <span class="badge">
                        ${badge}
                    </span>
                `
                : "";


        /* =================================================
           BUTTON
        ================================================= */

        const buttonText =
            totalStock <= 0
                ? "Out Of Stock"
                : "Add To Cart";


        card.innerHTML = `

            <button
                type="button"
                class="wishlist-button"
                aria-label="Add to wishlist"
            >
                <i class="fa-regular fa-heart"></i>
            </button>

            ${badgeHTML}

            <img
                src="${image}"
                alt="${name}"
            >

            <div class="product-info">

                <span class="product-category">
                    ${collection}
                </span>

                <h3>
                    ${name}
                </h3>

                ${priceHTML}

                <div class="rating">
                    ★★★★★
                </div>

                ${sizeHTML}

                ${stockHTML}

                <button
                    type="button"
                    class="add-to-cart"
                    ${totalStock <= 0 ? "disabled" : ""}
                >
                    ${buttonText}
                </button>

            </div>

        `;


        /* =================================================
           SIZE BUTTONS
        ================================================= */

        const sizeButtons =
            card.querySelectorAll(
                ".size-option"
            );


        sizeButtons.forEach(
            sizeButton => {

                sizeButton.addEventListener(
                    "click",
                    () => {

                        if (
                            sizeButton.disabled ||
                            sizeButton.classList.contains(
                                "disabled"
                            )
                        ) {

                            return;

                        }


                        sizeButtons.forEach(
                            button => {

                                button.classList.remove(
                                    "active"
                                );

                                button.setAttribute(
                                    "aria-pressed",
                                    "false"
                                );

                            }
                        );


                        sizeButton.classList.add(
                            "active"
                        );


                        sizeButton.setAttribute(
                            "aria-pressed",
                            "true"
                        );

                    }
                );

            }
        );


        return card;

    }


    /* =====================================================
       LOAD ADMIN PRODUCTS
    ===================================================== */

    function loadAdminProducts() {

        const shopGrid =
            document.getElementById(
                "shop-grid"
            );


        if (!shopGrid) {
            return;
        }


        const products =
            getAdminProducts();


        shopGrid.innerHTML = "";


        if (products.length === 0) {

            const noProducts =
                document.createElement("p");


            noProducts.className =
                "no-admin-products";


            noProducts.textContent =
                "No products available.";


            shopGrid.appendChild(
                noProducts
            );


            return;

        }


        products.forEach(
            product => {

                const card =
                    createProductCard(
                        product
                    );


                if (card) {

                    shopGrid.appendChild(
                        card
                    );

                }

            }
        );

    }


    loadAdminProducts();



    /* =====================================================
       CART
    ===================================================== */

    const cartCount =
        document.getElementById(
            "cart-count"
        );


    const cartPanel =
        document.getElementById(
            "cart-panel"
        );


    const cartOverlay =
        document.getElementById(
            "cart-overlay"
        );


    const closeCart =
        document.querySelector(
            ".close-cart"
        );


    const cartItemsContainer =
        document.querySelector(
            ".cart-items"
        );


    const cartTotal =
        document.querySelector(
            ".cart-total strong"
        );


    const cartIcon =
        document.querySelector(
            '.header-icon[aria-label="Cart"]'
        );


    /* =====================================================
       LOAD CART
    ===================================================== */

    let cart =
        JSON.parse(
            localStorage.getItem(
                CART_KEY
            )
        ) || [];


    if (!Array.isArray(cart)) {
        cart = [];
    }


    cart =
        cart
            .filter(
                item =>
                    item &&
                    item.id
            )
            .map(
                item => ({

                    ...item,

                    id:
                        String(item.id),

                    quantity:
                        Math.max(
                            1,
                            Number(
                                item.quantity
                            ) || 1
                        ),

                    price:
                        Number(item.price) || 0,

                    size:
                        item.size || null

                })
            );


    /* =====================================================
       SAVE CART
    ===================================================== */

    function saveCart() {

        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );
        loadAdminProducts();

    }


    /* =====================================================
       OPEN CART
    ===================================================== */

    function openCart() {

        if (cartPanel) {

            cartPanel.classList.add(
                "active"
            );

        }


        if (cartOverlay) {

            cartOverlay.classList.add(
                "active"
            );

        }

    }


    /* =====================================================
       CLOSE CART
    ===================================================== */

    function closeCartPanel() {

        if (cartPanel) {

            cartPanel.classList.remove(
                "active"
            );

        }


        if (cartOverlay) {

            cartOverlay.classList.remove(
                "active"
            );

        }

    }
/* =====================================================
   ADD PRODUCT TO CART
===================================================== */

function addProductToCart(button) {

    const card =
        button.closest(".product-card");


    if (!card) {
        console.error("Product card not found.");
        return;
    }


    const productId =
        String(
            card.dataset.productId || ""
        ).trim();


    if (!productId) {

        console.error(
            "Product ID missing from product card."
        );

        alert("Product ID is missing.");

        return;
    }


    const product =
        getProductById(productId);


    if (!product) {

        console.error(
            "Product not found:",
            productId
        );

        alert(
            "This product is no longer available."
        );

        return;
    }


    /* =================================================
       PRODUCT DATA
    ================================================= */

    const name =
        product.name || "Product";


    const price =
        getProductPrice(product);


    const image =
        product.image || "";


    const sizes =
        getProductSizes(product);


    /* =================================================
       TOTAL STOCK
    ================================================= */

    const totalStock =
        getProductStock(product);


    if (totalStock <= 0) {

        alert(
            "This product is out of stock."
        );

        return;
    }


    /* =================================================
       SELECTED SIZE
    ================================================= */

    let selectedSize = null;


    const activeSizeButton =
        card.querySelector(
            ".size-option.active"
        );


    if (activeSizeButton) {

        selectedSize =
            String(
                activeSizeButton.dataset.size || ""
            ).trim();

    }


    /* =================================================
       SIZE REQUIRED
    ================================================= */

    if (
        sizes.length > 0 &&
        !selectedSize
    ) {

        alert(
            "Please select a size first."
        );

        return;
    }


    /* =================================================
       CHECK STOCK
    ================================================= */

    const availableStock =
        getStockForSize(
            product,
            selectedSize
        );


    if (availableStock <= 0) {

        alert(
            selectedSize
                ? `Size ${selectedSize} is out of stock.`
                : "This product is out of stock."
        );

        return;
    }


    /* =================================================
       FIND EXISTING ITEM
       ID + SIZE = UNIQUE ITEM
    ================================================= */

    const existingProduct =
        cart.find(
            item =>
                String(item.id) ===
                    String(productId) &&
                String(item.size || "") ===
                    String(selectedSize || "")
        );


    /* =================================================
       EXISTING PRODUCT
    ================================================= */

    if (existingProduct) {

        const currentQuantity =
            Math.max(
                0,
                Number(
                    existingProduct.quantity
                ) || 0
            );


        if (
            currentQuantity >=
            availableStock
        ) {

            alert(
                `Only ${availableStock} available in stock.`
            );

            return;
        }


        existingProduct.quantity =
            currentQuantity + 1;


        existingProduct.stock =
            availableStock;


        existingProduct.name =
            name;


        existingProduct.price =
            price;


        existingProduct.image =
            image;


        existingProduct.size =
            selectedSize;

    }


    /* =================================================
       NEW PRODUCT
    ================================================= */

    else {

        cart.push({

            id:
                productId,

            name:
                name,

            price:
                price,

            image:
                image,

            size:
                selectedSize,

            stock:
                availableStock,

            quantity:
                1

        });

    }


    /* =================================================
       SAVE + UPDATE
    ================================================= */

    saveCart();

    updateCart();

    openCart();

}


/* =====================================================
   ADD TO CART EVENT
===================================================== */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".add-to-cart"
            );


        if (!button) {
            return;
        }


        if (button.disabled) {
            return;
        }


        addProductToCart(button);

    }
);

    /* =====================================================
       UPDATE CART
    ===================================================== */

    function updateCart() {

        cart.forEach(
            item => {

                const product =
                    getProductById(
                        item.id
                    );


                if (!product) {
                    return;
                }


                item.name =
                    product.name ||
                    item.name;


                item.price =
                    getProductPrice(
                        product
                    );


                item.image =
                    product.image ||
                    item.image;


                item.stock =
                    getStockForSize(
                        product,
                        item.size
                    );

            }
        );


        saveCart();


        /* =================================================
           CART COUNT
        ================================================= */

        if (cartCount) {

            const totalQuantity =
                cart.reduce(
                    (total, item) => {

                        return total +
                            (
                                Number(
                                    item.quantity
                                ) || 0
                            );

                    },
                    0
                );


            cartCount.textContent =
                totalQuantity;

        }


        if (!cartItemsContainer) {
            return;
        }


        /* =================================================
           EMPTY CART
        ================================================= */

        if (cart.length === 0) {

            cartItemsContainer.innerHTML = `

                <p class="empty-cart">
                    Your cart is empty.
                </p>

            `;


            if (cartTotal) {

                cartTotal.textContent =
                    "0 EGP";

            }


            return;

        }


        cartItemsContainer.innerHTML = "";


        let total = 0;


        /* =================================================
           RENDER CART
        ================================================= */

        cart.forEach(
            (item, index) => {

                const quantity =
                    Math.max(
                        1,
                        Number(
                            item.quantity
                        ) || 1
                    );


                const price =
                    Number(
                        item.price
                    ) || 0;


                total +=
                    price *
                    quantity;


                const cartItem =
                    document.createElement(
                        "div"
                    );


                cartItem.className =
                    "cart-item";


                const sizeHTML =
                    item.size
                        ? `
                            <p>
                                Size: ${item.size}
                            </p>
                        `
                        : "";


                const availableStock =
                    Number(
                        item.stock
                    ) || 0;


                cartItem.innerHTML = `

                    <img
                        src="${item.image || ""}"
                        alt="${item.name || "Product"}"
                    >

                    <div class="cart-item-info">

                        <h4>
                            ${item.name || "Product"}
                        </h4>

                        <p>
                            ${price} EGP
                        </p>

                        ${sizeHTML}

                        <div class="cart-quantity">

                            <button
                                type="button"
                                class="quantity-minus"
                                data-index="${index}"
                            >
                                −
                            </button>

                            <span>
                                ${quantity}
                            </span>

                            <button
                                type="button"
                                class="quantity-plus"
                                data-index="${index}"
                                ${
                                    availableStock > 0 &&
                                    quantity < availableStock
                                        ? ""
                                        : "disabled"
                                }
                            >
                                +
                            </button>

                        </div>

                    </div>

                    <button
                        type="button"
                        class="remove-cart-item"
                        data-index="${index}"
                        aria-label="Remove product"
                    >
                        ×
                    </button>

                `;


                cartItemsContainer.appendChild(
                    cartItem
                );

            }
        );


        if (cartTotal) {

            cartTotal.textContent =
                `${total} EGP`;

        }


        addCartControls();

    }


    /* =====================================================
       CART CONTROLS
    ===================================================== */

    function addCartControls() {

        const plusButtons =
            document.querySelectorAll(
                ".quantity-plus"
            );


        const minusButtons =
            document.querySelectorAll(
                ".quantity-minus"
            );


        const removeButtons =
            document.querySelectorAll(
                ".remove-cart-item"
            );


        /* =================================================
           PLUS
        ================================================= */

        plusButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );


                        if (!cart[index]) {
                            return;
                        }


                        const item =
                            cart[index];


                        const product =
                            getProductById(
                                item.id
                            );


                        if (!product) {

                            alert(
                                "This product is no longer available."
                            );

                            return;

                        }


                        const availableStock =
                            getStockForSize(
                                product,
                                item.size
                            );


                        const currentQuantity =
                            Number(
                                item.quantity
                            ) || 0;


                        if (
                            availableStock <= 0
                        ) {

                            alert(
                                item.size
                                    ? `Size ${item.size} is out of stock.`
                                    : "This product is out of stock."
                            );

                            return;

                        }


                        if (
                            currentQuantity >=
                            availableStock
                        ) {

                            alert(
                                `Only ${availableStock} available in stock.`
                            );

                            return;

                        }


                        item.quantity =
                            currentQuantity + 1;


                        updateCart();

                    }
                );

            }
        );


        /* =================================================
           MINUS
        ================================================= */

        minusButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );


                        if (!cart[index]) {
                            return;
                        }


                        cart[index].quantity =
                            (
                                Number(
                                    cart[index]
                                        .quantity
                                ) || 1
                            ) - 1;


                        if (
                            cart[index].quantity <= 0
                        ) {

                            cart.splice(
                                index,
                                1
                            );

                        }


                        updateCart();

                    }
                );

            }
        );


        /* =================================================
           REMOVE
        ================================================= */

        removeButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );


                        if (!cart[index]) {
                            return;
                        }


                        cart.splice(
                            index,
                            1
                        );


                        updateCart();

                    }
                );

            }
        );

    }


    /* =====================================================
       CART OPEN / CLOSE
    ===================================================== */

    if (cartIcon) {

        cartIcon.addEventListener(
            "click",
            openCart
        );

    }


    if (closeCart) {

        closeCart.addEventListener(
            "click",
            closeCartPanel
        );

    }


    if (cartOverlay) {

        cartOverlay.addEventListener(
            "click",
            closeCartPanel
        );

    }


    updateCart();



    /* =====================================================
       NEWSLETTER
    ===================================================== */

    const subscribeBtn =
        document.getElementById(
            "subscribeBtn"
        );


    if (subscribeBtn) {

        subscribeBtn.addEventListener(
            "click",
            () => {

                const emailInput =
                    document.querySelector(
                        ".newsletter-box input"
                    );


                if (!emailInput) {
                    return;
                }


                const email =
                    emailInput.value.trim();


                if (email === "") {

                    alert(
                        "Please enter your email."
                    );

                    emailInput.focus();

                    return;

                }


                const emailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (
                    !emailPattern.test(email)
                ) {

                    alert(
                        "Please enter a valid email."
                    );

                    emailInput.focus();

                    return;

                }


                alert(
                    "Thank you for joining Pegasus Wear."
                );


                emailInput.value = "";

            }
        );

    }



    /* =====================================================
       SHOP FILTERS
    ===================================================== */

    const shopGrid =
        document.getElementById(
            "shop-grid"
        );


    if (shopGrid) {

        const noResults =
            document.getElementById(
                "no-results"
            );


        const categoryCheckboxes =
            document.querySelectorAll(
                ".filter-cat"
            );


        const priceRadios =
            document.querySelectorAll(
                ".filter-price"
            );


        const sortSelect =
            document.getElementById(
                "sort-select"
            );


        function getActiveCategories() {

            return Array.from(
                categoryCheckboxes
            )
            .filter(
                checkbox =>
                    checkbox.checked
            )
            .map(
                checkbox =>
                    String(
                        checkbox.value
                    )
                    .toLowerCase()
                    .trim()
            );

        }


        function getActivePriceRange() {

            const checked =
                document.querySelector(
                    ".filter-price:checked"
                );


            return checked
                ? checked.value
                : "all";

        }


        function matchesPrice(
            price,
            range
        ) {

            if (range === "all") {
                return true;
            }


            if (range === "under400") {
                return price < 400;
            }


            if (range === "400to700") {

                return (
                    price >= 400 &&
                    price <= 700
                );

            }


            if (range === "over700") {
                return price > 700;
            }


            return true;

        }


        function applyFilters() {

            const activeCategories =
                getActiveCategories();


            const priceRange =
                getActivePriceRange();


            const cards =
                Array.from(
                    shopGrid.querySelectorAll(
                        ".product-card"
                    )
                );


            cards.forEach(
                card => {

                    const category =
                        (
                            card.dataset.category ||
                            ""
                        )
                        .toLowerCase()
                        .trim();


                    const price =
                        Number(
                            card.dataset.price
                        ) || 0;


                    const categoryMatch =
                        activeCategories.length === 0 ||
                        activeCategories.includes(
                            category
                        );


                    const priceMatch =
                        matchesPrice(
                            price,
                            priceRange
                        );


                    card.dataset.filterVisible =
                        (
                            categoryMatch &&
                            priceMatch
                        )
                            ? "true"
                            : "false";

                }
            );


            applyCombinedVisibility();

        }


        function applyCombinedVisibility() {

            const cards =
                Array.from(
                    shopGrid.querySelectorAll(
                        ".product-card"
                    )
                );


            let visibleCount = 0;


            cards.forEach(
                card => {

                    const filterVisible =
                        card.dataset.filterVisible !==
                        "false";


                    const searchVisible =
                        card.dataset.searchVisible !==
                        "false";


                    const show =
                        filterVisible &&
                        searchVisible;


                    card.style.display =
                        show
                            ? ""
                            : "none";


                    if (show) {
                        visibleCount++;
                    }

                }
            );


            if (noResults) {

                noResults.style.display =
                    visibleCount === 0
                        ? "block"
                        : "none";

            }

        }


        function applySort() {

            if (!sortSelect) {
                return;
            }


            const mode =
                sortSelect.value;


            const cards =
                [
                    ...shopGrid.querySelectorAll(
                        ".product-card"
                    )
                ];


            if (mode === "low-high") {

                cards.sort(
                    (a, b) =>
                        Number(a.dataset.price) -
                        Number(b.dataset.price)
                );

            }

            else if (mode === "high-low") {

                cards.sort(
                    (a, b) =>
                        Number(b.dataset.price) -
                        Number(a.dataset.price)
                );

            }

            else if (mode === "name") {

                cards.sort(
                    (a, b) => {

                        const nameA =
                            a.querySelector("h3")
                                ?.textContent
                                .trim()
                                .toLowerCase() ||
                            "";


                        const nameB =
                            b.querySelector("h3")
                                ?.textContent
                                .trim()
                                .toLowerCase() ||
                            "";


                        return nameA.localeCompare(
                            nameB
                        );

                    }
                );

            }


            cards.forEach(
                card =>
                    shopGrid.appendChild(
                        card
                    )
            );

        }


        shopGrid
            .querySelectorAll(
                ".product-card"
            )
            .forEach(
                card => {

                    card.dataset.filterVisible =
                        "true";

                    card.dataset.searchVisible =
                        "true";

                }
            );


        categoryCheckboxes.forEach(
            checkbox => {

                checkbox.addEventListener(
                    "change",
                    applyFilters
                );

            }
        );


        priceRadios.forEach(
            radio => {

                radio.addEventListener(
                    "change",
                    applyFilters
                );

            }
        );


        if (sortSelect) {

            sortSelect.addEventListener(
                "change",
                () => {

                    applySort();

                    applyFilters();

                }
            );

        }


        applyFilters();

    }



    /* =====================================================
       HERO SCROLL EFFECT
    ===================================================== */

    const heroContent =
        document.querySelector(
            ".hero-content"
        );


    if (heroContent) {

        let ticking = false;


        window.addEventListener(
            "scroll",
            () => {

                if (!ticking) {

                    window.requestAnimationFrame(
                        () => {

                            const scrollY =
                                window.scrollY;


                            const opacity =
                                Math.max(
                                    0,
                                    1 -
                                    scrollY / 500
                                );


                            heroContent.style.opacity =
                                opacity;


                            heroContent.style.transform =
                                `translateY(${scrollY * 0.3}px)`;


                            ticking = false;

                        }
                    );


                    ticking = true;

                }

            },
            {
                passive: true
            }
        );

    }



    /* =====================================================
       HEADER
    ===================================================== */

    const header =
        document.querySelector(
            ".header"
        );


    if (header) {

        const updateHeader =
            () => {

                if (
                    window.scrollY > 80
                ) {

                    header.classList.add(
                        "active"
                    );

                }

                else {

                    header.classList.remove(
                        "active"
                    );

                }

            };


        updateHeader();


        window.addEventListener(
            "scroll",
            updateHeader,
            {
                passive: true
            }
        );

    }



    /* =====================================================
       STORY ANIMATION
    ===================================================== */

    const storyLeft =
        document.querySelector(
            ".story-left"
        );


    const storyRight =
        document.querySelector(
            ".story-right"
        );


    if (
        storyLeft &&
        storyRight &&
        "IntersectionObserver" in window
    ) {

        const storyObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                storyLeft.classList.add(
                                    "show"
                                );


                                storyRight.classList.add(
                                    "show"
                                );


                                storyObserver.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.25
                }
            );


        storyObserver.observe(
            storyLeft
        );

    }



    /* =====================================================
       MOBILE FILTER TOGGLE
    ===================================================== */

    const filterToggle =
        document.querySelector(
            ".filter-toggle"
        );


    const shopSidebar =
        document.querySelector(
            ".shop-sidebar"
        );


    if (
        filterToggle &&
        shopSidebar
    ) {

        filterToggle.addEventListener(
            "click",
            () => {

                const isOpen =
                    shopSidebar.classList.toggle(
                        "active"
                    );


                filterToggle.setAttribute(
                    "aria-expanded",
                    isOpen
                        ? "true"
                        : "false"
                );

            }
        );

    }



    /* =====================================================
       WISHLIST
    ===================================================== */

    let wishlist =
        JSON.parse(
            localStorage.getItem(
                WISHLIST_KEY
            )
        ) || [];


    if (!Array.isArray(wishlist)) {
        wishlist = [];
    }


    function updateWishlistStorage() {

        localStorage.setItem(
            WISHLIST_KEY,
            JSON.stringify(wishlist)
        );

    }


    function isInWishlist(productId) {

        return wishlist.some(
            item =>
                String(item.id) ===
                String(productId)
        );

    }


    function updateWishlistButton(
        button,
        active
    ) {

        if (!button) {
            return;
        }


        if (active) {

            button.classList.add(
                "active"
            );


            button.innerHTML =
                '<i class="fa-solid fa-heart"></i>';

        }

        else {

            button.classList.remove(
                "active"
            );


            button.innerHTML =
                '<i class="fa-regular fa-heart"></i>';

        }

    }


    function setupWishlistButtons() {

        const wishlistButtons =
            document.querySelectorAll(
                ".wishlist-button"
            );


        wishlistButtons.forEach(
            button => {

                if (
                    button.dataset.wishlistReady ===
                    "true"
                ) {

                    return;

                }


                button.dataset.wishlistReady =
                    "true";


                const card =
                    button.closest(
                        ".product-card"
                    );


                if (!card) {
                    return;
                }


                const productId =
                    card.dataset.productId;


                updateWishlistButton(
                    button,
                    isInWishlist(
                        productId
                    )
                );


                button.addEventListener(
                    "click",
                    () => {

                        if (!productId) {
                            return;
                        }


                        const existingIndex =
                            wishlist.findIndex(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(
                                        productId
                                    )
                            );


                        if (
                            existingIndex !== -1
                        ) {

                            wishlist.splice(
                                existingIndex,
                                1
                            );


                            updateWishlistButton(
                                button,
                                false
                            );

                        }

                        else {

                            const product =
                                getProductById(
                                    productId
                                );


                            if (!product) {
                                return;
                            }


                            wishlist.push({

                                id:
                                    String(
                                        product.id
                                    ),

                                name:
                                    product.name ||
                                    "Product",

                                price:
                                    getProductPrice(
                                        product
                                    ),

                                image:
                                    product.image ||
                                    ""

                            });


                            updateWishlistButton(
                                button,
                                true
                            );

                        }


                        updateWishlistStorage();

                    }
                );

            }
        );

    }


    setupWishlistButtons();



    /* =====================================================
       WISHLIST PANEL
    ===================================================== */

    const wishlistHeaderButton =
        document.querySelector(
            '.header-icon[aria-label="Wishlist"]'
        );


    const wishlistPanel =
        document.getElementById(
            "wishlist-panel"
        );


    const wishlistOverlay =
        document.getElementById(
            "wishlist-overlay"
        );


    const closeWishlist =
        document.getElementById(
            "close-wishlist"
        );


    const wishlistItems =
        document.getElementById(
            "wishlist-items"
        );


    function renderWishlist() {

        if (!wishlistItems) {
            return;
        }


        if (wishlist.length === 0) {

            wishlistItems.innerHTML = `

                <p class="empty-wishlist">
                    Your wishlist is empty.
                </p>

            `;


            return;

        }


        wishlistItems.innerHTML = "";


        wishlist.forEach(
            item => {

                const product =
                    getProductById(
                        item.id
                    );


                const currentName =
                    product?.name ||
                    item.name ||
                    "Product";


                const currentPrice =
                    product
                        ? getProductPrice(product)
                        : Number(item.price) || 0;


                const currentImage =
                    product?.image ||
                    item.image ||
                    "";


                const wishlistItem =
                    document.createElement(
                        "div"
                    );


                wishlistItem.className =
                    "wishlist-item";


                wishlistItem.innerHTML = `

                    <img
                        src="${currentImage}"
                        alt="${currentName}"
                    >

                    <div>

                        <h4>
                            ${currentName}
                        </h4>

                        <p>
                            ${currentPrice} EGP
                        </p>

                    </div>

                    <button
                        type="button"
                        class="remove-wishlist"
                        aria-label="Remove from wishlist"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                `;


                const removeButton =
                    wishlistItem.querySelector(
                        ".remove-wishlist"
                    );


                if (removeButton) {

                    removeButton.addEventListener(
                        "click",
                        () => {

                            const index =
                                wishlist.findIndex(
                                    wishlistProduct =>
                                        String(
                                            wishlistProduct.id
                                        ) ===
                                        String(
                                            item.id
                                        )
                                );


                            if (index !== -1) {

                                wishlist.splice(
                                    index,
                                    1
                                );

                            }


                            updateWishlistStorage();


                            document
                                .querySelectorAll(
                                    ".product-card"
                                )
                                .forEach(
                                    card => {

                                        if (
                                            String(
                                                card.dataset.productId
                                            ) !==
                                            String(
                                                item.id
                                            )
                                        ) {

                                            return;

                                        }


                                        const button =
                                            card.querySelector(
                                                ".wishlist-button"
                                            );


                                        updateWishlistButton(
                                            button,
                                            false
                                        );

                                    }
                                );


                            renderWishlist();

                        }
                    );

                }


                wishlistItems.appendChild(
                    wishlistItem
                );

            }
        );

    }


    function openWishlist() {

        if (!wishlistPanel) {
            return;
        }


        renderWishlist();


        wishlistPanel.classList.add(
            "active"
        );


        if (wishlistOverlay) {

            wishlistOverlay.classList.add(
                "active"
            );

        }

    }


    function closeWishlistPanel() {

        if (wishlistPanel) {

            wishlistPanel.classList.remove(
                "active"
            );

        }


        if (wishlistOverlay) {

            wishlistOverlay.classList.remove(
                "active"
            );

        }

    }


    if (wishlistHeaderButton) {

        wishlistHeaderButton.addEventListener(
            "click",
            openWishlist
        );

    }


    if (closeWishlist) {

        closeWishlist.addEventListener(
            "click",
            closeWishlistPanel
        );

    }


    if (wishlistOverlay) {

        wishlistOverlay.addEventListener(
            "click",
            closeWishlistPanel
        );

    }



    /* =====================================================
       SEARCH
    ===================================================== */

    const searchButton =
        document.querySelector(
            '.header-icon[aria-label="Search"]'
        );


    const searchOverlay =
        document.getElementById(
            "search-overlay"
        );


    const searchInput =
        document.getElementById(
            "search-input"
        );


    const searchClose =
        document.getElementById(
            "search-close"
        );


    function openSearch() {

        if (!searchOverlay) {
            return;
        }


        searchOverlay.classList.add(
            "active"
        );


        if (searchInput) {

            setTimeout(
                () => {

                    searchInput.focus();

                },
                200
            );

        }

    }


    function closeSearch() {

        if (!searchOverlay) {
            return;
        }


        searchOverlay.classList.remove(
            "active"
        );

    }


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            openSearch
        );

    }


    if (searchClose) {

        searchClose.addEventListener(
            "click",
            closeSearch
        );

    }


    if (searchOverlay) {

        searchOverlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    searchOverlay
                ) {

                    closeSearch();

                }

            }
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                const searchTerm =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                const currentShopGrid =
                    document.getElementById(
                        "shop-grid"
                    );


                if (!currentShopGrid) {
                    return;
                }


                const products =
                    currentShopGrid.querySelectorAll(
                        ".product-card"
                    );


                products.forEach(
                    product => {

                        const productName =
                            product.querySelector(
                                "h3"
                            )
                            ?.textContent
                            .toLowerCase() ||
                            "";


                        const category =
                            product.querySelector(
                                ".product-category"
                            )
                            ?.textContent
                            .toLowerCase() ||
                            "";


                        const matches =
                            searchTerm === "" ||
                            productName.includes(
                                searchTerm
                            ) ||
                            category.includes(
                                searchTerm
                            );


                        product.dataset.searchVisible =
                            matches
                                ? "true"
                                : "false";

                    }
                );


                products.forEach(
                    product => {

                        if (
                            product.dataset.filterVisible ===
                            undefined
                        ) {

                            product.dataset.filterVisible =
                                "true";

                        }

                    }
                );


                let visibleProducts = 0;


                products.forEach(
                    product => {

                        const filterVisible =
                            product.dataset.filterVisible !==
                            "false";


                        const searchVisible =
                            product.dataset.searchVisible !==
                            "false";


                        const show =
                            filterVisible &&
                            searchVisible;


                        product.style.display =
                            show
                                ? ""
                                : "none";


                        if (show) {
                            visibleProducts++;
                        }

                    }
                );


                const noResults =
                    document.getElementById(
                        "no-results"
                    );


                if (noResults) {

                    noResults.style.display =
                        visibleProducts === 0
                            ? "block"
                            : "none";

                }

            }
        );

    }



    /* =====================================================
       ESCAPE
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeSearch();

                closeWishlistPanel();

                closeCartPanel();

            }

        }
    );



    /* =====================================================
       CHECKOUT
    ===================================================== */

    const checkoutItems =
        document.getElementById(
            "checkout-items"
        );


    const checkoutSubtotal =
        document.getElementById(
            "checkout-subtotal"
        );


    const checkoutShipping =
        document.getElementById(
            "checkout-shipping"
        );


    const checkoutTotal =
        document.getElementById(
            "checkout-total"
        );


    /* =====================================================
       LOAD CHECKOUT
    ===================================================== */

    function loadCheckout() {

        if (!checkoutItems) {
            return;
        }


        const savedCart =
            JSON.parse(
                localStorage.getItem(
                    CART_KEY
                )
            ) || [];


        if (
            !Array.isArray(savedCart) ||
            savedCart.length === 0
        ) {

            checkoutItems.innerHTML = `

                <p class="empty-checkout">
                    Your cart is empty.
                </p>

            `;


            if (checkoutSubtotal) {
                checkoutSubtotal.textContent =
                    "0 EGP";
            }


            if (checkoutShipping) {
                checkoutShipping.textContent =
                    "0 EGP";
            }


            if (checkoutTotal) {
                checkoutTotal.textContent =
                    "0 EGP";
            }


            return;

        }


        checkoutItems.innerHTML = "";


        let subtotal = 0;


        savedCart.forEach(
            item => {

                const quantity =
                    Math.max(
                        1,
                        Number(
                            item.quantity
                        ) || 1
                    );


                const price =
                    Number(
                        item.price
                    ) || 0;


                subtotal +=
                    price *
                    quantity;


                const itemElement =
                    document.createElement(
                        "div"
                    );


                itemElement.className =
                    "checkout-item";


                itemElement.innerHTML = `

                    <img
                        src="${item.image || ""}"
                        alt="${item.name || "Product"}"
                    >

                    <div class="checkout-item-info">

                        <h4>
                            ${item.name || "Product"}
                        </h4>

                        ${
                            item.size
                                ? `
                                    <p>
                                        Size: ${item.size}
                                    </p>
                                `
                                : ""
                        }

                        <p>
                            Quantity: ${quantity}
                        </p>

                        <strong>
                            ${price * quantity} EGP
                        </strong>

                    </div>

                `;


                checkoutItems.appendChild(
                    itemElement
                );

            }
        );


        const shipping =
            subtotal > 0
                ? 50
                : 0;


        const total =
            subtotal +
            shipping;


        if (checkoutSubtotal) {

            checkoutSubtotal.textContent =
                `${subtotal} EGP`;

        }


        if (checkoutShipping) {

            checkoutShipping.textContent =
                `${shipping} EGP`;

        }


        if (checkoutTotal) {

            checkoutTotal.textContent =
                `${total} EGP`;

        }

    }


    loadCheckout();



    /* =====================================================
       PLACE ORDER
    ===================================================== */

    const placeOrderButton =
        document.getElementById(
            "place-order"
        );


    if (placeOrderButton) {

        placeOrderButton.addEventListener(
            "click",
            () => {

                /* =================================================
                   CUSTOMER INFORMATION
                ================================================= */

                const firstName =
                    document
                        .getElementById(
                            "first-name"
                        )
                        ?.value
                        .trim();


                const lastName =
                    document
                        .getElementById(
                            "last-name"
                        )
                        ?.value
                        .trim();


                const email =
                    document
                        .getElementById(
                            "email"
                        )
                        ?.value
                        .trim();


                const phone =
                    document
                        .getElementById(
                            "phone"
                        )
                        ?.value
                        .trim();


                const address =
                    document
                        .getElementById(
                            "address"
                        )
                        ?.value
                        .trim();


                const city =
                    document
                        .getElementById(
                            "city"
                        )
                        ?.value
                        .trim();


                const area =
                    document
                        .getElementById(
                            "area"
                        )
                        ?.value
                        .trim();


                /* =================================================
                   VALIDATE CUSTOMER INFO
                ================================================= */

                if (
                    !firstName ||
                    !lastName ||
                    !email ||
                    !phone ||
                    !address ||
                    !city ||
                    !area
                ) {

                    alert(
                        "Please complete all customer information."
                    );

                    return;

                }


                /* =================================================
                   GET LATEST CART
                ================================================= */

                const savedCart =
                    JSON.parse(
                        localStorage.getItem(
                            CART_KEY
                        )
                    ) || [];


                if (
                    !Array.isArray(savedCart) ||
                    savedCart.length === 0
                ) {

                    alert(
                        "Your cart is empty."
                    );

                    return;

                }


                /* =================================================
                   PAYMENT
                ================================================= */

                const paymentMethod =
                    document.querySelector(
                        'input[name="payment"]:checked'
                    )?.value ||
                    "cod";


                /* =================================================
                   GET LATEST PRODUCTS
                ================================================= */

                const latestProducts =
                    getAdminProducts();


                let stockError = null;


                /* =================================================
                   VERIFY STOCK FIRST
                ================================================= */

                for (
                    const item of savedCart
                ) {

                    const product =
                        latestProducts.find(
                            product =>
                                String(product.id) ===
                                String(item.id)
                        );


                    if (!product) {

                        stockError =
                            `${item.name || "Product"} is no longer available.`;

                        break;

                    }


                    const quantity =
                        Math.max(
                            1,
                            Number(
                                item.quantity
                            ) || 1
                        );


                    const size =
                        item.size || null;


                    /* =================================================
                       SIZE BASED STOCK
                    ================================================= */

                    if (
                        product.stock &&
                        typeof product.stock === "object" &&
                        !Array.isArray(product.stock)
                    ) {

                        if (!size) {

                            stockError =
                                `Please select a size for ${product.name}.`;

                            break;

                        }


                        const available =
                            Math.max(
                                0,
                                Number(
                                    product.stock[size]
                                ) || 0
                            );


                        if (
                            available < quantity
                        ) {

                            stockError =
                                `${product.name} - Size ${size}: only ${available} left in stock.`;

                            break;

                        }

                    }

                    /* =================================================
                       NUMERIC STOCK
                    ================================================= */

                    else {

                        const available =
                            Math.max(
                                0,
                                Number(
                                    product.stock
                                ) || 0
                            );


                        if (
                            available < quantity
                        ) {

                            stockError =
                                `${product.name}: only ${available} left in stock.`;

                            break;

                        }

                    }

                }


                /* =================================================
                   STOP ORDER IF STOCK CHANGED
                ================================================= */

                if (stockError) {

                    alert(stockError);

                    /*
                     * Rebuild Shop cards so the
                     * latest inventory is visible.
                     */

                    loadAdminProducts();

                    return;

                }


                /* =================================================
                   DEDUCT STOCK
                   ONLY AFTER STOCK VERIFICATION
                ================================================= */

                savedCart.forEach(
                    item => {

                        const product =
                            latestProducts.find(
                                product =>
                                    String(product.id) ===
                                    String(item.id)
                            );


                        if (!product) {
                            return;
                        }


                        const quantity =
                            Math.max(
                                1,
                                Number(
                                    item.quantity
                                ) || 1
                            );


                        const size =
                            item.size || null;


                        /* SIZE STOCK */

                        if (
                            product.stock &&
                            typeof product.stock === "object" &&
                            !Array.isArray(product.stock)
                        ) {

                            if (size) {

                                const currentStock =
                                    Math.max(
                                        0,
                                        Number(
                                            product.stock[size]
                                        ) || 0
                                    );


                                product.stock[size] =
                                    Math.max(
                                        0,
                                        currentStock -
                                        quantity
                                    );

                            }

                        }

                        /* NUMERIC STOCK */

                        else {

                            const currentStock =
                                Math.max(
                                    0,
                                    Number(
                                        product.stock
                                    ) || 0
                                );


                            product.stock =
                                Math.max(
                                    0,
                                    currentStock -
                                    quantity
                                );

                        }

                    }
                );


                /* =================================================
                   SAVE UPDATED INVENTORY
                ================================================= */

                localStorage.setItem(
                    PRODUCTS_KEY,
                    JSON.stringify(
                        latestProducts
                    )
                );


                /* =================================================
                   CALCULATE TOTALS
                ================================================= */

                let subtotal = 0;


                savedCart.forEach(
                    item => {

                        const quantity =
                            Math.max(
                                1,
                                Number(
                                    item.quantity
                                ) || 1
                            );


                        const price =
                            Number(
                                item.price
                            ) || 0;


                        subtotal +=
                            price *
                            quantity;

                    }
                );


                const shipping =
                    subtotal > 0
                        ? 50
                        : 0;


                const total =
                    subtotal +
                    shipping;
                /* =================================================
                   CREATE ORDER
                ================================================= */

                const order = {

                    id:
                        "PEG-" +
                        Date.now(),

                    customer: {

                        firstName:
                            firstName,

                        lastName:
                            lastName,

                        email:
                            email,

                        phone:
                            phone,

                        address:
                            address,

                        city:
                            city,

                        area:
                            area

                    },

                    payment:
                        paymentMethod,

                    products:
                        savedCart,

                    subtotal:
                        subtotal,

                    shipping:
                        shipping,

                    total:
                        total,

                    date:
                        new Date()
                            .toISOString(),

                    status:
                        "pending"

                };


                /* =================================================
                   SAVE ORDERS
                ================================================= */

                const existingOrders =
                    JSON.parse(
                        localStorage.getItem(
                            ORDERS_KEY
                        )
                    ) || [];


                const orders =
                    Array.isArray(
                        existingOrders
                    )
                        ? existingOrders
                        : [];


                orders.push(
                    order
                );


                localStorage.setItem(
                    ORDERS_KEY,
                    JSON.stringify(
                        orders
                    )
                );


                /* =================================================
                   SAVE LAST ORDER
                ================================================= */

                localStorage.setItem(
                    "pegasusLastOrder",
                    JSON.stringify(
                        order
                    )
                );


                /* =================================================
                   SAVE SELECTED ORDER
                ================================================= */

                localStorage.setItem(
                    "pegasusSelectedOrder",
                    JSON.stringify(
                        order
                    )
                );


                /* =================================================
                   CLEAR CART
                ================================================= */

                localStorage.removeItem(
                    CART_KEY
                );


                /* =================================================
                   GO TO CONFIRMATION
                ================================================= */

                window.location.href =
                    "order-confirmation.html";

            }
        );

    }

});