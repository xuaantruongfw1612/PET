package com.petcare.controller;

import com.petcare.model.Appointment;
import com.petcare.model.AppointmentService;
import com.petcare.model.Pet;
import com.petcare.model.Service;
import com.petcare.repository.AppointmentRepository;
import com.petcare.repository.PetRepository;
import com.petcare.repository.ServiceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

// Dung voi class AppointmentController trong diagram
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final PetRepository petRepository;
    private final ServiceRepository serviceRepository;

    public AppointmentController(AppointmentRepository appointmentRepository,
                                  PetRepository petRepository,
                                  ServiceRepository serviceRepository) {
        this.appointmentRepository = appointmentRepository;
        this.petRepository = petRepository;
        this.serviceRepository = serviceRepository;
    }

    @GetMapping
    public List<Appointment> getAppointmentList() {
        return appointmentRepository.findAll();
    }

    // Lay lich hen theo customer -> phai di qua Pet (Appointment khong con luu customerId truc tiep)
    @GetMapping("/customer/{customerId}")
    public List<Appointment> getByCustomer(@PathVariable Long customerId) {
        return appointmentRepository.findByPet_CustomerId(customerId);
    }

    @GetMapping("/check-availability")
    public ResponseEntity<?> checkAvailability(
            @RequestParam LocalDate date,
            @RequestParam LocalTime time) {
        List<Appointment> existing = appointmentRepository.findByDateAndTime(date, time);
        boolean available = existing.isEmpty();
        return ResponseEntity.ok(Map.of("available", available));
    }

    // Body: { "petId": ..., "date": "...", "time": "...", "serviceIds": [1, 2] }
    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Map<String, Object> body) {
        LocalDate date = LocalDate.parse((String) body.get("date"));
        LocalTime time = LocalTime.parse((String) body.get("time"));

        if (!appointmentRepository.findByDateAndTime(date, time).isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Khung gio nay da co lich hen khac"));
        }

        Pet pet = petRepository.findById(Long.valueOf(body.get("petId").toString()))
                .orElseThrow(() -> new RuntimeException("Pet khong ton tai"));

        Appointment appointment = new Appointment();
        appointment.setPet(pet);
        appointment.setDate(date);
        appointment.setTime(time);
        appointment.setStatus("PENDING");

        // Them dich vu qua bang trung gian AppointmentService (co luu unitPrice snapshot)
        List<?> serviceIdsRaw = (List<?>) body.get("serviceIds");
        if (serviceIdsRaw != null) {
            for (Object sid : serviceIdsRaw) {
                Service service = serviceRepository.findById(Long.valueOf(sid.toString()))
                        .orElseThrow(() -> new RuntimeException("Service khong ton tai: id=" + sid));
                AppointmentService aps = new AppointmentService(appointment, service, 1);
                appointment.getAppointmentServices().add(aps);
            }
        }

        Appointment saved = appointmentRepository.save(appointment);
        return ResponseEntity.ok(saved);
    }

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

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveAppointment(@PathVariable Long id) {
        Appointment appointment = appointmentRepository.findById(id).orElse(null);
        if (appointment == null) return ResponseEntity.notFound().build();
        appointment.setStatus("CONFIRMED");
        appointmentRepository.save(appointment);
        return ResponseEntity.ok(appointment);
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<?> confirmAppointment(@PathVariable Long id) {
        Appointment appointment = appointmentRepository.findById(id).orElse(null);
        if (appointment == null) return ResponseEntity.notFound().build();
        appointment.setStatus("COMPLETED");
        appointmentRepository.save(appointment);
        return ResponseEntity.ok(appointment);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        Appointment appointment = appointmentRepository.findById(id).orElse(null);
        if (appointment == null) return ResponseEntity.notFound().build();
        if (body != null && body.get("status") != null) {
            appointment.setStatus(body.get("status").toUpperCase());
            appointmentRepository.save(appointment);
        }
        return ResponseEntity.ok(appointment);
    }
}
