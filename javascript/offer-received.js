// Offers_Received.js
document.addEventListener("DOMContentLoaded", function () {
    console.log("Offers Received page loaded");

    const acceptButtons = document.querySelectorAll(".accept-btn");
    acceptButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            alert("You have accepted this offer!");
            // Add actual accept logic here later
        });
    });
});