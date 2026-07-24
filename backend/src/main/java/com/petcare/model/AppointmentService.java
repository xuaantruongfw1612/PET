package com.petcare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

@Entity
@Table(
    name = "appointment_services",
    uniqueConstraints = @UniqueConstraint(columnNames = {"appointment_id", "service_id"})
)
@Data
@NoArgsConstructor
public class AppointmentService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appointmentServiceId;

    @ManyToOne
    @JoinColumn(name = "appointment_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Appointment appointment;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @Min(value = 1, message = "So luong phai lon hon 0")
    @Column(nullable = false)
    private Integer quantity = 1;

    // Snapshot gia dich vu tai thoi diem dat lich,
    // tranh sai lech neu Service.price bi thay doi sau do
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    public AppointmentService(Appointment appointment, Service service, Integer quantity) {
        this.appointment = appointment;
        this.service = service;
        this.quantity = quantity;
        this.unitPrice = BigDecimal.valueOf(service.getPrice());
    }

    @Transient
    public BigDecimal getSubtotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}
