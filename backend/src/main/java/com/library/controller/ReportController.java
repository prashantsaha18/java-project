package com.library.controller;

import com.library.dto.report.BookPopularityRow;
import com.library.dto.report.CategoryTrendRow;
import com.library.dto.report.MonthlyFineRow;
import com.library.dto.report.OverdueRow;
import com.library.service.ReportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Reports", description = "Admin analytics and exports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/most-borrowed")
    public List<BookPopularityRow> mostBorrowed() {
        return reportService.mostBorrowedBooks();
    }

    @GetMapping("/overdue")
    public List<OverdueRow> overdue() {
        return reportService.overdueMembers();
    }

    @GetMapping("/monthly-fines")
    public List<MonthlyFineRow> monthlyFines() {
        return reportService.monthlyFineCollection();
    }

    @GetMapping("/category-trends")
    public List<CategoryTrendRow> categoryTrends() {
        return reportService.categoryWiseTrends();
    }

    @GetMapping("/overdue/export")
    public ResponseEntity<String> exportOverdueCsv() {
        return csvResponse("overdue-members.csv", reportService.overdueMembersCsv());
    }

    @GetMapping("/most-borrowed/export")
    public ResponseEntity<String> exportMostBorrowedCsv() {
        return csvResponse("most-borrowed-books.csv", reportService.mostBorrowedBooksCsv());
    }

    private ResponseEntity<String> csvResponse(String filename, String csv) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
