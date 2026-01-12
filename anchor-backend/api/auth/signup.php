<?php
// api/auth/signup.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://yourdomain.com'); // Or * for testing
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

require '../../config/db.php';

$data = json_decode(file_get_contents('php://input'), true);

$full_name = trim($data['full_name'] ?? '');
$email     = trim($data['email'] ?? '');
$password  = $data['password'] ?? '';

if (!$full_name || !$email || !$password) {
    echo json_encode(['error' => 'All fields are required']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['error' => 'Invalid email format']);
    exit();
}

if (strlen($password) < 6) {
    echo json_encode(['error' => 'Password must be at least 6 characters']);
    exit();
}

// Check if email already exists
$stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(['error' => 'Email already registered']);
    exit();
}

// Hash password
$password_hash = password_hash($password, PASSWORD_BCRYPT);

// Insert user
try {
    $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password_hash, username) VALUES (?, ?, ?, ?)");
    $username = explode('@', $email)[0] . rand(100, 999); // auto-generate username
    $stmt->execute([$full_name, $email, $password_hash, $username]);

    // Log activity
    $new_user_id = $pdo->lastInsertId();
    $pdo->prepare("INSERT INTO activity_log (actor_id, activity_type, description) VALUES (?, 'register', 'User registered')")
        ->execute([$new_user_id]);

    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully!',
        'user' => [
            'user_id' => $new_user_id,
            'full_name' => $full_name,
            'email' => $email,
            'username' => $username
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Registration failed. Try again.']);
}
?>