package com.mediflow.backend.repository;

import com.mediflow.backend.entity.Leave;
import com.mediflow.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRepository extends JpaRepository<Leave, Long> {

    List<Leave> findByDoctor(User doctor);

    List<Leave> findByStatus(String status);

}