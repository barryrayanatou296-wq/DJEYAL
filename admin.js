// ==========================================
// DJEYAL — ADMIN DASHBOARD
// Connexion + produits + stock
// + commandes + paiement Orange Money
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

// ==========================================
// CONFIGURATION
// ==========================================

const PRODUCT_BUCKET = "products";

const PAYMENT_PENDING =
"En attente de vérification";

const PAYMENT_PAID =
"Payé";

const PAYMENT_REJECTED =
"Paiement refusé";

// ==========================================
// ETAT
// ==========================================

let editingProductId = null;
let editingProductImageUrl = null;

// ==========================================
// MESSAGES
// ==========================================

function showLoginMessage(message, success = false) {

if (!loginMessage) {
    return;
}

loginMessage.textContent = message;

loginMessage.classList.add("show");

loginMessage.style.color =
    success
        ? "#7a0019"
        : "#b00020";

}

function showAdminMessage(message, success = false) {

if (!adminMessage) {
    return;
}

adminMessage.textContent = message;

adminMessage.classList.add("show");

adminMessage.style.color =
    success
        ? "#7a0019"
        : "#b00020";

}

// ==========================================
// AFFICHER DASHBOARD
// ==========================================

async function showDashboard() {

if (loginSection) {
    loginSection.style.display = "none";
}

if (dashboardSection) {
    dashboardSection.style.display = "block";
}

await loadProducts();
await loadOrders();
await loadStatistics();

}

// ==========================================
// AFFICHER CONNEXION
// ==========================================

function showLogin() {

if (loginSection) {
    loginSection.style.display = "flex";
}

if (dashboardSection) {
    dashboardSection.style.display = "none";
}

}

// ==========================================
// CONNEXION ADMIN
// ==========================================

if (loginForm) {

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

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

        showLoginMessage(
            "⏳ Connexion en cours..."
        );

        try {

            const {
                data,
                error
            } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });


            if (error) {

                console.error(
                    "SUPABASE LOGIN ERROR:",
                    error
                );

                showLoginMessage(
                    "❌ " +
                    (
                        error.message ||
                        "Connexion impossible."
                    )
                );

                return;
            }


            if (!data || !data.session) {

                showLoginMessage(
                    "❌ La connexion n'a pas créé de session."
                );

                return;
            }


            showLoginMessage(
                "✅ Connexion réussie !",
                true
            );


            await showDashboard();

        }

        catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            showLoginMessage(
                "❌ Erreur : " +
                (
                    error.message ||
                    "Impossible de se connecter."
                )
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

            const {
                error
            } =
                await supabaseClient.auth.signOut();

            if (error) {

                console.error(
                    "LOGOUT ERROR:",
                    error
                );

                return;
            }


            editingProductId = null;

            editingProductImageUrl = null;


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
                "LOGOUT ERROR:",
                error
            );
        }
    }
);

}

// ==========================================
// SESSION
// ==========================================

supabaseClient.auth.onAuthStateChange(
async function(event, session) {

    console.log(
        "AUTH EVENT:",
        event
    );


    if (session) {

        if (
            event === "SIGNED_IN" ||
            event === "INITIAL_SESSION" ||
            event === "TOKEN_REFRESHED"
        ) {

            await showDashboard();
        }

        return;
    }


    if (
        event === "SIGNED_OUT" ||
        event === "INITIAL_SESSION"
    ) {

        showLogin();
    }
}

);

// ==========================================
// VERIFIER SESSION AU DEMARRAGE
// ==========================================

