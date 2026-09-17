package com.library.service;

import com.library.dto.auth.AuthResponse;
import com.library.dto.auth.LoginRequest;
import com.library.dto.auth.RegisterRequest;
import com.library.entity.Member;
import com.library.exception.ApiExceptions.BadRequestException;
import com.library.repository.MemberRepository;
import com.library.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(MemberRepository memberRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        if (memberRepository.existsByEmail(request.email())) {
            throw new BadRequestException("An account with this email already exists");
        }

        Member member = new Member();
        member.setFullName(request.fullName());
        member.setEmail(request.email());
        member.setPasswordHash(passwordEncoder.encode(request.password()));
        member.setRole(Member.Role.STUDENT);

        memberRepository.save(member);

        String token = jwtUtil.generateToken(member.getEmail(), member.getRole().name());
        return new AuthResponse(token, member.getFullName(), member.getEmail(), member.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        Member member = memberRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), member.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(member.getEmail(), member.getRole().name());
        return new AuthResponse(token, member.getFullName(), member.getEmail(), member.getRole().name());
    }
}
