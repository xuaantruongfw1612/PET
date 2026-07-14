package com.petcare.controller;

import com.petcare.model.Order;
import com.petcare.model.Payment;
import com.petcare.repository.OrderRepository;
import com.petcare.repository.PaymentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Dung voi class PaymentGateway trong diagram
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentController(PaymentRepository paymentRepository, OrderRepository orderRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    // processPayment(method): Boolean -> tao ban ghi Payment cho Order
    @PostMapping
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> body) {
        Long orderId = Long.valueOf(body.get("orderId").toString());
        String method = (String) body.get("method");

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();

        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setMethod(method);
        payment.setPaymentStatus("PENDING");
        Payment saved = paymentRepository.save(payment);

        // Goi validateTransaction ngay sau khi tao (demo mo phong cong thanh toan)
        boolean success = validateTransaction(saved.getPaymentId());
        return ResponseEntity.ok(Map.of("payment", saved, "success", success));
    }

    // validateTransaction(): Boolean -> demo: mo phong luon thanh cong,
    // trong thuc te se goi API cong thanh toan thu 3 (VNPay/Momo/Stripe...)
    @PostMapping("/{id}/validate")
    public boolean validateTransaction(@PathVariable Long id) {
        Payment payment = paymentRepository.findById(id).orElse(null);
        if (payment == null) return false;

        boolean success = true; // demo: luon thanh cong
        payment.setPaymentStatus(success ? "SUCCESS" : "FAILED");
        paymentRepository.save(payment);

        if (success) {
            orderRepository.findById(payment.getOrderId()).ifPresent(order -> {
                order.setStatus("PAID");
                orderRepository.save(order);
            });
        }
        return success;
    }
}
