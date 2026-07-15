package com.petcare.controller;

import com.petcare.model.Promotion;
import com.petcare.repository.PromotionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Khop voi tinh nang addPromotion/updatePromotion/deletePromotion ben frontend (Admin)
@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionRepository promotionRepository;

    public PromotionController(PromotionRepository promotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    @GetMapping
    public List<Promotion> getPromotionList() {
        return promotionRepository.findAll();
    }

    @PostMapping
    public Promotion addPromotion(@RequestBody Promotion data) {
        return promotionRepository.save(data);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePromotion(@PathVariable Long id, @RequestBody Promotion data) {
        Promotion existing = promotionRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        existing.setCode(data.getCode());
        existing.setDiscountPercent(data.getDiscountPercent());
        existing.setStartDate(data.getStartDate());
        existing.setEndDate(data.getEndDate());
        existing.setIsActive(data.getIsActive());
        promotionRepository.save(existing);
        return ResponseEntity.ok(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable Long id) {
        if (!promotionRepository.existsById(id)) return ResponseEntity.notFound().build();
        promotionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
