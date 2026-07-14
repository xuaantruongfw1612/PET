package com.petcare.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    private Long orderId;
    private String method; // CASH / CARD / BANK_TRANSFER / MOMO ...
    private String paymentStatus = "PENDING"; // PENDING / SUCCESS / FAILED
}
