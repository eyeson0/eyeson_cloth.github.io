/* ============================================================
   EYESON — WISHLIST.JS
   Heart toggles persisted per product id; wishlist page renders
   from the same productCard layout.
   ============================================================ */

function getWishlist() { return store.get("wishlist", []); }

/* Toggle a product in / out of the wishlist and refresh the heart */
function toggleWishlist(id, btn) {
  const list = getWishlist();
  const i = list.indexOf(id);
  if (i > -1) { list.splice(i, 1); toast("Removed from wishlist"); }
  else { list.push(id); toast("Saved to wishlist"); }
  store.set("wishlist", list);
  if (btn) {
    btn.classList.toggle("active", i === -1);
    btn.textContent = i === -1 ? "♥" : "♡";
  }
  /* Re-render the wishlist page grid if we are on it */
  if (typeof renderWishlistPage === "function") renderWishlistPage();
}
