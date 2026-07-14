package com.petcare.controller;

import com.petcare.model.Customer;
import com.petcare.model.Employee;
import com.petcare.model.User;
import com.petcare.repository.CustomerRepository;
import com.petcare.repository.EmployeeRepository;
import com.petcare.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Tuong ung method login(), logout(), updateProfile() trong class User
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;

    public AuthController(UserRepository userRepository, CustomerRepository customerRepository, EmployeeRepository employeeRepository) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.employeeRepository = employeeRepository;
    }

    // Dang ky khach hang moi (Customer)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Customer customer) {
        if (userRepository.existsByUsername(customer.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username da ton tai"));
        }
        customer.setStatus("ACTIVE");
        Customer saved = customerRepository.save(customer);
        return ResponseEntity.ok(saved);
    }

    // login(): Boolean -> tra ve thong tin user + role neu dung
    // Frontend can 1 trong 4 chuoi: "customer" | "consultant" | "sales" | "admin"
    // (ho tu .toLowerCase() chuoi minh tra ve, nen minh tra HOA cho dung quy uoc, ho tu ha thanh thuong)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        return userRepository.findByUsername(username)
                .filter(u -> u.getPassword().equals(password))
                .<ResponseEntity<?>>map(u -> {
                    String role = employeeRepository.findById(u.getUserId())
                            .map(emp -> emp.getRole() != null ? emp.getRole() : "CONSULTANT")
                            .orElse("CUSTOMER");
                    return ResponseEntity.ok(Map.of(
                            "userId", u.getUserId(),
                            "username", u.getUsername(),
                            "role", role
                    ));
                })
                .orElse(ResponseEntity.status(401).body(Map.of("message", "Sai username hoac password")));
    }

    // logout(): void - phia client tu xoa session/localStorage, backend chi tra ve OK
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Logout thanh cong"));
    }

    // updateProfile(): void
    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        if (body.containsKey("email")) user.setEmail(body.get("email"));
        if (body.containsKey("password")) user.setPassword(body.get("password"));
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }
}
