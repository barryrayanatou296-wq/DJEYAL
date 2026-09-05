// ==========================================
// DJEYAL — ADMIN DASHBOARD
// Connexion + gestion des produits
// + images Supabase
// + commandes
// + statistiques
// ==========================================


// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://ydwlhnkbbtcijwufvkut.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_T2mV-EpxCJjp3ZgUMEaTWQ_4ICenNfp";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ==========================================
// ELEMENTS
// ==========================================

const loginSection =
    document.getElementById("login-section");

const loginForm =
    document.getElementById("login-form");

const loginEmail =
    document.getElementById("login-email");

const loginPassword =
    document.getElementById("login-password");

const loginMessage =
    document.getElementById("login-message");

const dashboardSection =
    document.getElementById("dashboard-section");

const logoutButton =
    document.getElementById("logout-button");

const productForm =
    document.getElementById("product-form");

const productName =
    document.getElementById("product-name");

const productPrice =
    document.getElementById("product-price");

const productPurchasePrice =
    document.getElementById("product-purchase-price");

const productCategory =
    document.getElementById("product-category");

const productDescription =
    document.getElementById("product-description");

const productImage =
    document.getElementById("product-image");

const productStock =
    document.getElementById("product-stock");

const productFeatured =
    document.getElementById("product-featured");

const adminMessage =
    document.getElementById("admin-message");

const productsList =
    document.getElementById("products-list");

const statProducts =
    document.getElementById("stat-products");


// ==========================================
// STORAGE
// ==========================================

const PRODUCT_BUCKET = "products";


// ==========================================
// PRODUIT EN COURS DE MODIFICATION
// ==========================================

let editingProductId = null;
let editingProductImageUrl = null;


// ==========================================
// MESSAGES
// ==========================================

function showLoginMessage(
    message,
    success = false
) {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent =
        message;

    loginMessage.classList.add("show");

    loginMessage.style.color =
        success
            ? "#7a0019"
            : "#b00020";
}


function showAdminMessage(
    message,
    success = false
) {

    if (!adminMessage) {
        return;
    }

    adminMessage.textContent =
        message;

    adminMessage.classList.add("show");

    adminMessage.style.color =
        success
            ? "#7a0019"
            : "#b00020";
}


// ==========================================
// AFFICHER LE DASHBOARD
// ==========================================

function showDashboard() {

    if (loginSection) {
        loginSection.style.display =
            "none";
    }

    if (dashboardSection) {
        dashboardSection.style.display =
            "block";
    }

    loadProducts();
    loadOrders();
    loadStatistics();
}


// ==========================================
// AFFICHER LA CONNEXION
// ==========================================

function showLogin() {

    if (loginSection) {
        loginSection.style.display =
            "flex";
    }

    if (dashboardSection) {
        dashboardSection.style.display =
            "none";
    }
}


// ==========================================
// CONNEXION
// ==========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            showLoginMessage(
                "Connexion en cours..."
            );

            const email =
                loginEmail.value.trim();

            const password =
                loginPassword.value;

            if (!email || !password) {

                showLoginMessage(
                    "❌ Entre ton e-mail et ton mot de passe."
                );

                return;
            }

            try {

                const result =
                    await supabaseClient.auth.signInWithPassword({
                        email: email,
                        password: password
                    });

                const data =
                    result.data;

                const error =
                    result.error;

                if (error) {

                    console.error(
                        "Erreur connexion :",
                        error
                    );

                    showLoginMessage(
                        "❌ E-mail ou mot de passe incorrect."
                    );

                    return;
                }

                if (!data || !data.session) {

                    showLoginMessage(
                        "❌ Impossible d'ouvrir la session."
                    );

                    return;
                }

                showLoginMessage(
                    "✅ Connexion réussie !",
                    true
                );

                showDashboard();

            }

            catch (error) {

                console.error(
                    "Erreur connexion :",
                    error
                );

                showLoginMessage(
                    "❌ Une erreur est survenue pendant la connexion."
                );
            }
        }
    );
}


