package com.petcare.controller;

import com.petcare.model.Cart;
import com.petcare.model.CartItem;
import com.petcare.model.Product;
import com.petcare.model.Promotion;
import com.petcare.repository.CartRepository;
import com.petcare.repository.CartItemRepository;
import com.petcare.repository.ProductRepository;
import com.petcare.repository.PromotionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final PromotionRepository promotionRepository;

    public CartController(CartRepository cartRepository,
                           CartItemRepository cartItemRepository,
                           ProductRepository productRepository,
                           PromotionRepository promotionRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.promotionRepository = promotionRepository;
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<Cart> getCart(@PathVariable Long customerId) {
        Cart cart = getOrCreateCart(customerId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/{customerId}/items")
    public ResponseEntity<?> addToCart(
            @PathVariable Long customerId,
            @RequestParam Long productId,
            @RequestParam int quantity) {

        Cart cart = getOrCreateCart(customerId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("San pham khong ton tai"));

        if (product.getStockQuantity() < quantity) {
            return ResponseEntity.badRequest().body("Khong du hang trong kho");
        }

        Optional<CartItem> existing = cartItemRepository.findByCartAndProduct(cart, product);
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            cart.getItems().add(new CartItem(cart, product, quantity));
        }

        cartRepository.save(cart);
        return ResponseEntity.ok(cart);
    }

    // Ap ma giam gia -> validate qua PromotionRepository (khong con TODO)
    @PostMapping("/{customerId}/apply-discount")
    public ResponseEntity<?> applyDiscount(
            @PathVariable Long customerId,
            @RequestParam String code) {

        Cart cart = getOrCreateCart(customerId);

        Promotion promotion = promotionRepository.findByCode(code)
                .orElse(null);

        if (promotion == null) {
            return ResponseEntity.badRequest().body("Ma giam gia khong ton tai");
        }
        if (!Boolean.TRUE.equals(promotion.getIsActive())) {
            return ResponseEntity.badRequest().body("Ma giam gia da bi tam ngung");
        }
        LocalDate today = LocalDate.now();
        if (promotion.getStartDate() != null && today.isBefore(promotion.getStartDate())) {
            return ResponseEntity.badRequest().body("Ma giam gia chua den ngay ap dung");
        }
        if (promotion.getEndDate() != null && today.isAfter(promotion.getEndDate())) {
            return ResponseEntity.badRequest().body("Ma giam gia da het han");
        }

        cart.setPromotion(promotion);
        cart.setDiscountCode(promotion.getCode());
        cart.setDiscountPercent(java.math.BigDecimal.valueOf(promotion.getDiscountPercent()));
        cartRepository.save(cart);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/{customerId}/discount")
    public ResponseEntity<?> removeDiscount(@PathVariable Long customerId) {
        Cart cart = getOrCreateCart(customerId);
        cart.setPromotion(null);
        cart.setDiscountCode(null);
        cart.setDiscountPercent(null);
        cartRepository.save(cart);
        return ResponseEntity.ok(cart);
    }

    private Cart getOrCreateCart(Long customerId) {
        return cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setCustomerId(customerId);
                    return cartRepository.save(newCart);
                });
    }
}
