package com.petcare.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appointmentId;

    @ManyToOne
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime time;

    @Column(nullable = false)
    private String status;

    @OneToMany(mappedBy = "appointment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AppointmentService> appointmentServices = new ArrayList<>();

    // Helper: lay customerId thong qua Pet (khong luu truc tiep trong Appointment nua,
    // tranh du thua du lieu / transitive dependency)
    @Transient
    public Long getCustomerId() {
        return pet != null ? pet.getCustomerId() : null;
    }

    // Helper: lay petId thuan (dung cho JSON response / tra ve cho frontend)
    @Transient
    public Long getPetId() {
        return pet != null ? pet.getPetId() : null;
    }
}