// ==========================================
// DECONNEXION
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function() {

            try {

                const result =
                    await supabaseClient.auth.signOut();

                if (result.error) {

                    console.error(
                        "Erreur déconnexion :",
                        result.error
                    );

                    return;
                }

                editingProductId =
                    null;

                editingProductImageUrl =
                    null;

                if (productForm) {
                    productForm.reset();
                }

                showLogin();

                if (loginForm) {
                    loginForm.reset();
                }

                showLoginMessage(
                    "Vous êtes déconnectée."
                );

            }

            catch (error) {

                console.error(
                    "Erreur déconnexion :",
                    error
                );
            }
        }
    );
}


// ==========================================
// SURVEILLER LA SESSION
// ==========================================

supabaseClient.auth.onAuthStateChange(
    function(event, session) {

        if (
            session &&
            (
                event === "SIGNED_IN" ||
                event === "INITIAL_SESSION" ||
                event === "TOKEN_REFRESHED"
            )
        ) {

            if (
                dashboardSection &&
                dashboardSection.style.display !== "block"
            ) {

                showDashboard();
            }
        }

        if (
            !session &&
            event === "SIGNED_OUT"
        ) {

            showLogin();
        }
    }
);


// ==========================================
// VERIFIER LA SESSION
// ==========================================

async function checkSession() {

    showLogin();

    try {

        const result =
            await supabaseClient.auth.getSession();

        const data =
            result.data;

        const error =
            result.error;

        if (error) {

            console.error(
                "Erreur vérification session :",
                error
            );

            showLogin();

            return;
        }

        if (data && data.session) {

            showDashboard();

        } else {

            showLogin();
        }

    }

    catch (error) {

        console.error(
            "Erreur session :",
            error
        );

        showLogin();
    }
}


// ==========================================
// UPLOAD IMAGE
// ==========================================

async function uploadProductImage(file) {

    if (!file) {
        return null;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    if (!allowedTypes.includes(file.type)) {

        throw new Error(
            "Format d'image non autorisé."
        );
    }

    const maxSize =
        5 * 1024 * 1024;

    if (file.size > maxSize) {

        throw new Error(
            "L'image doit faire moins de 5 Mo."
        );
    }

    const parts =
        file.name.split(".");

    const fileExtension =
        parts[parts.length - 1]
            .toLowerCase();

    const fileName =
        crypto.randomUUID() +
        "." +
        fileExtension;

    const filePath =
        "products/" +
        fileName;

    const result =
        await supabaseClient
            .storage
            .from(PRODUCT_BUCKET)
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );

    if (result.error) {

        console.error(
            "Erreur upload image :",
            result.error
        );

        throw result.error;
    }

    const publicResult =
        supabaseClient
            .storage
            .from(PRODUCT_BUCKET)
            .getPublicUrl(filePath);

    return publicResult.data.publicUrl;
}


// ==========================================
// SUPPRIMER IMAGE STORAGE
// ==========================================

async function deleteProductImage(
    imageUrl
) {

    if (!imageUrl) {
        return;
    }

    try {

        const marker =
            "/storage/v1/object/public/" +
            PRODUCT_BUCKET +
            "/";

        const index =
            imageUrl.indexOf(marker);

        if (index === -1) {
            return;
        }

        const filePath =
            imageUrl.substring(
                index + marker.length
            );

        const result =
            await supabaseClient
                .storage
                .from(PRODUCT_BUCKET)
                .remove([
                    filePath
                ]);

        if (result.error) {

            console.error(
                "Erreur suppression image :",
                result.error
            );
        }

    }

    catch (error) {

        console.error(
            "Erreur image :",
            error
        );
    }
}


// ==========================================
// CHARGER LES PRODUITS
// ==========================================

