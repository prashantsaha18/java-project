package com.library.security;

import com.library.entity.Member;
import com.library.exception.ApiExceptions.NotFoundException;
import com.library.repository.MemberRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserResolver {

    private final MemberRepository memberRepository;

    public CurrentUserResolver(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    public Member currentMember() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Authenticated member not found"));
    }
}
