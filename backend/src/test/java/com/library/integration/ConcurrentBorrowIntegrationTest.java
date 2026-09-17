package com.library.integration;

import com.library.entity.Book;
import com.library.entity.Member;
import com.library.repository.BookRepository;
import com.library.repository.MemberRepository;
import com.library.service.BorrowService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * This is the test that actually proves the @Version optimistic-locking
 * strategy on Book works: it spins up a real Postgres container, fires two
 * concurrent borrow requests at the single remaining copy of a book, and
 * asserts that exactly one succeeds. Without the @Version field, both
 * requests can read availableCopies=1, both decrement, and the book ends
 * up "borrowed" by two people with availableCopies=0 — a silent oversell.
 */
@Testcontainers
@SpringBootTest
class ConcurrentBorrowIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired private BorrowService borrowService;
    @Autowired private BookRepository bookRepository;
    @Autowired private MemberRepository memberRepository;

    private Long bookId;
    private Long memberAId;
    private Long memberBId;

    @BeforeEach
    void setUp() {
        Book book = new Book();
        book.setTitle("The Last Copy");
        book.setAuthor("Someone");
        book.setIsbn("TEST-" + System.nanoTime());
        book.setTotalCopies(1);
        book.setAvailableCopies(1);
        bookId = bookRepository.save(book).getId();

        memberAId = createMember("a@test.com");
        memberBId = createMember("b@test.com");
    }

    private Long createMember(String email) {
        Member m = new Member();
        m.setFullName("Test User");
        m.setEmail(email);
        m.setPasswordHash("irrelevant");
        return memberRepository.save(m).getId();
    }

    @Test
    void onlyOneOfTwoConcurrentBorrowsSucceeds_forTheLastCopy() throws InterruptedException {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch go = new CountDownLatch(1);
        AtomicInteger successes = new AtomicInteger(0);
        AtomicInteger conflicts = new AtomicInteger(0);

        List<Long> members = List.of(memberAId, memberBId);
        for (Long memberId : members) {
            pool.submit(() -> {
                ready.countDown();
                try {
                    go.await();
                    borrowService.borrowBook(memberId, bookId);
                    successes.incrementAndGet();
                } catch (Exception e) {
                    conflicts.incrementAndGet();
                } catch (Throwable t) {
                    conflicts.incrementAndGet();
                }
            });
        }

        ready.await();
        go.countDown();
        pool.shutdown();
        pool.awaitTermination(10, java.util.concurrent.TimeUnit.SECONDS);

        assertThat(successes.get()).isEqualTo(1);
        assertThat(conflicts.get()).isEqualTo(1);
        assertThat(bookRepository.findById(bookId).orElseThrow().getAvailableCopies()).isEqualTo(0);
    }
}