async function loadProducts() {

    try {

        const sessionResult =
            await supabaseClient.auth.getSession();

        const sessionData =
            sessionResult.data;

        if (
            !sessionData ||
            !sessionData.session
        ) {

            showLogin();

            return;
        }

        if (productsList) {

            productsList.innerHTML =
                "<p>Chargement des produits...</p>";
        }

        const result =
            await supabaseClient
                .from("products")
                .select("*");

        const data =
            result.data;

        const error =
            result.error;

        if (error) {

            console.error(
                "Erreur chargement produits :",
                error
            );

            if (productsList) {

                productsList.innerHTML =
                    "<p>❌ Impossible de charger les produits.</p>";
            }

            return;
        }

        if (statProducts) {

            statProducts.textContent =
                data.length;
        }

        renderProducts(data);

    }

    catch (error) {

        console.error(
            "Erreur chargement produits :",
            error
        );

        if (productsList) {

            productsList.innerHTML =
                "<p>❌ Une erreur est survenue.</p>";
        }
    }
}


// ==========================================
// AFFICHER LES PRODUITS
// ==========================================

function renderProducts(products) {

    if (!productsList) {
        return;
    }

    productsList.innerHTML = "";

    if (
        !products ||
        products.length === 0
    ) {

        productsList.innerHTML = `
            <div class="empty-products">
                <p>🛍️ Aucun produit pour le moment.</p>
                <p>Ajoute ton premier produit juste au-dessus.</p>
            </div>
        `;

        return;
    }

    products.forEach(function(product) {

        const card =
            document.createElement("div");

        card.className =
            "admin-product-card";

        const imageHTML =
            product.image_url
                ? `
                    <img
                        src="${escapeHTML(product.image_url)}"
                        alt="${escapeHTML(product.name)}"
                        style="
                            width:120px;
                            height:120px;
                            object-fit:cover;
                            border-radius:10px;
                            margin-bottom:15px;
                        "
                    >
                `
                : `
                    <div
                        style="
                            width:120px;
                            height:120px;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            border:1px dashed #999;
                            border-radius:10px;
                            margin-bottom:15px;
                        "
                    >
                        🖼️
                    </div>
                `;

        const featuredHTML =
            product.featured
                ? `
                    <span class="featured-badge">
                        ⭐ Vedette
                    </span>
                `
                : "";

        const category =
            product.category ||
            "Non définie";

        const description =
            product.description ||
            "Aucune description";

        const price =
            formatPrice(product.price);

        const stock =
            product.stock ?? 0;

        card.innerHTML =
            imageHTML +
            `
                <div class="admin-product-info">

                    <h3>
                        ${escapeHTML(product.name)}
                    </h3>

                    ${featuredHTML}

                    <p>
                        Catégorie :
                        <strong>
                            ${escapeHTML(category)}
                        </strong>
                    </p>

                    <p>
                        ${escapeHTML(description)}
                    </p>

                    <div class="admin-product-details">

                        <strong>
                            ${price} GNF
                        </strong>

                        <span>
                            📦 Stock :
                            ${stock}
                        </span>

                    </div>

                </div>

                <div class="admin-product-actions">

                    <button
                        type="button"
                        class="edit-product-button"
                    >
                        ✏️ Modifier
                    </button>

                    <button
                        type="button"
                        class="delete-product-button"
                    >
                        🗑️ Supprimer
                    </button>

                </div>
            `;

        const actions =
            card.querySelector(
                ".admin-product-actions"
            );

        if (actions) {

            actions.style.display =
                "flex";

            actions.style.gap =
                "10px";

            actions.style.marginTop =
                "20px";
        }

        const editButton =
            card.querySelector(
                ".edit-product-button"
            );

        if (editButton) {

            editButton.style.padding =
                "10px 18px";

            editButton.style.border =
                "none";

            editButton.style.borderRadius =
                "8px";

            editButton.style.cursor =
                "pointer";

            editButton.style.background =
                "#111";

            editButton.style.color =
                "#fff";

            editButton.addEventListener(
                "click",
                function() {

                    startEditingProduct(
                        product
                    );
                }
            );
        }

        const deleteButton =
            card.querySelector(
                ".delete-product-button"
            );

        if (deleteButton) {

            deleteButton.style.padding =
                "10px 18px";

            deleteButton.style.border =
                "none";

            deleteButton.style.borderRadius =
                "8px";

            deleteButton.style.cursor =
                "pointer";

            deleteButton.style.background =
                "#7a0019";

            deleteButton.style.color =
                "#fff";

            deleteButton.addEventListener(
                "click",
                function() {

                    deleteProduct(
                        product.id,
                        product.name,
                        product.image_url
                    );
                }
            );
        }

        productsList.appendChild(card);
    });
}


