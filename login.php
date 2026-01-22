<?php
session_start();
include 'db_conn.php';

if (isset($_POST['login_btn'])) {

    // 1. Get Data from Form
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    // 2. Validate Empty Fields
    if (empty($email) || empty($password)) {
        echo "<script>alert('Please fill in all fields'); window.location='login.html';</script>";
        exit();
    }

    try {
        // 3. Check Database for User
        // Note: We select password_hash, user_id, role, and full_name
        $stmt = $conn->prepare("SELECT user_id, full_name, password_hash, role FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // 4. Verify User Exists AND Password is Correct
        // password_verify() checks the plain text password against the hash in DB
        if ($user && password_verify($password, $user['password_hash'])) {

            // --- SUCCESS: LOG IN ---
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['full_name'] = $user['full_name'];

            // 5. Redirect based on Role (with LocalStorage update for frontend JS)
            $redirect_url = ($user['role'] === 'admin') ? 'admin-dashboard.html' : 'index.html';
            
            echo "<script>
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userName', '" . addslashes($user['full_name']) . "');
                localStorage.setItem('userRole', '" . $user['role'] . "');
                window.location.href = '$redirect_url';
            </script>";
            exit();
        } else {
            // --- FAILURE: Wrong Email or Password ---
            echo "<script>alert('Invalid Email or Password'); window.location='login.html';</script>";
            exit();
        }
    } catch (PDOException $e) {
        // If DB column name is wrong (e.g., using 'password' instead of 'password_hash'), show error
        echo "Database Error: " . $e->getMessage();
    }
} else {
    header("Location: login.html");
    exit();
}
