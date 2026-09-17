package com.library.repository;

import com.library.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByIsbn(String isbn);

    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author);

    // Explicit optimistic lock read for the borrow flow — combined with the
    // @Version field on Book, this makes Hibernate check the row version at
    // commit time and throw OptimisticLockException on a concurrent update.
    @Lock(LockModeType.OPTIMISTIC)
    @Query("select b from Book b where b.id = :id")
    Optional<Book> findByIdForBorrow(@Param("id") Long id);
}
