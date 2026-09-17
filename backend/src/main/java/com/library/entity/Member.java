package com.library.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String fullName;

    @Email
    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @NotBlank
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role = Role.STUDENT;

    @Enumerated(EnumType.STRING)
    private MembershipStatus status = MembershipStatus.ACTIVE;

    private double outstandingFine = 0.0;

    public enum Role { STUDENT, FACULTY, ADMIN }
    public enum MembershipStatus { ACTIVE, SUSPENDED }
}
