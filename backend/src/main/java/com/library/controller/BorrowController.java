package com.library.controller;

import com.library.dto.borrow.BorrowResponse;
import com.library.security.CurrentUserResolver;
import com.library.service.BorrowService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrow")
@Tag(name = "Borrow", description = "Borrow and return books")
public class BorrowController {

    private final BorrowService borrowService;
    private final CurrentUserResolver currentUserResolver;

    public BorrowController(BorrowService borrowService, CurrentUserResolver currentUserResolver) {
        this.borrowService = borrowService;
        this.currentUserResolver = currentUserResolver;
    }

    @PostMapping("/{bookId}")
    public ResponseEntity<BorrowResponse> borrow(@PathVariable Long bookId) {
        Long memberId = currentUserResolver.currentMember().getId();
        return ResponseEntity.ok(borrowService.borrowBook(memberId, bookId));
    }

    @PostMapping("/return/{borrowRecordId}")
    public ResponseEntity<BorrowResponse> returnBook(@PathVariable Long borrowRecordId) {
        return ResponseEntity.ok(borrowService.returnBook(borrowRecordId));
    }

    @GetMapping("/mine")
    public List<BorrowResponse> mine() {
        Long memberId = currentUserResolver.currentMember().getId();
        return borrowService.myBorrows(memberId);
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public List<BorrowResponse> allActive() {
        return borrowService.allActive();
    }
}