async function checkSession() {

showLogin();

try {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getSession();


    if (error) {

        console.error(
            "SESSION ERROR:",
            error
        );

        showLogin();

        return;
    }


    if (
        data &&
        data.session
    ) {

        await showDashboard();

    } else {

        showLogin();
    }

}

catch (error) {

    console.error(
        "CHECK SESSION ERROR:",
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
        "Format d'image non autorisé. Utilise JPG, PNG, WEBP ou GIF."
    );
}


if (
    file.size >
    5 * 1024 * 1024
) {

    throw new Error(
        "L'image doit faire moins de 5 Mo."
    );
}


// Nom compatible ordinateur + téléphone
const extension =
    (
        file.name &&
        file.name.includes(".")
    )
        ? file.name
            .split(".")
            .pop()
            .toLowerCase()
        : (
            file.type === "image/png"
                ? "png"
                : file.type === "image/webp"
                    ? "webp"
                    : file.type === "image/gif"
                        ? "gif"
                        : "jpg"
        );


const randomPart =
    Math.random()
        .toString(36)
        .substring(2, 12);


const timePart =
    Date.now()
        .toString(36);


const fileName =
    "product_" +
    timePart +
    "_" +
    randomPart +
    "." +
    extension;


// IMPORTANT :
// on garde le fichier directement dans le bucket
// pour éviter certains problèmes d'upload mobile.

const filePath =
    fileName;


const {
    error
} =
    await supabaseClient
        .storage
        .from(PRODUCT_BUCKET)
        .upload(
            filePath,
            file,
            {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
            }
        );


if (error) {

    console.error(
        "UPLOAD ERROR:",
        error
    );

    throw new Error(
        "Impossible d'envoyer l'image : " +
        (
            error.message ||
            "erreur Supabase."
        )
    );
}


const {
    data
} =
    supabaseClient
        .storage
        .from(PRODUCT_BUCKET)
        .getPublicUrl(
            filePath
        );


if (
    !data ||
    !data.publicUrl
) {

    throw new Error(
        "L'image a été envoyée mais son adresse n'a pas pu être récupérée."
    );
}


return data.publicUrl;

}

// ==========================================
// SUPPRIMER IMAGE
// ==========================================

async function deleteProductImage(imageUrl) {

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


    const {
        error
    } =
        await supabaseClient
            .storage
            .from(PRODUCT_BUCKET)
            .remove([
                filePath
            ]);


    if (error) {

        console.error(
            "DELETE IMAGE ERROR:",
            error
        );
    }

}

catch (error) {

    console.error(
        "IMAGE DELETE ERROR:",
        error
    );
}

}

// ==========================================
// CHARGER PRODUITS
// ==========================================

async function loadProducts() {

if (!productsList) {
    return;
}


productsList.innerHTML =
    "<p>Chargement des produits...</p>";


try {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("products")
            .select("*")
            .order(
                "id",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "PRODUCTS ERROR:",
            error
        );

        productsList.innerHTML =
            "<p>❌ Impossible de charger les produits.</p>";

        return;
    }


    renderProducts(data || []);


    const statProducts =
        document.getElementById(
            "stat-products"
        );


    if (statProducts) {

        statProducts.textContent =
            (data || []).length;
    }

}

catch (error) {

    console.error(
        "LOAD PRODUCTS ERROR:",
        error
    );

    productsList.innerHTML =
        "<p>❌ Une erreur est survenue.</p>";
}

}

// ==========================================
// AFFICHER PRODUITS
// ==========================================

