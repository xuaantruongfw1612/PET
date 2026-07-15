package com.petcare.controller;

import com.petcare.model.Cart;
import com.petcare.model.CartItem;
import com.petcare.model.Product;
import com.petcare.model.Promotion;
import com.petcare.repository.CartRepository;
import com.petcare.repository.ProductRepository;
import com.petcare.repository.PromotionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

// Dung voi class Cart trong diagram
@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final PromotionRepository promotionRepository;

    public CartController(CartRepository cartRepository, ProductRepository productRepository, PromotionRepository promotionRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.promotionRepository = promotionRepository;
    }

    // Lay cart cua 1 khach hang, neu chua co thi tao moi
    @GetMapping("/{customerId}")
    public Cart getCart(@PathVariable Long customerId) {
        return cartRepository.findByCustomerId(customerId).orElseGet(() -> {
            Cart c = new Cart();
            c.setCustomerId(customerId);
            return cartRepository.save(c);
        });
    }

    // checkStockQuantity(productId, qty): Boolean
    @GetMapping("/check-stock")
    public ResponseEntity<?> checkStockQuantity(@RequestParam Long productId, @RequestParam Integer qty) {
        Product product = productRepository.findById(productId).orElse(null);
        boolean ok = product != null && product.getStockQuantity() >= qty;
        return ResponseEntity.ok(Map.of("available", ok));
    }

    // updateCart(items): Boolean -> them/sua/xoa item trong cart
    @PutMapping("/{customerId}/items")
    public ResponseEntity<?> updateCart(@PathVariable Long customerId, @RequestBody List<CartItem> items) {
        Cart cart = getCart(customerId);

        for (CartItem item : items) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product == null || product.getStockQuantity() < item.getQuantity()) {
                return ResponseEntity.badRequest().body(Map.of("message", "San pham khong du so luong trong kho"));
            }
        }

        cart.getItems().clear();
        for (CartItem item : items) {
            item.setCart(cart);
            cart.getItems().add(item);
        }
        cartRepository.save(cart);
        return ResponseEntity.ok(cart);
    }

    // applyDiscountCode(code): Boolean -> tra bang Promotion that (thay vi list cung nhu truoc)
    @PostMapping("/{customerId}/discount")
    public ResponseEntity<?> applyDiscountCode(@PathVariable Long customerId, @RequestBody Map<String, String> body) {
        Cart cart = getCart(customerId);
        String code = body.get("code");

        Promotion promo = promotionRepository.findByCode(code).orElse(null);
        if (promo == null || !Boolean.TRUE.equals(promo.getIsActive())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Ma giam gia khong ton tai hoac da bi tat"));
        }
        LocalDate today = LocalDate.now();
        if (promo.getStartDate() != null && today.isBefore(promo.getStartDate())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Ma giam gia chua den ngay ap dung"));
        }
        if (promo.getEndDate() != null && today.isAfter(promo.getEndDate())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Ma giam gia da het han"));
        }

        cart.setDiscountCode(code);
        cart.setDiscountPercent(promo.getDiscountPercent());
        cartRepository.save(cart);
        return ResponseEntity.ok(cart);
    }
}
