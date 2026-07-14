package com.petcare.controller;

import com.petcare.model.Appointment;
import com.petcare.model.Service;
import com.petcare.repository.AppointmentRepository;
import com.petcare.repository.ServiceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

// Dung voi class AppointmentController trong diagram
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final ServiceRepository serviceRepository;

    public AppointmentController(AppointmentRepository appointmentRepository, ServiceRepository serviceRepository) {
        this.appointmentRepository = appointmentRepository;
        this.serviceRepository = serviceRepository;
    }

    // getAppointmentList(): List<Appointment>
    @GetMapping
    public List<Appointment> getAppointmentList() {
        return appointmentRepository.findAll();
    }

    @GetMapping("/customer/{customerId}")
    public List<Appointment> getByCustomer(@PathVariable Long customerId) {
        return appointmentRepository.findByCustomerId(customerId);
    }

    // checkAvailability(date, time): Boolean -> tuong ung method trong class Appointment
    @GetMapping("/check-availability")
    public ResponseEntity<?> checkAvailability(
            @RequestParam LocalDate date,
            @RequestParam LocalTime time) {
        List<Appointment> existing = appointmentRepository.findByDateAndTime(date, time);
        boolean available = existing.isEmpty();
        return ResponseEntity.ok(Map.of("available", available));
    }

    // createAppointment(data): Boolean
    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Map<String, Object> body) {
        LocalDate date = LocalDate.parse((String) body.get("date"));
        LocalTime time = LocalTime.parse((String) body.get("time"));

        if (!appointmentRepository.findByDateAndTime(date, time).isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Khung gio nay da co lich hen khac"));
        }

        Appointment appointment = new Appointment();
        appointment.setCustomerId(Long.valueOf(body.get("customerId").toString()));
        appointment.setPetId(Long.valueOf(body.get("petId").toString()));
        appointment.setDate(date);
        appointment.setTime(time);
        appointment.setStatus("PENDING");

        List<?> serviceIdsRaw = (List<?>) body.get("serviceIds");
        List<Service> services = new ArrayList<>();
        if (serviceIdsRaw != null) {
            for (Object sid : serviceIdsRaw) {
                serviceRepository.findById(Long.valueOf(sid.toString())).ifPresent(services::add);
            }
        }
        appointment.setServices(services);

        Appointment saved = appointmentRepository.save(appointment);
        return ResponseEntity.ok(saved);
    }

    // updateAppointmentTime(id, newTime): Boolean
    @PatchMapping("/{id}/time")
    public ResponseEntity<?> updateAppointmentTime(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Appointment appointment = appointmentRepository.findById(id).orElse(null);
        if (appointment == null) return ResponseEntity.notFound().build();

        LocalDate newDate = LocalDate.parse(body.get("date"));
        LocalTime newTime = LocalTime.parse(body.get("time"));

        if (!appointmentRepository.findByDateAndTime(newDate, newTime).isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Khung gio moi da bi trung"));
        }

        appointment.setDate(newDate);
        appointment.setTime(newTime);
        appointmentRepository.save(appointment);
        return ResponseEntity.ok(appointment);
    }

    // rescheduleAppointment(id, newTime): Boolean -> alias goi lai updateAppointmentTime + doi status
    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<?> rescheduleAppointment(@PathVariable Long id, @RequestBody Map<String, String> body) {
        ResponseEntity<?> result = updateAppointmentTime(id, body);
        if (result.getStatusCode().is2xxSuccessful()) {
            Appointment appointment = appointmentRepository.findById(id).orElse(null);
            if (appointment != null) {
                appointment.setStatus("RESCHEDULED");
                appointmentRepository.save(appointment);
            }
        }
        return result;
    }

    // approveAppointment(id): Boolean
    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveAppointment(@PathVariable Long id) {
        Appointment appointment = appointmentRepository.findById(id).orElse(null);
        if (appointment == null) return ResponseEntity.notFound().build();
        appointment.setStatus("APPROVED");
        appointmentRepository.save(appointment);
        return ResponseEntity.ok(appointment);
    }

    // confirmAppointment(id): Boolean
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<?> confirmAppointment(@PathVariable Long id) {
        Appointment appointment = appointmentRepository.findById(id).orElse(null);
        if (appointment == null) return ResponseEntity.notFound().build();
        appointment.setStatus("CONFIRMED");
        appointmentRepository.save(appointment);
        return ResponseEntity.ok(appointment);
    }
}
