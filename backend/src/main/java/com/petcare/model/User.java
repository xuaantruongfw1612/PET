package com.petcare.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

// Dung JOINED inheritance: Employee/Customer se co bang rieng, FK ve users.id
@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password; // demo: luu plaintext hoac hash don gian, khong dung cho production

    private String email;

    // ACTIVE / INACTIVE / BANNED ...
    private String status = "ACTIVE";

    // login(), logout(), updateProfile() -> xu ly o AuthController, khong can method trong Entity
}
