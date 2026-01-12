<?php
// api/auth/login.php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://yourdomain.com');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

require '../../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(['error' => 'Email and password required']);
    exit();
}

$stmt = $pdo->prepare("SELECT user_id, full_name, email, password_hash, role, verification_status FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    echo json_encode(['error' => 'Invalid email or password']);
    exit();
}

if ($user['verification_status'] !== 'verified') {
    echo json_encode(['error' => 'Account not verified yet. Please wait for admin approval.']);
    exit();
}

// Success: Create session
$_SESSION['user_id'] = $user['user_id'];
$_SESSION['full_name'] = $user['full_name'];
$_SESSION['email'] = $user['email'];
$_SESSION['role'] = $user['role'];

// Log login activity
$pdo->prepare("INSERT INTO activity_log (actor_id, activity_type, description) VALUES (?, 'login', 'User logged in')")
    ->execute([$user['user_id']]);

echo json_encode([
    'success' => true,
    'message' => 'Login successful!',
    'user' => [
        'user_id' => $user['user_id'],
        'full_name' => $user['full_name'],
        'email' => $user['email'],
        'role' => $user['role']
    ]
]);
?>