// ==========================================
// MODIFIER UN PRODUIT
// ==========================================

function startEditingProduct(product) {

    editingProductId =
        product.id;

    editingProductImageUrl =
        product.image_url || null;

    productName.value =
        product.name || "";

    productPrice.value =
        product.price || "";

    productPurchasePrice.value =
        product.purchase_price ?? 0;

    productCategory.value =
        product.category || "";

    productDescription.value =
        product.description || "";

    productStock.value =
        product.stock ?? 0;

    productFeatured.checked =
        product.featured === true;

    productImage.required =
        false;

    const submitButton =
        productForm.querySelector(
            'button[type="submit"]'
        );

    if (submitButton) {

        submitButton.textContent =
            "💾 Enregistrer les modifications";
    }

    showAdminMessage(
        "✏️ Modification de : " +
        product.name
    );

    productForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// ==========================================
// ANNULER MODIFICATION
// ==========================================

function cancelEditing() {

    editingProductId =
        null;

    editingProductImageUrl =
        null;

    productForm.reset();

    productStock.value =
        0;

    productPurchasePrice.value =
        0;

    productImage.required =
        true;

    const submitButton =
        productForm.querySelector(
            'button[type="submit"]'
        );

    if (submitButton) {

        submitButton.textContent =
            "AJOUTER LE PRODUIT";
    }
}


// ==========================================
// AJOUTER / MODIFIER PRODUIT
// ==========================================

if (productForm) {

    productForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            try {

                const sessionResult =
                    await supabaseClient.auth.getSession();

                const sessionData =
                    sessionResult.data;

                if (
                    !sessionData ||
                    !sessionData.session
                ) {

                    showLogin();

                    return;
                }

                const file =
                    productImage.files[0];

                const product = {

                    name:
                        productName.value.trim(),

                    price:
                        Number(
                            productPrice.value
                        ),

                    purchase_price:
                        Number(
                            productPurchasePrice.value
                        ),

                    category:
                        productCategory.value,

                    description:
                        productDescription.value.trim(),

                    stock:
                        Number(
                            productStock.value
                        ),

                    featured:
                        productFeatured.checked
                };


                // ==================================
                // VALIDATION
                // ==================================

                if (!product.name) {

                    showAdminMessage(
                        "❌ Entre le nom du produit."
                    );

                    return;
                }

                if (
                    Number.isNaN(product.price) ||
                    product.price < 0
                ) {

                    showAdminMessage(
                        "❌ Entre un prix de vente valide."
                    );

                    return;
                }

                if (
                    Number.isNaN(
                        product.purchase_price
                    ) ||
                    product.purchase_price < 0
                ) {

                    showAdminMessage(
                        "❌ Entre un prix d'achat valide."
                    );

                    return;
                }


                // ==================================
                // MODIFICATION
                // ==================================

                if (editingProductId) {

                    showAdminMessage(
                        "⏳ Modification en cours..."
                    );

                    let newImageUrl =
                        editingProductImageUrl;

                    if (file) {

                        showAdminMessage(
                            "⏳ Envoi de la nouvelle image..."
                        );

                        newImageUrl =
                            await uploadProductImage(
                                file
                            );
                    }

                    product.image_url =
                        newImageUrl;

                    const updateResult =
                        await supabaseClient
                            .from("products")
                            .update(product)
                            .eq(
                                "id",
                                editingProductId
                            );

                    if (updateResult.error) {

                        if (
                            file &&
                            newImageUrl &&
                            newImageUrl !==
                                editingProductImageUrl
                        ) {

                            await deleteProductImage(
                                newImageUrl
                            );
                        }

                        throw updateResult.error;
                    }

                    if (
                        file &&
                        editingProductImageUrl &&
                        newImageUrl !==
                            editingProductImageUrl
                    ) {

                        await deleteProductImage(
                            editingProductImageUrl
                        );
                    }

                    showAdminMessage(
                        "✅ Produit modifié !",
                        true
                    );

                    cancelEditing();

                    await loadProducts();
                    await loadStatistics();

                    return;
                }


                // ==================================
                // AJOUT
                // ==================================

                if (!file) {

                    showAdminMessage(
                        "❌ Choisis une image."
                    );

                    return;
                }

                showAdminMessage(
                    "⏳ Envoi de l'image..."
                );

                const imageUrl =
                    await uploadProductImage(
                        file
                    );

                product.image_url =
                    imageUrl;

                showAdminMessage(
                    "⏳ Enregistrement du produit..."
                );

                const insertResult =
                    await supabaseClient
                        .from("products")
                        .insert([
                            product
                        ])
                        .select();

                if (insertResult.error) {

                    await deleteProductImage(
                        imageUrl
                    );

                    throw insertResult.error;
                }

                console.log(
                    "Produit ajouté :",
                    insertResult.data
                );

                showAdminMessage(
                    "✅ Produit ajouté avec succès !",
                    true
                );

                productForm.reset();

                productStock.value =
                    0;

                productPurchasePrice.value =
                    0;

                productImage.required =
                    true;

                await loadProducts();
                await loadStatistics();

            }

            catch (error) {

                console.error(
                    "Erreur produit :",
                    error
                );

                showAdminMessage(
                    "❌ " +
                    (
                        error.message ||
                        "Une erreur est survenue."
                    )
                );
            }
        }
    );
}


