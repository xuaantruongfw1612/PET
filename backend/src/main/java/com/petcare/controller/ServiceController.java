package com.petcare.controller;

import com.petcare.model.Service;
import com.petcare.repository.ServiceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Dung voi class Service trong diagram
@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceRepository serviceRepository;

    public ServiceController(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    // getServiceList(): List<Service>
    @GetMapping
    public List<Service> getServiceList() {
        return serviceRepository.findAll();
    }

    // addService(data): Boolean
    @PostMapping
    public Service addService(@RequestBody Service data) {
        return serviceRepository.save(data);
    }

    // updateService(id, data): Boolean
    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(@PathVariable Long id, @RequestBody Service data) {
        Service existing = serviceRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        existing.setName(data.getName());
        existing.setDescription(data.getDescription());
        existing.setPrice(data.getPrice());
        serviceRepository.save(existing);
        return ResponseEntity.ok(existing);
    }

    // deleteService(id): Boolean
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        if (!serviceRepository.existsById(id)) return ResponseEntity.notFound().build();
        serviceRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
