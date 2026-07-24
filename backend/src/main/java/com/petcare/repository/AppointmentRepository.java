package com.petcare.repository;

import com.petcare.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // (Spring Data JPA tu hieu "Pet_CustomerId" la duong dan appointment.pet.customerId)
    List<Appointment> findByPet_CustomerId(Long customerId);

    List<Appointment> findByDateAndTime(LocalDate date, LocalTime time);
}
