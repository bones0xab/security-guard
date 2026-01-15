package org.example.orderservice.service;


import lombok.extern.slf4j.Slf4j;
import org.example.orderservice.entities.Refund;
import org.example.orderservice.repo.RefundRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@Transactional
public class RefundService {

    private final RefundRepository refundRepository;

    public RefundService(RefundRepository refundRepository) {
        this.refundRepository = refundRepository;
    }

    public Refund createRefund(Refund refund) {
        log.info("Saving refund for order ID: {}", refund.getOrderId());
        return refundRepository.save(refund);
    }


    public List<Refund> getAll() {
        return refundRepository.findAll();
    }




}
