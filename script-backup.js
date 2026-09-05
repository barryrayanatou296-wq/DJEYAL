// ==========================================
// DJEYAL — PANIER COMPLET
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ------------------------------
    // ÉLÉMENTS
    // ------------------------------

    const cartButton = document.getElementById("cartButton");
    const cartPanel = document.getElementById("cartPanel");
    const cartOverlay = document.getElementById("cartOverlay");
    const closeCart = document.getElementById("closeCart");

    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const cartCount = document.querySelector(".cart-count");


    // ------------------------------
    // PANIER
    // ------------------------------

    let panier = [];


    // ------------------------------
    // OUVRIR LE PANIER
    // ------------------------------

    cartButton.addEventListener("click", function () {

        cartPanel.classList.add("active");
        cartOverlay.classList.add("active");

    });


    // ------------------------------
    // FERMER LE PANIER
    // ------------------------------

    function fermerPanier() {

        cartPanel.classList.remove("active");
        cartOverlay.classList.remove("active");

    }


    closeCart.addEventListener("click", fermerPanier);

    cartOverlay.addEventListener("click", fermerPanier);


    // ------------------------------
    // FORMATER LES PRIX
    // ------------------------------

    function prixFormat(prix) {

        return prix.toLocaleString("fr-FR") + " FG";

    }


    // ------------------------------
    // METTRE À JOUR LE PANIER
    // ------------------------------

    function mettreAJourPanier() {

        cartItems.innerHTML = "";

        let total = 0;
        let nombreArticles = 0;


        // Panier vide

        if (panier.length === 0) {

            cartItems.innerHTML = `
                <p class="empty-cart">
                    Ton panier est vide.
                </p>
            `;

        }


        // Articles

        panier.forEach(function (article, index) {

            total += article.price * article.quantity;

            nombreArticles += article.quantity;


            const element = document.createElement("div");

            element.className = "cart-item";


            element.innerHTML = `

                <div class="cart-item-image">
                    ${article.image}
                </div>

                <div class="cart-item-info">

                    <h3>
                        ${article.name}
                    </h3>

                    <p>
                        ${prixFormat(article.price)}
                        × ${article.quantity}
                    </p>

                </div>

                <button
                    class="cart-remove"
                    data-index="${index}">
                    ×
                </button>

            `;


            cartItems.appendChild(element);

        });


        // Total

        cartTotal.textContent = prixFormat(total);


        // Compteur

        cartCount.textContent = nombreArticles;


        if (nombreArticles > 0) {

            cartCount.classList.add("show");

        } else {

            cartCount.classList.remove("show");

        }


        // ------------------------------
        // SUPPRIMER UN ARTICLE
        // ------------------------------

        document.querySelectorAll(".cart-remove").forEach(function (button) {

            button.addEventListener("click", function () {

                const index =
                    Number(button.dataset.index);

                panier.splice(index, 1);

                mettreAJourPanier();

            });

        });

    }


    // ------------------------------
    // AJOUTER AU PANIER
    // ------------------------------

    const boutons =
        document.querySelectorAll(".add-cart");


    boutons.forEach(function (bouton) {

        bouton.addEventListener("click", function () {

            const carte =
                bouton.closest(".product-card");


            const nom =
                carte.querySelector("h3").textContent;


            const prixTexte =
                carte.querySelector(".price").textContent;


            const prix =
                parseInt(
                    prixTexte.replace(/\D/g, "")
                );


            const image =
                carte.querySelector(".product-photo")
                .childNodes[0]
                .textContent
                .trim();


            // Vérifier si l'article existe déjà

            const articleExistant =
                panier.find(function (article) {

                    return article.name === nom;

                });


            if (articleExistant) {

                articleExistant.quantity++;

            } else {

                panier.push({

                    name: nom,

                    price: prix,

                    image: image,

                    quantity: 1

                });

            }


            // Actualiser

            mettreAJourPanier();


            // Animation du bouton

            bouton.textContent =
                "✓ Ajouté au panier";


            setTimeout(function () {

                bouton.textContent =
                    "🛍 Ajouter au panier";

            }, 1500);

        });

    });


    // ------------------------------
    // INITIALISATION
    // ------------------------------

    mettreAJourPanier();

});