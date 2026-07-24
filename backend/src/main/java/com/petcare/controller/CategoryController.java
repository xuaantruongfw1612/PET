package com.petcare.controller;

import com.petcare.model.Category;
import com.petcare.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public List<Category> getCategoryList() {
        return categoryRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> addCategory(@RequestBody Category data) {
        if (categoryRepository.findByName(data.getName()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Danh muc da ton tai"));
        }
        return ResponseEntity.ok(categoryRepository.save(data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) return ResponseEntity.notFound().build();
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Xoa thanh cong"));
    }
}
