package com.petcare.controller;

import com.petcare.model.Cart;
import com.petcare.model.CartItem;
import com.petcare.model.Product;
import com.petcare.repository.CartRepository;
import com.petcare.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Dung voi class Cart trong diagram
@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartController(CartRepository cartRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
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

    // applyDiscountCode(code): Boolean
    @PostMapping("/{customerId}/discount")
    public ResponseEntity<?> applyDiscountCode(@PathVariable Long customerId, @RequestBody Map<String, String> body) {
        Cart cart = getCart(customerId);
        String code = body.get("code");

        // Demo: chi cho phep 1 vai ma giam gia co dinh, ban co the thay bang bang discount_codes trong DB
        List<String> validCodes = List.of("SALE10", "PETLOVER", "WELCOME");
        if (!validCodes.contains(code)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Ma giam gia khong hop le"));
        }
        cart.setDiscountCode(code);
        cartRepository.save(cart);
        return ResponseEntity.ok(cart);
    }
}
