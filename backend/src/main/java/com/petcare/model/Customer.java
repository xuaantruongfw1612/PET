package com.petcare.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customers")
@PrimaryKeyJoinColumn(name = "customer_id")
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class Customer extends User {
    private String address;
    private String phoneNumber;
}
