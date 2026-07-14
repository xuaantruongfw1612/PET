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
        employeeRepository.save(existing);
        return ResponseEntity.ok(existing);
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
