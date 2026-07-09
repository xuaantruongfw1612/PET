package com.petcare.controller;

import com.petcare.model.Product;
import com.petcare.repository.OrderDetailRepository;
import com.petcare.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final OrderDetailRepository orderDetailRepository;

    public ProductController(ProductRepository productRepository, OrderDetailRepository orderDetailRepository) {
        this.productRepository = productRepository;
        this.orderDetailRepository = orderDetailRepository;
    }

    @GetMapping
    public List<Product> getProductList() {
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // checkProductNameExists(name): Boolean
    @GetMapping("/check-name")
    public ResponseEntity<?> checkProductNameExists(@RequestParam String name) {
        return ResponseEntity.ok(Map.of("exists", productRepository.existsByName(name)));
    }

    // addProduct(data): Boolean
    @PostMapping
    public ResponseEntity<?> addProduct(@RequestBody Product data) {
        if (productRepository.existsByName(data.getName())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Ten san pham da ton tai"));
        }
        Product saved = productRepository.save(data);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product data) {
        Product existing = productRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        existing.setName(data.getName());
        existing.setCategory(data.getCategory());
        existing.setPrice(data.getPrice());
        existing.setStockQuantity(data.getStockQuantity());
        productRepository.save(existing);
        return ResponseEntity.ok(existing);
    }

    // deleteProduct(id): Boolean
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (!checkProductConstraints(id)) {
            return ResponseEntity.badRequest().body(Map.of("message", "San pham da co trong don hang, khong the xoa"));
        }
        productRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Xoa thanh cong"));
    }

    // checkProductConstraints(id): Boolean -> true neu co the xoa an toan (chua tung ban)
    @GetMapping("/{id}/check-constraints")
    public boolean checkProductConstraints(@PathVariable Long id) {
        return orderDetailRepository.findAll().stream().noneMatch(od -> id.equals(od.getProductId()));
    }
}
