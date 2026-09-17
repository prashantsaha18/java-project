package com.library.repository;

import com.library.dto.report.BookPopularityRow;
import com.library.dto.report.CategoryTrendRow;
import com.library.dto.report.MonthlyFineRow;
import com.library.entity.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    List<BorrowRecord> findByMemberIdOrderByBorrowDateDesc(Long memberId);

    List<BorrowRecord> findByStatus(BorrowRecord.Status status);

    @Query("select r from BorrowRecord r where r.status = 'ACTIVE' and r.dueDate < :today")
    List<BorrowRecord> findOverdueAsOf(@Param("today") LocalDate today);

    @Query("""
        select new com.library.dto.report.BookPopularityRow(b.title, b.author, count(r.id))
        from BorrowRecord r join r.book b
        group by b.id, b.title, b.author
        order by count(r.id) desc
        """)
    List<BookPopularityRow> mostBorrowedBooks();

    @Query("""
        select new com.library.dto.report.MonthlyFineRow(
            function('to_char', r.returnDate, 'YYYY-MM'), sum(r.fineAmount))
        from BorrowRecord r
        where r.fineAmount > 0 and r.returnDate is not null
        group by function('to_char', r.returnDate, 'YYYY-MM')
        order by function('to_char', r.returnDate, 'YYYY-MM')
        """)
    List<MonthlyFineRow> monthlyFineCollection();

    @Query("""
        select new com.library.dto.report.CategoryTrendRow(c.name, count(r.id))
        from BorrowRecord r
        join r.book b
        join b.categories c
        group by c.name
        order by count(r.id) desc
        """)
    List<CategoryTrendRow> categoryWiseBorrowingTrends();
}
