package com.petcare.controller;

import com.petcare.model.Category;
import com.petcare.model.Product;
import com.petcare.repository.CategoryRepository;
import com.petcare.repository.OrderDetailRepository;
import com.petcare.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final CategoryRepository categoryRepository;

    public ProductController(ProductRepository productRepository,
                              OrderDetailRepository orderDetailRepository,
                              CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.categoryRepository = categoryRepository;
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
    // Body: { "name": "...", "price": ..., "stockQuantity": ..., "description": "...",
    //         "imageUrl": "...", "categoryIds": [1, 2] }
    @PostMapping
    public ResponseEntity<?> addProduct(@RequestBody Product data, @RequestParam(required = false) List<Long> categoryIds) {
        if (productRepository.existsByName(data.getName())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Ten san pham da ton tai"));
        }
        if (categoryIds != null && !categoryIds.isEmpty()) {
            data.setCategories(resolveCategories(categoryIds));
        }
        Product saved = productRepository.save(data);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id,
                                            @RequestBody Product data,
                                            @RequestParam(required = false) List<Long> categoryIds) {
        Product existing = productRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();

        existing.setName(data.getName());
        existing.setPrice(data.getPrice());
        existing.setStockQuantity(data.getStockQuantity());
        existing.setDescription(data.getDescription());
        existing.setImageUrl(data.getImageUrl());

        if (categoryIds != null) {
            existing.setCategories(resolveCategories(categoryIds));
        }

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

    @GetMapping("/{id}/check-constraints")
    public boolean checkProductConstraints(@PathVariable Long id) {
        return orderDetailRepository.findAll().stream().noneMatch(od -> id.equals(od.getProductId()));
    }

    private Set<Category> resolveCategories(List<Long> categoryIds) {
        Set<Category> categories = new HashSet<>();
        for (Long catId : categoryIds) {
            Category category = categoryRepository.findById(catId)
                    .orElseThrow(() -> new RuntimeException("Category khong ton tai: id=" + catId));
            categories.add(category);
        }
        return categories;
    }
}
