<?php
session_start();
require_once 'db_conn.php';

header('Content-Type: application/json');

try {
    // Get filter parameters
    $category = $_GET['category'] ?? 'all';
    $search = $_GET['search'] ?? '';

    // Build the SQL query
    $sql = "SELECT 
                lr.loan_id,
                lr.category,
                lr.custom_category,
                lr.amount,
                lr.duration_months,
                lr.custom_duration,
                lr.repayment_option,
                lr.reason,
                lr.interest_rate,
                lr.created_at,
                u.full_name,
                u.email,
                COUNT(DISTINCT lo.offer_id) as response_count,
                COUNT(DISTINCT CASE WHEN lo.status = 'accepted' THEN lo.offer_id END) as accepted_count,
                GROUP_CONCAT(DISTINCT ld.doc_type SEPARATOR ', ') as documents
            FROM loan_requests lr
            INNER JOIN users u ON lr.borrower_id = u.user_id
            LEFT JOIN loan_offers lo ON lr.loan_id = lo.loan_id
            LEFT JOIN loan_documents ld ON lr.loan_id = ld.loan_id
            WHERE lr.status = 'approved'";

    $params = [];

    // Add category filter
    if ($category !== 'all') {
        $sql .= " AND (lr.category = :category OR lr.custom_category = :category)";
        $params[':category'] = $category;
    }

    // Add search filter
    if (!empty($search)) {
        $sql .= " AND (lr.reason LIKE :search OR lr.category LIKE :search OR lr.custom_category LIKE :search OR u.full_name LIKE :search)";
        $params[':search'] = '%' . $search . '%';
    }

    $sql .= " GROUP BY lr.loan_id
              ORDER BY lr.created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $loans = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Debug: Log the SQL query
    error_log("SQL Query: " . $sql);
    error_log("Params: " . print_r($params, true));
    error_log("Found loans: " . count($loans));

    echo json_encode([
        'success' => true,
        'loans' => $loans,
        'count' => count($loans),
        'debug_sql' => $sql,
        'debug_params' => $params
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
