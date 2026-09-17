package com.library.config;

import com.library.entity.Book;
import com.library.entity.Category;
import com.library.entity.Member;
import com.library.repository.BookRepository;
import com.library.repository.CategoryRepository;
import com.library.repository.MemberRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Convenience seeder so the app is usable immediately after first boot.
 * Default admin login: admin@library.com / admin123 (change in production).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(MemberRepository memberRepository, BookRepository bookRepository,
                       CategoryRepository categoryRepository, PasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.bookRepository = bookRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (memberRepository.count() == 0) {
            Member admin = new Member();
            admin.setFullName("Library Admin");
            admin.setEmail("admin@library.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole(Member.Role.ADMIN);
            memberRepository.save(admin);
        }

        if (bookRepository.count() == 0) {
            Category cs = categoryRepository.save(new Category(null, "Computer Science", new java.util.HashSet<>()));
            Category fiction = categoryRepository.save(new Category(null, "Fiction", new java.util.HashSet<>()));

            seedBook("Clean Code", "Robert C. Martin", "9780132350884", 3, Set.of(cs));
            seedBook("Designing Data-Intensive Applications", "Martin Kleppmann", "9781449373320", 2, Set.of(cs));
            seedBook("The Pragmatic Programmer", "Andrew Hunt", "9780201616224", 4, Set.of(cs));
            seedBook("1984", "George Orwell", "9780451524935", 5, Set.of(fiction));
        }
    }

    private void seedBook(String title, String author, String isbn, int copies, Set<Category> categories) {
        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setIsbn(isbn);
        book.setTotalCopies(copies);
        book.setAvailableCopies(copies);
        book.setCategories(categories);
        bookRepository.save(book);
    }
}
