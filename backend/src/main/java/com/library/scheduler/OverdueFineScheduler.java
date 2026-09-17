package com.library.scheduler;

import com.library.entity.BorrowRecord;
import com.library.repository.BorrowRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Runs once a day. Any ACTIVE borrow past its due date is flagged OVERDUE
 * and its running fine is recalculated (not yet charged — the fine is only
 * finalized on return — this just keeps the member-facing "current fine"
 * figure accurate while the book is still out).
 */
@Component
public class OverdueFineScheduler {

    private static final Logger log = LoggerFactory.getLogger(OverdueFineScheduler.class);
    private static final double FINE_PER_DAY = 5.0;

    private final BorrowRecordRepository borrowRecordRepository;

    public OverdueFineScheduler(BorrowRecordRepository borrowRecordRepository) {
        this.borrowRecordRepository = borrowRecordRepository;
    }

    // Runs every day at 1 AM server time.
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void flagOverdueAndAccrueFines() {
        LocalDate today = LocalDate.now();
        var overdue = borrowRecordRepository.findOverdueAsOf(today);

        for (BorrowRecord record : overdue) {
            record.setStatus(BorrowRecord.Status.OVERDUE);
            long daysLate = ChronoUnit.DAYS.between(record.getDueDate(), today);
            record.setFineAmount(daysLate * FINE_PER_DAY);
        }

        borrowRecordRepository.saveAll(overdue);
        log.info("Overdue sweep complete: {} record(s) flagged/updated", overdue.size());
    }
}
