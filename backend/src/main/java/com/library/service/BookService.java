package com.library.service;

import com.library.dto.book.BookRequest;
import com.library.dto.book.BookResponse;
import com.library.entity.Book;
import com.library.entity.Category;
import com.library.exception.ApiExceptions.BadRequestException;
import com.library.exception.ApiExceptions.NotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    public BookService(BookRepository bookRepository, CategoryRepository categoryRepository) {
        this.bookRepository = bookRepository;
        this.categoryRepository = categoryRepository;
    }

    // readOnly=true keeps the Hibernate session open through the
    // BookResponse.from(...) mapping below, which touches book.getCategories() —
    // a @ManyToMany(LAZY) collection. Without this, listAll()/search()/getById()
    // would throw LazyInitializationException as soon as the categories are read,
    // because the plain repository call's own transaction (Spring Data's default,
    // scoped to just that one call) would already have closed the session.
    @Transactional(readOnly = true)
    public List<BookResponse> listAll() {
        return bookRepository.findAll().stream().map(BookResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BookResponse> search(String query) {
        return bookRepository
                .findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(query, query)
                .stream().map(BookResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public BookResponse getById(Long id) {
        return BookResponse.from(findBookOrThrow(id));
    }

    public BookResponse create(BookRequest request) {
        if (bookRepository.findByIsbn(request.isbn()).isPresent()) {
            throw new BadRequestException("A book with this ISBN already exists");
        }

        Book book = new Book();
        book.setTitle(request.title());
        book.setAuthor(request.author());
        book.setIsbn(request.isbn());
        book.setTotalCopies(request.totalCopies());
        book.setAvailableCopies(request.totalCopies());
        book.setCategories(resolveCategories(request.categories()));

        return BookResponse.from(bookRepository.save(book));
    }

    public BookResponse update(Long id, BookRequest request) {
        Book book = findBookOrThrow(id);

        int borrowedCopies = book.getTotalCopies() - book.getAvailableCopies();
        if (request.totalCopies() < borrowedCopies) {
            throw new BadRequestException(
                "Cannot reduce total copies below the " + borrowedCopies + " currently borrowed");
        }

        int delta = request.totalCopies() - book.getTotalCopies();
        book.setTitle(request.title());
        book.setAuthor(request.author());
        book.setIsbn(request.isbn());
        book.setTotalCopies(request.totalCopies());
        book.setAvailableCopies(book.getAvailableCopies() + delta);
        book.setCategories(resolveCategories(request.categories()));

        return BookResponse.from(bookRepository.save(book));
    }

    public void delete(Long id) {
        Book book = findBookOrThrow(id);
        bookRepository.delete(book);
    }

    private Set<Category> resolveCategories(Set<String> names) {
        Set<Category> categories = new HashSet<>();
        if (names == null) return categories;
        for (String name : names) {
            Category category = categoryRepository.findByName(name)
                    .orElseGet(() -> categoryRepository.save(new Category(null, name, new HashSet<>())));
            categories.add(category);
        }
        return categories;
    }

    private Book findBookOrThrow(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Book not found: " + id));
    }
}