// ==========================================
// SUPPRIMER PRODUIT
// ==========================================

async function deleteProduct(
    id,
    productNameText,
    imageUrl
) {

    try {

        const sessionResult =
            await supabaseClient.auth.getSession();

        const sessionData =
            sessionResult.data;

        if (
            !sessionData ||
            !sessionData.session
        ) {

            showLogin();

            return;
        }

        const confirmation =
            confirm(
                "⚠️ Veux-tu vraiment supprimer « " +
                productNameText +
                " » ?"
            );

        if (!confirmation) {
            return;
        }

        showAdminMessage(
            "⏳ Suppression en cours..."
        );

        const result =
            await supabaseClient
                .from("products")
                .delete()
                .eq(
                    "id",
                    id
                );

        if (result.error) {

            console.error(
                "Erreur suppression :",
                result.error
            );

            showAdminMessage(
                "❌ Impossible de supprimer : " +
                result.error.message
            );

            return;
        }

        if (imageUrl) {

            await deleteProductImage(
                imageUrl
            );
        }

        showAdminMessage(
            "🗑️ Produit supprimé.",
            true
        );

        await loadProducts();
        await loadStatistics();

    }

    catch (error) {

        console.error(
            "Erreur suppression produit :",
            error
        );

        showAdminMessage(
            "❌ Une erreur est survenue."
        );
    }
}


// ==========================================
// FORMAT PRIX
// ==========================================

function formatPrice(price) {

    return Number(price || 0)
        .toLocaleString("fr-FR");
}


// ==========================================
// SECURITE HTML
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ==========================================
// COMMANDES REÇUES
// ==========================================

