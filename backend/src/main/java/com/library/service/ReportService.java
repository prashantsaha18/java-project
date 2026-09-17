package com.library.service;

import com.library.dto.report.BookPopularityRow;
import com.library.dto.report.CategoryTrendRow;
import com.library.dto.report.MonthlyFineRow;
import com.library.dto.report.OverdueRow;
import com.library.entity.BorrowRecord;
import com.library.repository.BorrowRecordRepository;
import com.opencsv.CSVWriter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.StringWriter;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReportService {

    private final BorrowRecordRepository borrowRecordRepository;

    public ReportService(BorrowRecordRepository borrowRecordRepository) {
        this.borrowRecordRepository = borrowRecordRepository;
    }

    public List<BookPopularityRow> mostBorrowedBooks() {
        return borrowRecordRepository.mostBorrowedBooks();
    }

    public List<MonthlyFineRow> monthlyFineCollection() {
        return borrowRecordRepository.monthlyFineCollection();
    }

    public List<CategoryTrendRow> categoryWiseTrends() {
        return borrowRecordRepository.categoryWiseBorrowingTrends();
    }

    // findOverdueAsOf returns BorrowRecord entities; r.getMember()/r.getBook()
    // below are @ManyToOne(LAZY), so this needs an open session across the
    // read + mapping — same reasoning as BookService/BorrowService.
    @Transactional(readOnly = true)
    public List<OverdueRow> overdueMembers() {
        LocalDate today = LocalDate.now();
        return borrowRecordRepository.findOverdueAsOf(today).stream()
                .map(r -> new OverdueRow(
                        r.getMember().getFullName(),
                        r.getMember().getEmail(),
                        r.getBook().getTitle(),
                        r.getDueDate(),
                        ChronoUnit.DAYS.between(r.getDueDate(), today),
                        r.getFineAmount()
                ))
                .toList();
    }

    /** Generic CSV export used by every report endpoint's /export variant. */
    public String toCsv(String[] headers, List<String[]> rows) {
        StringWriter sw = new StringWriter();
        try (CSVWriter writer = new CSVWriter(sw)) {
            writer.writeNext(headers);
            for (String[] row : rows) {
                writer.writeNext(row);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV", e);
        }
        return sw.toString();
    }

    // Also annotated directly: overdueMembers() is called as a plain
    // self-invocation from here (this.overdueMembers()), which bypasses
    // Spring's transactional proxy entirely — its @Transactional would be
    // silently ignored on that call path without this.
    @Transactional(readOnly = true)
    public String overdueMembersCsv() {
        List<String[]> rows = overdueMembers().stream()
                .map(r -> new String[]{
                        r.memberName(), r.memberEmail(), r.bookTitle(),
                        r.dueDate().toString(), String.valueOf(r.daysOverdue()),
                        String.valueOf(r.fineAmount())
                }).toList();
        return toCsv(new String[]{"Member", "Email", "Book", "Due Date", "Days Overdue", "Fine"}, rows);
    }

    public String mostBorrowedBooksCsv() {
        List<String[]> rows = mostBorrowedBooks().stream()
                .map(r -> new String[]{r.title(), r.author(), String.valueOf(r.timesBorrowed())})
                .toList();
        return toCsv(new String[]{"Title", "Author", "Times Borrowed"}, rows);
    }
}
