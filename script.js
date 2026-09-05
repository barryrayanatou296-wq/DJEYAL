// ==========================================
// DJEYAL — CONNEXION SUPABASE
// ==========================================

const SUPABASE_URL = "https://ydwlhnkbbtcijwufvkut.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_T2mV-EpxCJjp3ZgUMEaTWQ_4ICenNfp";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ==========================================
// DJEYAL — APPLICATION
// Personnalisation + Panier + Produits
// ==========================================

document.addEventListener("DOMContentLoaded", function () {


    // =====================================================
    // 1. PERSONNALISATION DJEYAL
    // =====================================================

    const body = document.body;

    const openCustomizer =
        document.getElementById("openCustomizer");

    const closeCustomizer =
        document.getElementById("closeCustomizer");

    const customizerOverlay =
        document.getElementById("customizerOverlay");

    const themeOptions =
        document.querySelectorAll("[data-theme]");

    const buttonOptions =
        document.querySelectorAll("[data-button-style]");

    const layoutOptions =
        document.querySelectorAll("[data-layout]");

    const doodleToggle =
        document.getElementById("doodleToggle");

    const animationToggle =
        document.getElementById("animationToggle");

    const resetCustomizer =
        document.getElementById("resetCustomizer");


    // Ouvrir

    if (openCustomizer && customizerOverlay) {

        openCustomizer.addEventListener("click", function () {

            customizerOverlay.classList.add("open");

            document.body.style.overflow = "hidden";

        });

    }


    // Fermer

    function closeCustomizerPanel() {

        if (customizerOverlay) {

            customizerOverlay.classList.remove("open");

            document.body.style.overflow = "";

        }

    }


    if (closeCustomizer) {

        closeCustomizer.addEventListener(
            "click",
            closeCustomizerPanel
        );

    }


    if (customizerOverlay) {

        customizerOverlay.addEventListener(
            "click",
            function (event) {

                if (event.target === customizerOverlay) {

                    closeCustomizerPanel();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeCustomizerPanel();

            }

        }
    );


    // =====================================================
    // PREFERENCES
    // =====================================================

    const defaultSettings = {

        theme: "burgundy",

        buttonStyle: "black",

        layout: "normal",

        doodles: true,

        animations: true

    };


    let settings = {
        ...defaultSettings
    };


    try {

        const savedSettings =
            localStorage.getItem("djeyalSettings");

        if (savedSettings) {

            settings = {

                ...defaultSettings,

                ...JSON.parse(savedSettings)

            };

        }

    } catch (error) {

        console.log(
            "Impossible de charger les préférences DJEYAL."
        );

    }


    function saveSettings() {

        try {

            localStorage.setItem(
                "djeyalSettings",
                JSON.stringify(settings)
            );

        } catch (error) {

            console.log(
                "Impossible de sauvegarder les préférences."
            );

        }

    }


    function applyTheme(theme) {

        body.setAttribute(
            "data-theme",
            theme
        );

        themeOptions.forEach(function (option) {

            option.classList.remove("active");

            if (
                option.dataset.theme === theme
            ) {

                option.classList.add("active");

            }

        });

        settings.theme = theme;

        saveSettings();

    }


    function applyButtonStyle(style) {

        body.setAttribute(
            "data-button-style",
            style
        );

        buttonOptions.forEach(function (option) {

            option.classList.remove("active");

            if (
                option.dataset.buttonStyle === style
            ) {

                option.classList.add("active");

            }

        });

        settings.buttonStyle = style;

        saveSettings();

    }


    function applyLayout(layout) {

        body.setAttribute(
            "data-layout",
            layout
        );

        layoutOptions.forEach(function (option) {

            option.classList.remove("active");

            if (
                option.dataset.layout === layout
            ) {

                option.classList.add("active");

            }

        });

        settings.layout = layout;

        saveSettings();

    }


    function applyDoodles(enabled) {

        settings.doodles = enabled;

        body.classList.toggle(
            "no-doodles",
            !enabled
        );

        if (doodleToggle) {

            doodleToggle.checked = enabled;

        }

        saveSettings();

    }


    function applyAnimations(enabled) {

        settings.animations = enabled;

        body.classList.toggle(
            "no-animations",
            !enabled
        );

        if (animationToggle) {

            animationToggle.checked = enabled;

        }

        saveSettings();

    }


    themeOptions.forEach(function (option) {

        option.addEventListener(
            "click",
            function () {

                applyTheme(
                    option.dataset.theme
                );

            }
        );

    });


    buttonOptions.forEach(function (option) {

        option.addEventListener(
            "click",
            function () {

                applyButtonStyle(
                    option.dataset.buttonStyle
                );

            }
        );

    });


    layoutOptions.forEach(function (option) {

        option.addEventListener(
            "click",
            function () {

                applyLayout(
                    option.dataset.layout
                );

            }
        );

    });


    if (doodleToggle) {

        doodleToggle.addEventListener(
            "change",
            function () {

                applyDoodles(
                    doodleToggle.checked
                );

            }
        );

    }


    if (animationToggle) {

        animationToggle.addEventListener(
            "change",
            function () {

                applyAnimations(
                    animationToggle.checked
                );

            }
        );

    }


    if (resetCustomizer) {

        resetCustomizer.addEventListener(
            "click",
            function () {

                settings = {
                    ...defaultSettings
                };

                applyTheme(
                    settings.theme
                );

                applyButtonStyle(
                    settings.buttonStyle
                );

                applyLayout(
                    settings.layout
                );

                applyDoodles(
                    settings.doodles
                );

                applyAnimations(
                    settings.animations
                );

            }
        );

    }


    applyTheme(settings.theme);

    applyButtonStyle(
        settings.buttonStyle
    );

    applyLayout(settings.layout);

    applyDoodles(
        settings.doodles
    );

    applyAnimations(
        settings.animations
    );



    // =====================================================
    // 2. PANIER
    // =====================================================

    let cart = [];


    const openCart =
        document.getElementById("openCart");

    const closeCart =
        document.getElementById("closeCart");

    const cartOverlay =
        document.getElementById("cartOverlay");

    const cartItems =
        document.getElementById("cartItems");

    const cartEmpty =
        document.getElementById("cartEmpty");

    const cartFooter =
        document.getElementById("cartFooter");

    const cartCount =
        document.getElementById("cartCount");

    const cartTotal =
        document.getElementById("cartTotal");

    const openCheckout =
        document.getElementById("openCheckout");

    const checkoutModal =
        document.getElementById("checkoutModal");

    const closeCheckout =
        document.getElementById("closeCheckout");

    const checkoutForm =
        document.getElementById("checkoutForm");

    const checkoutTotal =
        document.getElementById("checkoutTotal");


    function formatPrice(price) {

        return Number(price)
            .toLocaleString("fr-FR")
            .replace(/\s/g, ".") + " FG";

    }


    function openCartPanel() {

        if (!cartOverlay) return;

        cartOverlay.classList.add("open");

        document.body.style.overflow = "hidden";

        renderCart();

    }


    function closeCartPanel() {

        if (!cartOverlay) return;

        cartOverlay.classList.remove("open");

        document.body.style.overflow = "";

    }


    if (openCart) {

        openCart.addEventListener(
            "click",
            openCartPanel
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
            function (event) {

                if (event.target === cartOverlay) {

                    closeCartPanel();

                }

            }
        );

    }


    function addToCart(product) {

        const existingProduct =
            cart.find(
                item => item.id === product.id
            );


        if (existingProduct) {

            existingProduct.quantity += 1;

        } else {

            cart.push({

                ...product,

                quantity: 1

            });

        }


        renderCart();


        showToast(
            "Produit ajouté",
            product.name +
            " est dans ton panier 🛍️"
        );

    }


    function changeQuantity(id, amount) {

        const product =
            cart.find(
                item => item.id === id
            );


        if (!product) return;


        product.quantity += amount;


        if (product.quantity <= 0) {

            cart = cart.filter(
                item => item.id !== id
            );

        }


        renderCart();

    }


    function renderCart() {

        if (!cartItems) return;


        cartItems.innerHTML = "";


        let total = 0;

        let quantityTotal = 0;


        cart.forEach(function (product) {

            total +=
                Number(product.price) *
                product.quantity;


            quantityTotal +=
                product.quantity;


            const item =
                document.createElement("div");


            item.className =
                "cart-item";


            item.innerHTML = `

                <div class="cart-item-image">

                    ${
                        product.image_url
                        ? `
                            <img
                                src="${product.image_url}"
                                alt="${product.name}"
                                style="
                                    width:100%;
                                    height:100%;
                                    object-fit:cover;
                                "
                            >
                          `
                        : "🛍️"
                    }

                </div>


                <div>

                    <div class="cart-item-name">
                        ${product.name}
                    </div>

                    <div class="cart-item-price">
                        ${formatPrice(product.price)}
                    </div>


                    <div class="cart-item-quantity">

                        <button
                            type="button"
                            data-action="minus"
                            data-id="${product.id}"
                        >
                            −
                        </button>

                        <span>
                            ${product.quantity}
                        </span>

                        <button
                            type="button"
                            data-action="plus"
                            data-id="${product.id}"
                        >
                            +
                        </button>

                    </div>

                </div>


                <strong>

                    ${formatPrice(
                        Number(product.price) *
                        product.quantity
                    )}

                </strong>

            `;


            cartItems.appendChild(item);

        });


        cartItems
            .querySelectorAll("[data-action]")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            button.dataset.id;

                        const amount =
                            button.dataset.action === "plus"
                            ? 1
                            : -1;


                        changeQuantity(
                            id,
                            amount
                        );

                    }
                );

            });


        if (cartCount) {

            cartCount.textContent =
                quantityTotal;

        }


        if (cartTotal) {

            cartTotal.textContent =
                formatPrice(total);

        }


        if (checkoutTotal) {

            checkoutTotal.textContent =
                formatPrice(total);

        }


        if (cart.length === 0) {

            if (cartEmpty) {

                cartEmpty.style.display =
                    "block";

            }

            if (cartFooter) {

                cartFooter.style.display =
                    "none";

            }

        } else {

            if (cartEmpty) {

                cartEmpty.style.display =
                    "none";

            }

            if (cartFooter) {

                cartFooter.style.display =
                    "block";

            }

        }

    }



    // =====================================================
    // 3. CHECKOUT
    // =====================================================

    if (openCheckout) {

        openCheckout.addEventListener(
            "click",
            function () {

                if (cart.length === 0) {

                    showToast(
                        "Panier vide",
                        "Ajoute d'abord une pépite 🛍️"
                    );

                    return;

                }


                if (checkoutModal) {

                    checkoutModal.classList.add(
                        "open"
                    );

                }

            }
        );

    }


    if (closeCheckout) {

        closeCheckout.addEventListener(
            "click",
            function () {

                if (checkoutModal) {

                    checkoutModal.classList.remove(
                        "open"
                    );

                }

            }
        );

    }


    if (checkoutForm) {

        checkoutForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const customerName =
                    document.getElementById(
                        "customerName"
                    )?.value.trim();


                if (!customerName) return;


                if (checkoutModal) {

                    checkoutModal.classList.remove(
                        "open"
                    );

                }


                cart = [];


                renderCart();

                closeCartPanel();

                checkoutForm.reset();


                showToast(
                    "Commande enregistrée ✦",
                    "Merci " +
                    customerName +
                    " ! DJEYAL a bien reçu ta commande."
                );

            }
        );

    }



    // =====================================================
    // 4. TOAST
    // =====================================================

    const toast =
        document.getElementById("toast");

    const toastTitle =
        document.getElementById("toastTitle");

    const toastMessage =
        document.getElementById("toastMessage");

    let toastTimeout;


    function showToast(
        title,
        message
    ) {

        if (!toast) return;


        if (toastTitle) {

            toastTitle.textContent =
                title;

        }


        if (toastMessage) {

            toastMessage.textContent =
                message;

        }


        toast.classList.add("show");


        clearTimeout(toastTimeout);


        toastTimeout =
            setTimeout(
                function () {

                    toast.classList.remove(
                        "show"
                    );

                },
                3500
            );

    }



    // =====================================================
    // 5. PRODUITS SUPABASE
    // =====================================================

    let products = [];


    // =====================================================
    // CREER UNE CARTE PRODUIT
    // =====================================================

    function createProductCard(product) {

        const card =
            document.createElement("article");


        card.className =
            "product-card";


        card.dataset.category =
            product.category || "";


        const image =
            product.image_url ||
            product.image ||
            "";


        card.innerHTML = `

            <div class="product-image">

                ${
                    image
                    ? `
                        <img
                            src="${image}"
                            alt="${product.name || "Produit DJEYAL"}"
                        >
                      `
                    : `
                        <div
                            style="
                                font-family:'Playfair Display',serif;
                                font-size:35px;
                                color:#5b0b1b;
                            "
                        >
                            DJ
                        </div>
                      `
                }

                <span class="product-badge">
                    DJEYAL
                </span>

            </div>


            <div class="product-info">

                <div class="product-category">
                    ${product.category || ""}
                </div>


                <h3 class="product-name">
                    ${product.name || "Produit sans nom"}
                </h3>


                ${
                    product.description
                    ? `
                        <p class="product-description">
                            ${product.description}
                        </p>
                      `
                    : ""
                }


                <div class="product-price">
                    ${formatPrice(product.price || 0)}
                </div>


                <button
                    class="add-to-cart"
                    type="button"
                >
                    Ajouter au panier ✦
                </button>

            </div>

        `;


        const addButton =
            card.querySelector(
                ".add-to-cart"
            );


        if (addButton) {

            addButton.addEventListener(
                "click",
                function () {

                    addToCart(product);

                }
            );

        }


        return card;

    }



    // =====================================================
    // 6. AFFICHER PRODUITS ACCUEIL
    // =====================================================

    const homeProducts =
        document.getElementById(
            "homeProducts"
        );


    function renderHomeProducts() {

        if (!homeProducts) return;


        homeProducts.innerHTML = "";


        products
            .slice(0, 4)
            .forEach(function (product) {

                homeProducts.appendChild(
                    createProductCard(product)
                );

            });

    }



    // =====================================================
    // 7. BOUTIQUE
    // =====================================================

    const productsGrid =
        document.getElementById(
            "productsGrid"
        );


    const productCount =
        document.getElementById(
            "productCount"
        );


    const noProducts =
        document.getElementById(
            "noProducts"
        );


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const sortProducts =
        document.getElementById(
            "sortProducts"
        );


    const filters =
        document.querySelectorAll(
            ".filter"
        );


    const resetFilters =
        document.getElementById(
            "resetFilters"
        );


    let currentCategory =
        "all";


    let currentSearch =
        "";


    let currentSort =
        "default";



    // =====================================================
    // RENDRE BOUTIQUE
    // =====================================================

    function renderShopProducts() {

        if (!productsGrid) return;


        let filteredProducts =
            [...products];


        // Catégorie

        if (
            currentCategory !== "all"
        ) {

            filteredProducts =
                filteredProducts.filter(
                    product =>
                        product.category ===
                        currentCategory
                );

        }


        // Recherche

        if (currentSearch) {

            filteredProducts =
                filteredProducts.filter(
                    product =>
                        (product.name || "")
                            .toLowerCase()
                            .includes(
                                currentSearch
                            )
                );

        }


        // Tri

        if (
            currentSort ===
            "price-low"
        ) {

            filteredProducts.sort(
                (a, b) =>
                    Number(a.price) -
                    Number(b.price)
            );

        }


        if (
            currentSort ===
            "price-high"
        ) {

            filteredProducts.sort(
                (a, b) =>
                    Number(b.price) -
                    Number(a.price)
            );

        }


        if (
            currentSort ===
            "name"
        ) {

            filteredProducts.sort(
                (a, b) =>
                    (a.name || "")
                        .localeCompare(
                            b.name || ""
                        )
            );

        }


        productsGrid.innerHTML = "";


        filteredProducts.forEach(
            function (product) {

                productsGrid.appendChild(
                    createProductCard(
                        product
                    )
                );

            }
        );


        if (productCount) {

            productCount.textContent =
                filteredProducts.length;

        }


        if (noProducts) {

            noProducts.style.display =
                filteredProducts.length === 0
                ? "block"
                : "none";

        }

    }



    // =====================================================
    // FILTRES
    // =====================================================

    filters.forEach(function (filter) {

        filter.addEventListener(
            "click",
            function () {

                filters.forEach(
                    btn =>
                        btn.classList.remove(
                            "active"
                        )
                );


                filter.classList.add(
                    "active"
                );


                currentCategory =
                    filter.dataset.category;


                renderShopProducts();

            }
        );

    });



    // =====================================================
    // RECHERCHE
    // =====================================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                currentSearch =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                renderShopProducts();

            }
        );

    }



    // =====================================================
    // TRI
    // =====================================================

    if (sortProducts) {

        sortProducts.addEventListener(
            "change",
            function () {

                currentSort =
                    sortProducts.value;


                renderShopProducts();

            }
        );

    }



    // =====================================================
    // RESET
    // =====================================================

    if (resetFilters) {

        resetFilters.addEventListener(
            "click",
            function () {

                currentCategory =
                    "all";

                currentSearch =
                    "";

                currentSort =
                    "default";


                if (searchInput) {

                    searchInput.value =
                        "";

                }


                if (sortProducts) {

                    sortProducts.value =
                        "default";

                }


                filters.forEach(
                    filter =>
                        filter.classList.remove(
                            "active"
                        )
                );


                const allFilter =
                    document.querySelector(
                        '.filter[data-category="all"]'
                    );


                if (allFilter) {

                    allFilter.classList.add(
                        "active"
                    );

                }


                renderShopProducts();

            }
        );

    }



    // =====================================================
    // 8. CHARGER LES PRODUITS SUPABASE
    // =====================================================

    async function loadProducts() {

        const {
            data,
            error
        } = await supabaseClient
            .from("products")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Erreur chargement produits :",
                error
            );

            products = [];

            renderShopProducts();

            renderHomeProducts();

            return;

        }


        products =
            data || [];


        console.log(
            "Produits DJEYAL chargés :",
            products
        );


        renderShopProducts();

        renderHomeProducts();

    }


    // =====================================================
    // 9. FORMULAIRE ADMIN — AJOUT PRODUIT
    // =====================================================

    const productForm =
        document.getElementById(
            "product-form"
        );


    const adminMessage =
        document.getElementById(
            "admin-message"
        );


    if (productForm) {

        productForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const name =
                    document.getElementById(
                        "product-name"
                    ).value.trim();


                const price =
                    Number(
                        document.getElementById(
                            "product-price"
                        ).value
                    );


                const category =
                    document.getElementById(
                        "product-category"
                    ).value;


                const description =
                    document.getElementById(
                        "product-description"
                    ).value.trim();


                const stock =
                    Number(
                        document.getElementById(
                            "product-stock"
                        ).value
                    );


                const featured =
                    document.getElementById(
                        "product-featured"
                    ).checked;


                if (adminMessage) {

                    adminMessage.className =
                        "admin-message show";

                    adminMessage.textContent =
                        "Ajout du produit en cours...";

                }


                const {
                    data,
                    error
                } = await supabaseClient
                    .from("products")
                    .insert([
                        {
                            name: name,

                            price: price,

                            category: category,

                            description: description,

                            stock: stock,

                            featured: featured
                        }
                    ])
                    .select();


                if (error) {

                    console.error(
                        "Erreur Supabase :",
                        error
                    );


                    if (adminMessage) {

                        adminMessage.textContent =
                            "❌ Impossible d'ajouter le produit.";

                    }

                    return;

                }


                console.log(
                    "Produit ajouté :",
                    data
                );


                if (adminMessage) {

                    adminMessage.textContent =
                        "✅ Produit ajouté avec succès !";

                }


                productForm.reset();


                const stockInput =
                    document.getElementById(
                        "product-stock"
                    );


                if (stockInput) {

                    stockInput.value = 1;

                }


                // Recharge les produits

                await loadProducts();

            }
        );

    }



    // =====================================================
    // 10. TES ENVIES
    // =====================================================

    const wishForm =
        document.getElementById(
            "wishForm"
        );


    if (wishForm) {

        wishForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const name =
                    document.getElementById(
                        "wishName"
                    )?.value.trim();


                showToast(
                    "Merci " +
                    (name || "") +
                    " ♡",
                    "Ton envie a bien été enregistrée chez DJEYAL."
                );


                wishForm.reset();

            }
        );

    }



    // =====================================================
    // DÉMARRAGE
    // =====================================================

    loadProducts();

});