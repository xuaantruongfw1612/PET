package com.petcare.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    private Long customerId;
    private Long employeeId;

    private LocalDateTime orderDate = LocalDateTime.now();
    private Double totalAmount;

    // PENDING -> PROCESSING -> COMPLETED, hoac PENDING -> CANCELLED
    // (khop dung 4 gia tri Order['status'] ben frontend, ho tu .toLowerCase() lai)
    private String status = "PENDING";

    // Ly do huy don, tach rieng thay vi noi vao status (giu status "sach" cho frontend so sanh enum)
    private String cancelReason;

    // Thong tin giao hang - frontend goi la "ShippingInfo"
    private String shippingFullName;
    private String shippingPhone;
    private String shippingAddress;
    private String shippingNotes;
    private String paymentMethod;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderDetail> orderDetails = new ArrayList<>();
}
