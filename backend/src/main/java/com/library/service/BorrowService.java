package com.library.service;

import com.library.dto.borrow.BorrowResponse;
import com.library.entity.Book;
import com.library.entity.BorrowRecord;
import com.library.entity.Member;
import com.library.exception.ApiExceptions.BadRequestException;
import com.library.exception.ApiExceptions.ConflictException;
import com.library.exception.ApiExceptions.NotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BorrowService {

    private static final int LOAN_PERIOD_DAYS = 14;
    private static final double FINE_PER_DAY = 5.0;
    private static final int MAX_ACTIVE_BORROWS = 3;

    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    public BorrowService(BookRepository bookRepository,
                          MemberRepository memberRepository,
                          BorrowRecordRepository borrowRecordRepository) {
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
        this.borrowRecordRepository = borrowRecordRepository;
    }

    /**
     * Borrowing is the one operation in this app where two requests can race:
     * two members hitting "borrow" on the last available copy at the same
     * moment. Book.availableCopies is guarded by a @Version column, so
     * Hibernate checks the row version when this transaction commits. If
     * another transaction already decremented it, this one fails with
     * ObjectOptimisticLockingFailureException instead of silently overselling
     * the copy — the global exception handler turns that into a 409 the
     * frontend can show as "just borrowed by someone else, please retry".
     */
    @Transactional
    public BorrowResponse borrowBook(Long memberId, Long bookId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("Member not found"));

        if (member.getStatus() == Member.MembershipStatus.SUSPENDED) {
            throw new BadRequestException("Membership is suspended due to unpaid fines");
        }

        long activeBorrows = borrowRecordRepository.findByMemberIdOrderByBorrowDateDesc(memberId)
                .stream().filter(r -> r.getStatus() == BorrowRecord.Status.ACTIVE).count();
        if (activeBorrows >= MAX_ACTIVE_BORROWS) {
            throw new BadRequestException("Borrow limit reached (" + MAX_ACTIVE_BORROWS + " active books)");
        }

        Book book = bookRepository.findByIdForBorrow(bookId)
                .orElseThrow(() -> new NotFoundException("Book not found"));

        if (!book.hasAvailableCopy()) {
            throw new ConflictException("No copies of \"" + book.getTitle() + "\" are available right now");
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book); // version check happens here at flush/commit

        BorrowRecord record = new BorrowRecord();
        record.setBook(book);
        record.setMember(member);
        record.setBorrowDate(LocalDate.now());
        record.setDueDate(LocalDate.now().plusDays(LOAN_PERIOD_DAYS));
        record.setStatus(BorrowRecord.Status.ACTIVE);

        return BorrowResponse.from(borrowRecordRepository.save(record));
    }

    @Transactional
    public BorrowResponse returnBook(Long borrowRecordId) {
        BorrowRecord record = borrowRecordRepository.findById(borrowRecordId)
                .orElseThrow(() -> new NotFoundException("Borrow record not found"));

        if (record.getStatus() == BorrowRecord.Status.RETURNED) {
            throw new BadRequestException("This book has already been returned");
        }

        LocalDate today = LocalDate.now();
        record.setReturnDate(today);
        record.setStatus(BorrowRecord.Status.RETURNED);

        if (today.isAfter(record.getDueDate())) {
            long daysLate = ChronoUnit.DAYS.between(record.getDueDate(), today);
            double fine = daysLate * FINE_PER_DAY;
            record.setFineAmount(fine);

            Member member = record.getMember();
            member.setOutstandingFine(member.getOutstandingFine() + fine);
            memberRepository.save(member);
        }

        Book book = record.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        return BorrowResponse.from(borrowRecordRepository.save(record));
    }

    // Same reasoning as BookService: BorrowRecord.book and BorrowRecord.member
    // are @ManyToOne(LAZY). BorrowResponse.from(...) reads both, so this needs
    // an open session across the read + the mapping, not just across the
    // repository call.
    @Transactional(readOnly = true)
    public List<BorrowResponse> myBorrows(Long memberId) {
        return borrowRecordRepository.findByMemberIdOrderByBorrowDateDesc(memberId)
                .stream().map(BorrowResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BorrowResponse> allActive() {
        return borrowRecordRepository.findByStatus(BorrowRecord.Status.ACTIVE)
                .stream().map(BorrowResponse::from).toList();
    }
}
