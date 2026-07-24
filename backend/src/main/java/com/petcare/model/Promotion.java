package com.petcare.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// tinh nang "Quan ly khuyen mai"
@Entity
@Table(name = "promotions")
@Data
@NoArgsConstructor
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long promotionId;

    @Column(unique = true, nullable = false)
    private String code;

    private Double discountPercent;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive = true;
}
