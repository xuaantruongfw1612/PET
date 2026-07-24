package com.petcare.repository;

import com.petcare.model.Cart;
import com.petcare.model.CartItem;
import com.petcare.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
}