async function loadOrders() {

    const ordersList =
        document.getElementById(
            "orders-list"
        );

    if (!ordersList) return;

    ordersList.innerHTML = `
        <div class="orders-empty">
            Chargement des commandes...
        </div>
    `;

    const {
        data: orders,
        error
    } = await supabaseClient
        .from("orders")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error(
            "Erreur chargement commandes :",
            error
        );

        ordersList.innerHTML = `
            <div class="orders-empty">
                ❌ Impossible de charger les commandes.
            </div>
        `;

        return;
    }

    if (
        !orders ||
        orders.length === 0
    ) {

        ordersList.innerHTML = `
            <div class="orders-empty">
                🛍️ Aucune commande pour le moment.
            </div>
        `;

        return;
    }

    ordersList.innerHTML = "";

    orders.forEach(
        (order, index) => {

            let productsHTML = "";

            try {

                const items =
                    Array.isArray(order.items)
                        ? order.items
                        : JSON.parse(
                            order.items || "[]"
                        );

                productsHTML =
                    items.map(item => {

                        const quantity =
                            Number(
                                item.quantity || 1
                            );

                        const price =
                            Number(
                                item.price || 0
                            );

                        return `
                            <div class="order-product-line">

                                <span class="order-product-name">
                                    ${escapeHTML(
                                        item.name ||
                                        "Produit"
                                    )}
                                </span>

                                <span class="order-product-quantity">
                                    × ${quantity}
                                </span>

                                <span>
                                    ${
                                        (
                                            price *
                                            quantity
                                        ).toLocaleString(
                                            "fr-FR"
                                        )
                                    } GNF
                                </span>

                            </div>
                        `;

                    }).join("");

            }

            catch (e) {

                productsHTML = `
                    <p>
                        Produits de la commande indisponibles.
                    </p>
                `;
            }

            const date =
                order.created_at
                    ? new Date(
                        order.created_at
                    ).toLocaleString(
                        "fr-FR"
                    )
                    : "Date inconnue";

            ordersList.innerHTML += `

                <div class="order-card">

                    <div class="order-header">

                        <div class="order-number">
                            🛍️ Commande #${index + 1}
                        </div>

                        <div class="order-date">
                            ${date}
                        </div>

                    </div>


                    <div class="order-customer">

                        <div class="order-info-box">

                            <div class="order-info-label">
                                CLIENT
                            </div>

                            <div class="order-info-value">
                                ${escapeHTML(
                                    order.customer_name ||
                                    "Non renseigné"
                                )}
                            </div>

                        </div>


                        <div class="order-info-box">

                            <div class="order-info-label">
                                TÉLÉPHONE
                            </div>

                            <div class="order-info-value">
                                ${escapeHTML(
                                    order.customer_phone ||
                                    "Non renseigné"
                                )}
                            </div>

                        </div>


                        <div class="order-info-box">

                            <div class="order-info-label">
                                ADRESSE
                            </div>

                            <div class="order-info-value">
                                ${escapeHTML(
                                    order.customer_address ||
                                    "Non renseignée"
                                )}
                            </div>

                        </div>

                    </div>


                    <div class="order-products">

                        <div class="order-products-title">
                            📦 Produits commandés
                        </div>

                        ${productsHTML}

                    </div>


                    ${
                        order.customer_note
                            ? `
                                <div class="order-note">
                                    📝 ${escapeHTML(
                                        order.customer_note
                                    )}
                                </div>
                            `
                            : ""
                    }


                    <div class="order-total">

                        <span class="order-total-label">
                            TOTAL
                        </span>

                        <span class="order-total-value">
                            ${
                                Number(
                                    order.total || 0
                                ).toLocaleString(
                                    "fr-FR"
                                )
                            } GNF
                        </span>

                    </div>

                </div>
            `;
        }
    );
}


// ==========================================
// STATISTIQUES DU TABLEAU DE BORD
// ==========================================