function renderProducts(products) {

if (!productsList) {
    return;
}


productsList.innerHTML = "";


if (!products.length) {

    productsList.innerHTML = `
        <div class="empty-products">
            <p>🛍️ Aucun produit pour le moment.</p>
            <p>Ajoute ton premier produit.</p>
        </div>
    `;

    return;
}


products.forEach(function(product) {

    const card =
        document.createElement("div");


    card.className =
        "admin-product-card";


    const stock =
        Number(
            product.stock ?? 0
        );


    let stockHTML;


    if (stock <= 0) {

        stockHTML = `
            <span style="
                color:#b00020;
                font-weight:600;
            ">
                💕 Rupture de stock
            </span>
        `;

    } else if (stock === 1) {

        stockHTML = `
            <span style="
                color:#7a0019;
                font-weight:600;
            ">
                ✨ Plus qu’un seul !
            </span>
        `;

    } else if (stock <= 5) {

        stockHTML = `
            <span style="
                color:#7a0019;
                font-weight:600;
            ">
                ⚠️ ${stock} disponibles
            </span>
        `;

    } else {

        stockHTML = `
            <span>
                📦 ${stock} disponibles
            </span>
        `;
    }


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
                <div style="
                    width:120px;
                    height:120px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    border:1px dashed #999;
                    border-radius:10px;
                    margin-bottom:15px;
                ">
                    🖼️
                </div>
            `;


    card.innerHTML = `

        ${imageHTML}

        <div class="admin-product-info">

            <h3>
                ${escapeHTML(product.name)}
            </h3>

            ${
                product.featured
                    ? `
                        <span class="featured-badge">
                            ⭐ Vedette
                        </span>
                    `
                    : ""
            }

            <p>
                Catégorie :
                <strong>
                    ${escapeHTML(
                        product.category ||
                        "Non définie"
                    )}
                </strong>
            </p>

            <p>
                ${escapeHTML(
                    product.description ||
                    "Aucune description"
                )}
            </p>

            <div class="admin-product-details">

                <strong>
                    ${formatPrice(product.price)}
                    GNF
                </strong>

                ${stockHTML}

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
// MODIFIER PRODUIT
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

editingProductId = null;

editingProductImageUrl = null;


productForm.reset();


productStock.value = 1;

productPurchasePrice.value = 0;

productImage.required = true;


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
// AJOUT / MODIFICATION PRODUIT
// ==========================================

if (productForm) {

productForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        try {

            const {
                data
            } =
                await supabaseClient.auth.getSession();


            if (
                !data ||
                !data.session
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


            if (!product.name) {

                showAdminMessage(
                    "❌ Entre le nom du produit."
                );

                return;
            }


            if (
                !Number.isFinite(
                    product.price
                ) ||
                product.price < 0
            ) {

                showAdminMessage(
                    "❌ Prix de vente invalide."
                );

                return;
            }


            if (
                !Number.isFinite(
                    product.purchase_price
                ) ||
                product.purchase_price < 0
            ) {

                showAdminMessage(
                    "❌ Prix d'achat invalide."
                );

                return;
            }


            if (
                !Number.isInteger(
                    product.stock
                ) ||
                product.stock < 0
            ) {

                showAdminMessage(
                    "❌ Le stock doit être un nombre entier supérieur ou égal à 0."
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


                let imageUrl =
                    editingProductImageUrl;


                if (file) {

                    imageUrl =
                        await uploadProductImage(
                            file
                        );
                }


                product.image_url =
                    imageUrl;


                const {
                    error
                } =
                    await supabaseClient
                        .from("products")
                        .update(product)
                        .eq(
                            "id",
                            editingProductId
                        );


                if (error) {

                    if (
                        file &&
                        imageUrl &&
                        imageUrl !==
                            editingProductImageUrl
                    ) {

                        await deleteProductImage(
                            imageUrl
                        );
                    }

                    throw error;
                }


                if (
                    file &&
                    editingProductImageUrl &&
                    imageUrl !==
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


            const {
                error
            } =
                await supabaseClient
                    .from("products")
                    .insert([
                        product
                    ]);


            if (error) {

                await deleteProductImage(
                    imageUrl
                );

                throw error;
            }


            showAdminMessage(
                "✅ Produit ajouté avec succès !",
                true
            );


            productForm.reset();

            productStock.value = 1;

            productPurchasePrice.value = 0;

            productImage.required = true;


            await loadProducts();

            await loadStatistics();

        }

        catch (error) {

            console.error(
                "PRODUCT ERROR:",
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

const confirmation =
    confirm(
        "⚠️ Veux-tu vraiment supprimer « " +
        productNameText +
        " » ?"
    );


if (!confirmation) {
    return;
}


try {

    showAdminMessage(
        "⏳ Suppression en cours..."
    );


    const {
        error
    } =
        await supabaseClient
            .from("products")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        throw error;
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
        "DELETE PRODUCT ERROR:",
        error
    );

    showAdminMessage(
        "❌ Impossible de supprimer : " +
        (
            error.message ||
            "Erreur inconnue."
        )
    );
}

}

// ==========================================
// STATUT PAIEMENT
// ==========================================

function getPaymentStatusClass(status) {

const value =
    String(
        status ||
        PAYMENT_PENDING
    ).toLowerCase();


if (
    value.includes("payé") ||
    value.includes("paye") ||
    value.includes("valid")
) {

    return "paid";
}


if (
    value.includes("refus") ||
    value.includes("annul")
) {

    return "rejected";
}


return "pending";

}

// ==========================================
// RECUPERER LES PRODUITS D'UNE COMMANDE
// ==========================================

function parseOrderItems(order) {

if (!order) {
    return [];
}


try {

    if (Array.isArray(order.items)) {
        return order.items;
    }


    if (typeof order.items === "string") {

        const parsed =
            JSON.parse(
                order.items
            );

        return Array.isArray(parsed)
            ? parsed
            : [];
    }

}

catch (error) {

    console.error(
        "ORDER ITEMS PARSE ERROR:",
        error
    );
}


return [];

}

// ==========================================
// RESTAURER LE STOCK
// ==========================================

async function restoreOrderStock(order) {

const items =
    parseOrderItems(order);


if (!items.length) {

    console.warn(
        "Aucun produit trouvé dans la commande à restaurer.",
        order
    );

    return;
}


for (
    const item
    of items
) {

    const productId =
        item.id;


    const quantity =
        Number(
            item.quantity || 0
        );


    if (
        !productId ||
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        continue;
    }


    // On récupère le stock actuel
    const {
        data: product,
        error: productError
    } =
        await supabaseClient
            .from("products")
            .select(
                "id, stock"
            )
            .eq(
                "id",
                productId
            )
            .maybeSingle();


    if (productError) {

        console.error(
            "STOCK PRODUCT ERROR:",
            productError
        );

        throw productError;
    }


    if (!product) {

        console.warn(
            "Produit introuvable pour restauration du stock :",
            productId
        );

        continue;
    }


    const currentStock =
        Number(
            product.stock || 0
        );


    const newStock =
        currentStock +
        quantity;


    const {
        error: updateError
    } =
        await supabaseClient
            .from("products")
            .update({
                stock:
                    newStock
            })
            .eq(
                "id",
                productId
            );


    if (updateError) {

        console.error(
            "RESTORE STOCK ERROR:",
            updateError
        );

        throw updateError;
    }


    console.log(
        "STOCK RESTAURE :",
        productId,
        "+",
        quantity,
        "=>",
        newStock
    );
}

}

// ==========================================
// MODIFIER STATUT PAIEMENT
// ==========================================

async function updatePaymentStatus(
orderId,
newStatus,
selectElement
) {

if (!orderId) {
    return;
}


try {

    selectElement.disabled = true;


    // --------------------------------------
    // On récupère d'abord la commande
    // --------------------------------------

    const {
        data: currentOrder,
        error: currentOrderError
    } =
        await supabaseClient
            .from("orders")
            .select(
                "id, items, payment_status"
            )
            .eq(
                "id",
                orderId
            )
            .maybeSingle();


    if (currentOrderError) {

        throw currentOrderError;
    }


    if (!currentOrder) {

        throw new Error(
            "Commande introuvable."
        );
    }


    const oldStatus =
        currentOrder.payment_status ||
        PAYMENT_PENDING;


    // --------------------------------------
    // SI REFUS :
    // restaurer le stock UNE SEULE FOIS
    // --------------------------------------

    if (
        newStatus === PAYMENT_REJECTED &&
        oldStatus !== PAYMENT_REJECTED
    ) {

        showAdminMessage(
            "⏳ Annulation de la commande et restauration du stock..."
        );


        await restoreOrderStock(
            currentOrder
        );
    }


    // --------------------------------------
    // Mise à jour du statut
    // --------------------------------------

    const {
        error
    } =
        await supabaseClient
            .from("orders")
            .update({
                payment_status:
                    newStatus
            })
            .eq(
                "id",
                orderId
            );


    if (error) {

        throw error;
    }


    if (
        newStatus === PAYMENT_REJECTED
    ) {

        showAdminMessage(
            "❌ Commande annulée : paiement refusé et stock restauré.",
            true
        );

    } else if (
        newStatus === PAYMENT_PAID
    ) {

        showAdminMessage(
            "✅ Paiement confirmé !",
            true
        );

    } else {

        showAdminMessage(
            "⏳ Paiement remis en attente.",
            true
        );
    }


    selectElement.disabled = false;


    await loadOrders();

    await loadProducts();

    await loadStatistics();

}

catch (error) {

    console.error(
        "PAYMENT STATUS ERROR:",
        error
    );


    showAdminMessage(
        "❌ Impossible de modifier le statut : " +
        (
            error.message ||
            "Erreur inconnue."
        )
    );


    selectElement.disabled = false;
}

}

// ==========================================
// CHARGER COMMANDES
// ==========================================

async function loadOrders() {

const ordersList =
    document.getElementById(
        "orders-list"
    );


if (!ordersList) {
    return;
}


ordersList.innerHTML = `
    <div class="orders-empty">
        Chargement des commandes...
    </div>
`;


try {

    const {
        data: orders,
        error
    } =
        await supabaseClient
            .from("orders")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "ORDERS ERROR:",
            error
        );


        ordersList.innerHTML = `
            <div class="orders-empty">
                ❌ Impossible de charger les commandes.<br>
                <small>
                    ${escapeHTML(error.message)}
                </small>
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
        function(order, index) {

            const items =
                parseOrderItems(
                    order
                );


            let productsHTML = "";


            items.forEach(
                function(item) {

                    const quantity =
                        Number(
                            item.quantity || 1
                        );


                    const price =
                        Number(
                            item.price || 0
                        );


                    productsHTML += `

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
                                }

                                GNF

                            </span>

                        </div>
                    `;
                }
            );


            const date =
                order.created_at
                    ? new Date(
                        order.created_at
                    ).toLocaleString(
                        "fr-FR"
                    )
                    : "Date inconnue";


            const paymentStatus =
                order.payment_status ||
                PAYMENT_PENDING;


            const paymentClass =
                getPaymentStatusClass(
                    paymentStatus
                );


            const orderCard =
                document.createElement(
                    "div"
                );


            orderCard.className =
                "order-card";


            orderCard.innerHTML = `

                <div class="order-header">

                    <div class="order-number">

                        🛍️ Commande #${index + 1}

                    </div>

                    <div class="order-date">

                        ${escapeHTML(date)}

                    </div>

                </div>


                <!-- PAIEMENT -->

                <div style="
                    margin:15px 0;
                    padding:15px;
                    border-radius:10px;
                    background:#faf7f8;
                    border:1px solid #eadfe2;
                ">

                    <div style="
                        font-size:11px;
                        letter-spacing:1px;
                        font-weight:700;
                        margin-bottom:8px;
                    ">

                        💳 PAIEMENT ORANGE MONEY

                    </div>


                    <div style="
                        font-size:15px;
                        font-weight:700;
                        margin-bottom:12px;
                    ">

                        Statut actuel :
                        ${escapeHTML(
                            paymentStatus
                        )}

                    </div>


                    <select
                        class="payment-status-select ${paymentClass}"
                        data-order-id="${escapeHTML(
                            order.id
                        )}"
                        style="
                            width:100%;
                            max-width:360px;
                            padding:12px;
                            border:1px solid #d8cdd1;
                            border-radius:8px;
                            background:white;
                            color:#111;
                            font-size:14px;
                            cursor:pointer;
                        "
                    >

                        <option
                            value="${PAYMENT_PENDING}"
                            ${
                                paymentStatus ===
                                PAYMENT_PENDING
                                    ? "selected"
                                    : ""
                            }
                        >
                            ⏳ En attente de vérification
                        </option>


                        <option
                            value="${PAYMENT_PAID}"
                            ${
                                paymentStatus ===
                                PAYMENT_PAID
                                    ? "selected"
                                    : ""
                            }
                        >
                            ✅ Payé
                        </option>


                        <option
                            value="${PAYMENT_REJECTED}"
                            ${
                                paymentStatus ===
                                PAYMENT_REJECTED
                                    ? "selected"
                                    : ""
                            }
                        >
                            ❌ Paiement refusé
                        </option>

                    </select>

                </div>


                <!-- CLIENT -->

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


                <!-- PRODUITS -->

                <div class="order-products">

                    <div class="order-products-title">

                        📦 Produits commandés

                    </div>

                    ${
                        productsHTML ||
                        "<p>Aucun produit trouvé.</p>"
                    }

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


                <!-- TOTAL -->

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
                        }

                        GNF

                    </span>

                </div>

            `;


            ordersList.appendChild(
                orderCard
            );


            const select =
                orderCard.querySelector(
                    ".payment-status-select"
                );


            if (select) {

                select.addEventListener(
                    "change",
                    function() {

                        updatePaymentStatus(
                            order.id,
                            this.value,
                            this
                        );

                    }
                );
            }

        }
    );

}

catch (error) {

    console.error(
        "LOAD ORDERS ERROR:",
        error
    );


    ordersList.innerHTML = `
        <div class="orders-empty">
            ❌ Une erreur est survenue lors du chargement.
        </div>
    `;
}

}

// ==========================================
// STATISTIQUES
// ==========================================

async function loadStatistics() {

try {

    const {
        data: orders,
        error: ordersError
    } =
        await supabaseClient
            .from("orders")
            .select(
                "items, total, payment_status"
            );


    if (ordersError) {

        console.error(
            "STAT ORDERS ERROR:",
            ordersError
        );

        return;
    }


    const {
        data: products,
        error: productsError
    } =
        await supabaseClient
            .from("products")
            .select(
                "id, purchase_price, stock"
            );


    if (productsError) {

        console.error(
            "STAT PRODUCTS ERROR:",
            productsError
        );

        return;
    }


    // --------------------------------------
    // CHIFFRE D'AFFAIRES
    // --------------------------------------

    let revenue = 0;


    orders.forEach(
        function(order) {

            if (
                order.payment_status ===
                PAYMENT_PAID
            ) {

                revenue +=
                    Number(
                        order.total || 0
                    );
            }
        }
    );


    // --------------------------------------
    // VENTES + BENEFICE
    // --------------------------------------

    let sales = 0;

    let profit = 0;


    orders.forEach(
        function(order) {

            if (
                order.payment_status !==
                PAYMENT_PAID
            ) {

                return;
            }


            const items =
                parseOrderItems(
                    order
                );


            items.forEach(
                function(item) {

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
                            function(product) {

                                return String(
                                    product.id
                                ) ===
                                String(
                                    item.id
                                );
                            }
                        );


                    if (product) {

                        const purchasePrice =
                            Number(
                                product.purchase_price ||
                                0
                            );


                        profit +=
                            (
                                sellingPrice -
                                purchasePrice
                            ) *
                            quantity;
                    }

                }
            );
        }
    );


    // --------------------------------------
    // PRODUITS
    // --------------------------------------

    const productsCount =
        products.length;


    // --------------------------------------
    // STOCK FAIBLE
    // --------------------------------------

    const lowStockCount =
        products.filter(
            function(product) {

                return Number(
                    product.stock ?? 0
                ) <= 5;

            }
        ).length;


    // --------------------------------------
    // MEILLEUR PRODUIT
    // --------------------------------------

    const productSales = {};


    orders.forEach(
        function(order) {

            if (
                order.payment_status !==
                PAYMENT_PAID
            ) {

                return;
            }


            const items =
                parseOrderItems(
                    order
                );


            items.forEach(
                function(item) {

                    const id =
                        String(
                            item.id ||
                            item.name ||
                            "unknown"
                        );


                    const quantity =
                        Number(
                            item.quantity || 0
                        );


                    if (!productSales[id]) {

                        productSales[id] = {

                            name:
                                item.name ||
                                "Produit",

                            quantity: 0
                        };
                    }


                    productSales[id].quantity +=
                        quantity;

                }
            );
        }
    );


    let bestProduct = "—";

    let bestQuantity = 0;


    Object.values(
        productSales
    ).forEach(
        function(product) {

            if (
                product.quantity >
                bestQuantity
            ) {

                bestQuantity =
                    product.quantity;

                bestProduct =
                    product.name;
            }
        }
    );


    // --------------------------------------
    // AFFICHAGE
    // --------------------------------------

    const revenueElement =
        document.getElementById(
            "stat-revenue"
        );

    const profitElement =
        document.getElementById(
            "stat-profit"
        );

    const salesElement =
        document.getElementById(
            "stat-sales"
        );

    const productsElement =
        document.getElementById(
            "stat-products"
        );

    const lowStockElement =
        document.getElementById(
            "stat-low-stock"
        );

    const bestProductElement =
        document.getElementById(
            "stat-best-product"
        );


    if (revenueElement) {

        revenueElement.textContent =
            revenue.toLocaleString(
                "fr-FR"
            ) +
            " GNF";
    }


    if (profitElement) {

        profitElement.textContent =
            profit.toLocaleString(
                "fr-FR"
            ) +
            " GNF";
    }


    if (salesElement) {

        salesElement.textContent =
            sales.toLocaleString(
                "fr-FR"
            );
    }


    if (productsElement) {

        productsElement.textContent =
            productsCount.toLocaleString(
                "fr-FR"
            );
    }


    if (lowStockElement) {

        lowStockElement.textContent =
            lowStockCount.toLocaleString(
                "fr-FR"
            );
    }


    if (bestProductElement) {

        bestProductElement.textContent =
            bestProduct;
    }

}

catch (error) {

    console.error(
        "STATISTICS ERROR:",
        error
    );
}

}

// ==========================================
// FORMAT PRIX
// ==========================================

function formatPrice(price) {

return Number(
    price || 0
).toLocaleString(
    "fr-FR"
);

}

// ==========================================
// SECURITE HTML
// ==========================================

function escapeHTML(value) {

return String(
    value ?? ""
)
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
// DEMARRAGE
// ==========================================

checkSession();
