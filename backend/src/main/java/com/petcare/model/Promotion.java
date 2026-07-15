package com.petcare.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// Class nay KHONG co trong Class Diagram ban dau, them vao de khop voi
// tinh nang "Quan ly khuyen mai" ma ban Frontend da thiet ke san (Promotion type).
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
