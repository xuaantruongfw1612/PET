package com.petcare.controller;

import com.petcare.model.Pet;
import com.petcare.repository.PetRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetRepository petRepository;

    public PetController(PetRepository petRepository) {
        this.petRepository = petRepository;
    }

    @GetMapping("/customer/{customerId}")
    public List<Pet> getPetsByCustomer(@PathVariable Long customerId) {
        return petRepository.findByCustomerId(customerId);
    }

    // getPetInfo(): Pet
    @GetMapping("/{id}")
    public ResponseEntity<Pet> getPetInfo(@PathVariable Long id) {
        return petRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Pet addPet(@RequestBody Pet pet) {
        return petRepository.save(pet);
    }

    // updatePetInfo(data): Boolean
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePetInfo(@PathVariable Long id, @RequestBody Pet data) {
        Pet existing = petRepository.findById(id).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();
        existing.setName(data.getName());
        existing.setSpecies(data.getSpecies());
        existing.setAge(data.getAge());
        existing.setHealthStatus(data.getHealthStatus());
        petRepository.save(existing);
        return ResponseEntity.ok(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePet(@PathVariable Long id) {
        if (!petRepository.existsById(id)) return ResponseEntity.notFound().build();
        petRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
