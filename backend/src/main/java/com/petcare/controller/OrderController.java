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
    //
    // Frontend hien tai (checkout()) CHUA gui "shippingInfo"/"paymentMethod" trong body nay
    // (chi gui {customerId}) -> 2 field nay se null cho toi khi frontend duoc sua 1 dong
    // de gui them, xem ghi chu trong API_DOCS.md muc "Can frontend sua".
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

        // Doc shippingInfo neu frontend co gui (optional, khong bat buoc)
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

        // Ap dung % giam gia thuc te tu Promotion (thay vi hardcode 10% nhu truoc)
        if (cart.getDiscountCode() != null && cart.getDiscountPercent() != null) {
            total = total * (1 - cart.getDiscountPercent() / 100.0);
        }
        order.setTotalAmount(total);

        Order saved = orderRepository.save(order);

        // Xoa cart sau khi tao order
        cart.getItems().clear();
        cart.setDiscountCode(null);
        cart.setDiscountPercent(null);
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
    // Frontend goi CHUNG endpoint nay cho ca 2 truong hop "processing" va "completed"
    // (khong the phan biet duoc tu phia backend vi khong gui du lieu gi khac nhau len).
    // -> Xu ly bang 2 nac: lan dau bam duyet (PENDING) -> PROCESSING, bam duyet tiep -> COMPLETED.
    // Cach nay khong can sua gi ben Frontend ca.
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

    // rejectOrder(id, reason): Boolean -> giu status "sach" la CANCELLED, ly do luu rieng o cancelReason
    // (frontend chi mong doi status la 1 trong 4 gia tri pending/processing/completed/cancelled)
    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectOrder(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();
        order.setStatus("CANCELLED");
        order.setCancelReason(body.getOrDefault("reason", ""));
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
