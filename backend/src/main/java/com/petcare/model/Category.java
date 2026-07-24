package com.petcare.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    @Column(nullable = false, unique = true)
    private String name;

    @ManyToMany(mappedBy = "categories")
    @JsonIgnore          // chan vong lap khi tra JSON qua API
    @ToString.Exclude    // chan vong lap khi Lombok sinh toString()
    @EqualsAndHashCode.Exclude // chan vong lap khi Lombok sinh equals()/hashCode()
    private Set<Product> products = new HashSet<>();
}
