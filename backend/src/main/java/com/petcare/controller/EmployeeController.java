package com.petcare.controller;

import com.petcare.model.Employee;
import com.petcare.repository.EmployeeRepository;
import com.petcare.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Dung voi class EmployeeController trong diagram
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public EmployeeController(EmployeeRepository employeeRepository, UserRepository userRepository) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    // getEmployeeList(): List<Employee>
    @GetMapping
    public List<Employee> getEmployeeList() {
        return employeeRepository.findAll();
    }

    // addEmployee(data): Boolean
    @PostMapping
    public ResponseEntity<?> addEmployee(@RequestBody Employee data) {
        if (!validateEmployeeData(data)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Du lieu nhan vien khong hop le"));
        }
        if (userRepository.existsByUsername(data.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username da ton tai"));
        }
        data.setStatus("ACTIVE");
        data.setRole(normalizeRole(data.getRole()));
        Employee saved = employeeRepository.save(data);
        return ResponseEntity.ok(saved);
    }

    // updateEmployee(id, data): Boolean
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody Employee data) {
        Employee existing = employeeRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        existing.setEmail(data.getEmail());
        existing.setPermissions(data.getPermissions());
        existing.setStatus(data.getStatus());
        if (data.getRole() != null) existing.setRole(normalizeRole(data.getRole()));
        employeeRepository.save(existing);
        return ResponseEntity.ok(existing);
    }

    // updateUserRole(id, role): Boolean -> khop voi ham updateUserRole ben frontend (admin/consultant/sales)
    @PatchMapping("/{id}/role-type")
    public ResponseEntity<?> updateRoleType(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Employee employee = employeeRepository.findById(id).orElse(null);
        if (employee == null) return ResponseEntity.notFound().build();
        employee.setRole(normalizeRole(body.get("role")));
        employeeRepository.save(employee);
        return ResponseEntity.ok(employee);
    }

    // Chuan hoa role ve HOA, chi cho phep 3 gia tri khop voi frontend (admin/consultant/sales).
    // "admin" duoc tao thu cong trong DB (khong cho tu dang ky qua form), nhu ghi chu trong README.
    private String normalizeRole(String role) {
        if (role == null) return "CONSULTANT";
        String upper = role.trim().toUpperCase();
        return switch (upper) {
            case "ADMIN", "CONSULTANT", "SALES" -> upper;
            default -> "CONSULTANT";
        };
    }

    // deleteEmployee(id): Boolean
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        if (!employeeRepository.existsById(id)) return ResponseEntity.notFound().build();
        employeeRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Xoa thanh cong"));
    }

    // updateRole(id, roles): Boolean -> cap nhat "permissions"
    @PatchMapping("/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Employee employee = employeeRepository.findById(id).orElse(null);
        if (employee == null) return ResponseEntity.notFound().build();
        employee.setPermissions(body.get("permissions"));
        employeeRepository.save(employee);
        return ResponseEntity.ok(employee);
    }

    // validateEmployeeData(data): Boolean
    private boolean validateEmployeeData(Employee data) {
        return data.getUsername() != null && !data.getUsername().isBlank()
                && data.getPassword() != null && !data.getPassword().isBlank();
    }
}
