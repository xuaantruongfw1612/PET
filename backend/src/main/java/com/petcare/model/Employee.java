package com.petcare.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "employees")
@PrimaryKeyJoinColumn(name = "employee_id")
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class Employee extends User {
    // permissions luu dang chuoi phan cach boi dau phay, vi du: "MANAGE_ORDER,MANAGE_PRODUCT"
    private String permissions;

    // Khop voi 3 role ben frontend: ADMIN / CONSULTANT / SALES (luu HOA, tra ve FE se lowercase lai)
    private String role = "CONSULTANT";
}
