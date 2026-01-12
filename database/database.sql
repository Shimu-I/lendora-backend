-- Database Creation
CREATE DATABASE IF NOT EXISTS anchor_db;
USE anchor_db;

-- Users Table
-- Stores student and admin user information. Assumes one user can have multiple roles, but simplified to a single role enum for 3NF compliance.
-- All non-key attributes depend directly on user_id (no transitive dependencies).
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50),
    university VARCHAR(100),
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan Requests Table
-- Stores peer-to-peer loan requests. Status tracks lifecycle.
-- All attributes depend on loan_id; borrower_id is a direct FK dependency.
CREATE TABLE loan_requests (
    loan_id INT AUTO_INCREMENT PRIMARY KEY,
    borrower_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    purpose TEXT NOT NULL,
    repayment_plan TEXT NOT NULL,
    interest_rate DECIMAL(5, 2) DEFAULT 0.00,
    status ENUM('pending', 'approved', 'funded', 'repaid', 'defaulted') DEFAULT 'pending',
    approved_by INT,
    approval_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (borrower_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Crowdfunding Posts Table
-- Stores crowdfunding campaigns. Similar structure to loans but without repayment specifics.
-- All attributes depend on post_id; creator_id is a direct FK dependency.
CREATE TABLE crowdfunding_posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    amount_needed DECIMAL(10, 2) NOT NULL,
    category ENUM('emergency', 'medical', 'relief', 'personal') NOT NULL,
    status ENUM('open', 'closed', 'funded') DEFAULT 'open',
    approved_by INT,
    approval_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Documents Table
-- Stores verification documents linked to either loans or crowdfunding posts (polymorphic via reference_type).
-- To maintain 3NF, reference_id and reference_type form a composite dependency; no transitives as attributes describe the document directly.
CREATE TABLE documents (
    doc_id INT AUTO_INCREMENT PRIMARY KEY,
    reference_id INT NOT NULL,
    reference_type ENUM('loan', 'crowdfund') NOT NULL,
    doc_type ENUM('student_id', 'bill', 'proof', 'other') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- Note: FK constraints enforced in application logic due to polymorphism; avoids partial dependencies.
);

-- Contributions Table
-- Stores donations/lending contributions to either loans or crowdfunding.
-- Polymorphic similar to documents. Attributes depend on contrib_id.
CREATE TABLE contributions (
    contrib_id INT AUTO_INCREMENT PRIMARY KEY,
    contributor_id INT NOT NULL,
    reference_id INT NOT NULL,
    reference_type ENUM('loan', 'crowdfund') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    contrib_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contributor_id) REFERENCES users(user_id) ON DELETE CASCADE
    -- Polymorphic FK enforced in app.
);

-- Repayments Table
-- Stores repayments specific to loans (no polymorphism needed here).
-- All attributes depend on repay_id; loan_id is direct FK.
CREATE TABLE repayments (
    repay_id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    repay_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loan_requests(loan_id) ON DELETE CASCADE
);

-- Ratings Table
-- Stores ratings/reviews post-repayment for loans.
-- Attributes depend on rating_id; FKs are direct dependencies without transitives.
CREATE TABLE ratings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    rater_id INT NOT NULL,  -- Lender/Donor
    ratee_id INT NOT NULL,  -- Borrower/Creator
    loan_id INT,  -- Optional if extending to crowdfunding, but focused on loans
    score INT CHECK (score BETWEEN 1 AND 5),
    review TEXT,
    rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rater_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (ratee_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (loan_id) REFERENCES loan_requests(loan_id) ON DELETE SET NULL
);

-- Indexes for Performance (Optional but recommended for clean organization)
CREATE INDEX idx_loan_borrower ON loan_requests(borrower_id);
CREATE INDEX idx_post_creator ON crowdfunding_posts(creator_id);
CREATE INDEX idx_contrib_contributor ON contributions(contributor_id);
CREATE INDEX idx_rating_rater ON ratings(rater_id);
CREATE INDEX idx_rating_ratee ON ratings(ratee_id);

-- Sample Data Insertion (To create a basic dataset for testing)
-- Users
INSERT INTO users (username, email, password_hash, full_name, student_id, university, verification_status, role)
VALUES 
('john_doe', 'john@example.com', 'hashed_password1', 'John Doe', 'SID123', 'University A', 'verified', 'student'),
('jane_admin', 'jane@example.com', 'hashed_password2', 'Jane Admin', NULL, NULL, 'verified', 'admin'),
('alice_borrower', 'alice@example.com', 'hashed_password3', 'Alice Borrower', 'SID456', 'University B', 'verified', 'student');

-- Loan Requests
INSERT INTO loan_requests (borrower_id, amount, purpose, repayment_plan, status, approved_by)
VALUES 
(1, 500.00, 'Textbooks', 'Monthly installments over 6 months', 'approved', 2);

-- Crowdfunding Posts
INSERT INTO crowdfunding_posts (creator_id, title, description, amount_needed, category, status, approved_by)
VALUES 
(3, 'Emergency Medical Help', 'Need funds for surgery', 1000.00, 'medical', 'open', 2);

-- Documents
INSERT INTO documents (reference_id, reference_type, doc_type, file_path, verified)
VALUES 
(1, 'loan', 'student_id', '/docs/student_id.jpg', TRUE),
(1, 'crowdfund', 'bill', '/docs/medical_bill.pdf', TRUE);

-- Contributions
INSERT INTO contributions (contributor_id, reference_id, reference_type, amount)
VALUES 
(1, 1, 'loan', 200.00),
(1, 1, 'crowdfund', 50.00);

-- Repayments
INSERT INTO repayments (loan_id, amount)
VALUES 
(1, 100.00);

-- Ratings
INSERT INTO ratings (rater_id, ratee_id, loan_id, score, review)
VALUES 
(1, 3, 1, 5, 'Reliable borrower');