package com.library.dto.borrow;

import com.library.entity.BorrowRecord;

import java.time.LocalDate;

public record BorrowResponse(
        Long id,
        String bookTitle,
        String memberName,
        LocalDate borrowDate,
        LocalDate dueDate,
        LocalDate returnDate,
        double fineAmount,
        boolean finePaid,
        String status
) {
    public static BorrowResponse from(BorrowRecord r) {
        return new BorrowResponse(
                r.getId(),
                r.getBook().getTitle(),
                r.getMember().getFullName(),
                r.getBorrowDate(),
                r.getDueDate(),
                r.getReturnDate(),
                r.getFineAmount(),
                r.isFinePaid(),
                r.getStatus().name()
        );
    }
}
