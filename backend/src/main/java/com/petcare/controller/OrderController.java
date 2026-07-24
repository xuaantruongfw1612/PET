package com.petcare.controller;

import com.petcare.model.*;
import com.petcare.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @GetMapping
    public List<Order> getOrderList() {
        return orderRepository.findAll();
    }

    @GetMapping("/customer/{customerId}")
    public List<Order> getOrdersByCustomer(@PathVariable Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    @PostMapping
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        Long customerId = Long.valueOf(body.get("customerId").toString());
        Cart cart = cartRepository.findByCustomerId(customerId).orElse(null);
        if (cart == null || cart.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cart trong, khong the tao don hang"));
        }

        Order order = new Order();
        order.setCustomerId(customerId);
        order.setStatus("PENDING");

        Object shippingRaw = body.get("shippingInfo");
        if (shippingRaw instanceof Map) {
            Map<String, Object> shipping = (Map<String, Object>) shippingRaw;
            order.setShippingFullName((String) shipping.get("fullName"));
            order.setShippingPhone((String) shipping.get("phone"));
            order.setShippingAddress((String) shipping.get("address"));
            order.setShippingNotes((String) shipping.get("notes"));
        }
        if (body.get("paymentMethod") != null) {
            order.setPaymentMethod(body.get("paymentMethod").toString());
        }

        double total = 0;
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (product == null || product.getStockQuantity() < item.getQuantity()) {
                Long pid = product != null ? product.getProductId() : null;
                return ResponseEntity.badRequest().body(Map.of("message", "San pham " + pid + " khong du hang"));
            }

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProductId(product.getProductId());
            detail.setQuantity(item.getQuantity());
            detail.setUnitPrice(product.getPrice());
            order.getOrderDetails().add(detail);

            total += product.getPrice() * item.getQuantity();

            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        if (cart.getDiscountCode() != null && cart.getDiscountPercent() != null) {
            total = total * (1 - cart.getDiscountPercent().doubleValue() / 100.0);
        }
        order.setTotalAmount(total);

        Order saved = orderRepository.save(order);

        cart.markAsCheckedOut();
        cartRepository.save(cart);

        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();
        order.setStatus(body.get("status"));
        orderRepository.save(order);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveOrder(@PathVariable Long id, @RequestParam(required = false) Long employeeId) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();

        if ("PENDING".equals(order.getStatus())) {
            order.setStatus("PROCESSING");
        } else {
            order.setStatus("COMPLETED");
        }
        if (employeeId != null) order.setEmployeeId(employeeId);
        orderRepository.save(order);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectOrder(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();
        order.setStatus("CANCELLED");
        order.setCancelReason(body.getOrDefault("reason", ""));
        orderRepository.save(order);
        return ResponseEntity.ok(order);
    }

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
