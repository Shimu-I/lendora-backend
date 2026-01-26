<?php
session_start();
include '../php/db_conn.php';

// Check if admin is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

// Handle DELETE request
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents("php://input"), $_DELETE);
    $loan_id = $_DELETE['loan_id'] ?? 0;

    if (empty($loan_id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing loan ID']);
        exit();
    }

    try {
        $conn->beginTransaction();

        // Delete loan request (CASCADE will handle documents and offers)
        $sql = "DELETE FROM loan_requests WHERE loan_id = :loan_id";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':loan_id' => $loan_id]);

        $conn->commit();

        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Loan request deleted successfully'
        ]);
    } catch (PDOException $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    exit();
}

// Handle PUT request for status toggle
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    parse_str(file_get_contents("php://input"), $_PUT);
    $loan_id = $_PUT['loan_id'] ?? 0;
    $new_status = $_PUT['status'] ?? '';

    if (empty($loan_id) || empty($new_status)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing parameters']);
        exit();
    }

    try {
        $sql = "UPDATE loan_requests 
                SET status = :status, 
                    approved_by = :admin_id, 
                    approval_date = NOW() 
                WHERE loan_id = :loan_id";

        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':status' => $new_status,
            ':admin_id' => $_SESSION['user_id'],
            ':loan_id' => $loan_id
        ]);

        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Status updated successfully'
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    exit();
}

try {
    // Fetch all loan requests with borrower information
    $sql = "SELECT 
                lr.loan_id,
                lr.borrower_id,
                lr.category,
                lr.custom_category,
                lr.amount,
                lr.duration_months,
                lr.custom_duration,
                lr.repayment_option,
                lr.reason,
                lr.status,
                lr.created_at,
                u.username,
                u.full_name,
                u.email,
                u.phone,
                u.verification_status,
                COUNT(DISTINCT ld.doc_id) as document_count
            FROM loan_requests lr
            JOIN users u ON lr.borrower_id = u.user_id
            LEFT JOIN loan_documents ld ON lr.loan_id = ld.loan_id
            GROUP BY lr.loan_id
            ORDER BY 
                CASE 
                    WHEN lr.status = 'pending' THEN 1
                    WHEN lr.status = 'approved' THEN 2
                    ELSE 3
                END,
                lr.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $loans = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'loans' => $loans,
        'count' => count($loans)
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