async function loadStatistics() {

    // ------------------------------------------
    // RÉCUPÉRER LES COMMANDES
    // ------------------------------------------

    const {
        data: orders,
        error: ordersError
    } = await supabaseClient
        .from("orders")
        .select("items, total");

    if (ordersError) {

        console.error(
            "Erreur statistiques commandes :",
            ordersError
        );

        return;
    }


    // ------------------------------------------
    // CHIFFRE D'AFFAIRES
    // ------------------------------------------

    let revenue = 0;

    orders.forEach(order => {

        revenue += Number(
            order.total || 0
        );

    });


    // ------------------------------------------
    // ARTICLES VENDUS
    // ------------------------------------------

    let sales = 0;

    let profit = 0;


    // ------------------------------------------
    // RÉCUPÉRER LES PRIX D'ACHAT
    // ------------------------------------------

    const {
        data: products,
        error: productsError
    } = await supabaseClient
        .from("products")
        .select(
            "id, purchase_price"
        );


    if (productsError) {

        console.error(
            "Erreur récupération prix d'achat :",
            productsError
        );

        return;
    }


    // ------------------------------------------
    // CALCUL DES VENTES + BÉNÉFICE
    // ------------------------------------------

    orders.forEach(order => {

        let items = [];

        try {

            items =
                Array.isArray(order.items)
                    ? order.items
                    : JSON.parse(
                        order.items || "[]"
                    );

        }

        catch (error) {

            items = [];

        }


        items.forEach(item => {

            const quantity =
                Number(
                    item.quantity || 0
                );

            const sellingPrice =
                Number(
                    item.price || 0
                );

            sales += quantity;


            const product =
                products.find(
                    product =>
                        String(product.id) ===
                        String(item.id)
                );


            if (product) {

                const purchasePrice =
                    Number(
                        product.purchase_price || 0
                    );

                profit +=
                    (
                        sellingPrice -
                        purchasePrice
                    ) * quantity;
            }

        });

    });


    // ------------------------------------------
    // NOMBRE DE PRODUITS
    // ------------------------------------------

    const {
        count: productsCount,
        error: productsCountError
    } = await supabaseClient
        .from("products")
        .select("*", {
            count: "exact",
            head: true
        });


    if (productsCountError) {

        console.error(
            "Erreur statistiques produits :",
            productsCountError
        );

    }


    // ------------------------------------------
    // ELEMENTS STATISTIQUES
    // ------------------------------------------

    const revenueElement =
        document.getElementById(
            "stat-revenue"
        );

    const salesElement =
        document.getElementById(
            "stat-sales"
        );

    const productsElement =
        document.getElementById(
            "stat-products"
        );

    const profitElement =
        document.getElementById(
            "stat-profit"
        );


    // ------------------------------------------
    // AFFICHER CHIFFRE D'AFFAIRES
    // ------------------------------------------

    if (revenueElement) {

        revenueElement.textContent =
            revenue.toLocaleString(
                "fr-FR"
            ) +
            " GNF";
    }


    // ------------------------------------------
    // AFFICHER ARTICLES VENDUS
    // ------------------------------------------

    if (salesElement) {

        salesElement.textContent =
            sales.toLocaleString(
                "fr-FR"
            );
    }


    // ------------------------------------------
    // AFFICHER PRODUITS
    // ------------------------------------------

    if (productsElement) {

        productsElement.textContent =
            Number(
                productsCount || 0
            ).toLocaleString(
                "fr-FR"
            );
    }


    // ------------------------------------------
    // AFFICHER BÉNÉFICE
    // ------------------------------------------

    if (profitElement) {

        profitElement.textContent =
            profit.toLocaleString(
                "fr-FR"
            ) +
            " GNF";
    }

}


// ==========================================
// DEMARRAGE
// ==========================================

checkSession();


// ==========================================
// CHARGER LES COMMANDES
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadOrders();
        loadStatistics();

    }
);