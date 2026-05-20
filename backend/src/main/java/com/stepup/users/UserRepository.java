package com.stepup.users;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    Optional<User> findByIdAndDeletedAtIsNull(UUID id);

    boolean existsByEmailAndDeletedAtIsNull(String email);

    /** Busca cualquier usuario con rol SUPER_ADMIN, incluyendo eliminados (para evitar duplicados en seed). */
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.role = :role")
    boolean existsByRoleIncludingDeleted(@Param("role") Role role);

    /** Listado para SUPER_ADMIN: ve todos los usuarios no eliminados. */
    Page<User> findAllByDeletedAtIsNull(Pageable pageable);

    /** Listado para OWNER: ve todos excepto SUPER_ADMIN. */
    @Query("""
            SELECT u FROM User u
            WHERE u.deletedAt IS NULL
            AND u.role <> :excludedRole
            """)
    Page<User> findAllByDeletedAtIsNullAndRoleNot(
            @Param("excludedRole") Role excludedRole, Pageable pageable);

    @Modifying
    @Query("UPDATE User u SET u.lastLoginAt = CURRENT_TIMESTAMP WHERE u.id = :id")
    void updateLastLoginAt(@Param("id") UUID id);

    // --- Dashboard metrics ---

    long countByDeletedAtIsNull();

    long countByStatusAndDeletedAtIsNull(UserStatus status);

    long countByRoleAndDeletedAtIsNull(Role role);
}
