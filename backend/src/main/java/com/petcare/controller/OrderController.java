package com.petcare.controller;

import com.petcare.model.*;
import com.petcare.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Dung voi class OrderController trong diagram
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;

    public OrderController(OrderRepository orderRepository, ProductRepository productRepository, CartRepository cartRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
    }

    // getOrderList(): List<Order>
    @GetMapping
    public List<Order> getOrderList() {
        return orderRepository.findAll();
    }

    @GetMapping("/customer/{customerId}")
    public List<Order> getOrdersByCustomer(@PathVariable Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    // createOrder(cartData, discountCode): Boolean -> tuong ung method trong class Order
    // Chuyen tu Cart -> tao Order + OrderDetail, tru stock, tao Payment (PENDING)
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        Long customerId = Long.valueOf(body.get("customerId").toString());
        Cart cart = cartRepository.findByCustomerId(customerId).orElse(null);
        if (cart == null || cart.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cart trong, khong the tao don hang"));
        }

        Order order = new Order();
        order.setCustomerId(customerId);
        order.setStatus("PENDING");

        double total = 0;
        for (CartItem item : cart.getItems()) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product == null || product.getStockQuantity() < item.getQuantity()) {
                return ResponseEntity.badRequest().body(Map.of("message", "San pham " + item.getProductId() + " khong du hang"));
            }
            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProductId(product.getProductId());
            detail.setQuantity(item.getQuantity());
            detail.setUnitPrice(product.getPrice());
            order.getOrderDetails().add(detail);

            total += product.getPrice() * item.getQuantity();

            // Tru stock
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        // Ap dung discount code neu co (demo: giam 10% cho moi ma hop le)
        if (cart.getDiscountCode() != null) {
            total = total * 0.9;
        }
        order.setTotalAmount(total);

        Order saved = orderRepository.save(order);

        // Xoa cart sau khi tao order
        cart.getItems().clear();
        cart.setDiscountCode(null);
        cartRepository.save(cart);

        return ResponseEntity.ok(saved);
    }

    // updateOrderStatus(status): Boolean
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();
        order.setStatus(body.get("status"));
        orderRepository.save(order);
        return ResponseEntity.ok(order);
    }

    // approveOrder(id): Boolean
    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveOrder(@PathVariable Long id, @RequestParam(required = false) Long employeeId) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();
        order.setStatus("APPROVED");
        if (employeeId != null) order.setEmployeeId(employeeId);
        orderRepository.save(order);
        return ResponseEntity.ok(order);
    }

    // rejectOrder(id, reason): Boolean
    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectOrder(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();
        order.setStatus("REJECTED: " + body.getOrDefault("reason", ""));
        orderRepository.save(order);
        return ResponseEntity.ok(order);
    }

    // exportOrderReport(): File -> demo tra ve JSON tong hop, co the mo rong xuat CSV/PDF
    @GetMapping("/report")
    public ResponseEntity<?> exportOrderReport() {
        List<Order> orders = orderRepository.findAll();
        double totalRevenue = orders.stream()
                .filter(o -> o.getTotalAmount() != null)
                .mapToDouble(Order::getTotalAmount)
                .sum();
        return ResponseEntity.ok(Map.of(
                "totalOrders", orders.size(),
                "totalRevenue", totalRevenue,
                "orders", orders
        ));
    }
}
