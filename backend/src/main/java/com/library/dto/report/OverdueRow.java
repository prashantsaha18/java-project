package com.library.dto.report;

import java.time.LocalDate;

public record OverdueRow(
        String memberName,
        String memberEmail,
        String bookTitle,
        LocalDate dueDate,
        long daysOverdue,
        double fineAmount
) {
}
