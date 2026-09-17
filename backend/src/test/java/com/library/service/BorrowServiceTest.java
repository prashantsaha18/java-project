package com.library.service;

import com.library.dto.borrow.BorrowResponse;
import com.library.entity.Book;
import com.library.entity.Member;
import com.library.exception.ApiExceptions.BadRequestException;
import com.library.exception.ApiExceptions.ConflictException;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BorrowServiceTest {

    @Mock private BookRepository bookRepository;
    @Mock private MemberRepository memberRepository;
    @Mock private BorrowRecordRepository borrowRecordRepository;

    @InjectMocks
    private BorrowService borrowService;

    private Member member;
    private Book book;

    @BeforeEach
    void setUp() {
        member = new Member();
        member.setId(1L);
        member.setFullName("Test Student");
        member.setEmail("student@test.com");
        member.setStatus(Member.MembershipStatus.ACTIVE);

        book = new Book();
        book.setId(10L);
        book.setTitle("Clean Code");
        book.setAuthor("Robert C. Martin");
        book.setTotalCopies(2);
        book.setAvailableCopies(1);
    }

    @Test
    void borrowBook_decrementsAvailableCopies_whenCopyIsAvailable() {
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(borrowRecordRepository.findByMemberIdOrderByBorrowDateDesc(1L)).thenReturn(List.of());
        when(bookRepository.findByIdForBorrow(10L)).thenReturn(Optional.of(book));
        when(bookRepository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));
        when(borrowRecordRepository.save(any())).thenAnswer(inv -> {
            var record = inv.getArgument(0, com.library.entity.BorrowRecord.class);
            record.setId(100L);
            return record;
        });

        BorrowResponse response = borrowService.borrowBook(1L, 10L);

        assertThat(response.bookTitle()).isEqualTo("Clean Code");
        assertThat(book.getAvailableCopies()).isEqualTo(0);
    }

    @Test
    void borrowBook_throwsConflict_whenNoCopiesAvailable() {
        book.setAvailableCopies(0);
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(borrowRecordRepository.findByMemberIdOrderByBorrowDateDesc(1L)).thenReturn(List.of());
        when(bookRepository.findByIdForBorrow(10L)).thenReturn(Optional.of(book));

        assertThatThrownBy(() -> borrowService.borrowBook(1L, 10L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("No copies");
    }

    @Test
    void borrowBook_throwsBadRequest_whenMemberIsSuspended() {
        member.setStatus(Member.MembershipStatus.SUSPENDED);
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        assertThatThrownBy(() -> borrowService.borrowBook(1L, 10L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("suspended");
    }

    @Test
    void borrowBook_throwsBadRequest_whenBorrowLimitReached() {
        var activeRecord = new com.library.entity.BorrowRecord();
        activeRecord.setStatus(com.library.entity.BorrowRecord.Status.ACTIVE);

        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));
        when(borrowRecordRepository.findByMemberIdOrderByBorrowDateDesc(1L))
                .thenReturn(List.of(activeRecord, activeRecord, activeRecord));

        assertThatThrownBy(() -> borrowService.borrowBook(1L, 10L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Borrow limit");
    }
}
