
const nameElement = document.getElementById("studentName");

async function loadDashboard() {
  try {
    const response = await fetch("/api/me");

    if (!response.ok) {
      window.location.href = "/login";
      return;
    }

    const student = await response.json();

    nameElement.textContent = student.name;
    document.getElementById("fullName").textContent = student.name;
    document.getElementById("studentEmail").textContent = student.email;
    document.getElementById("studentCourse").textContent =
      student.course || "Not added";
    document.getElementById("studentCollege").textContent =
      student.college || "Not added";
    document.getElementById("studentBio").textContent = student.bio;

    document.getElementById("avatar").textContent =
      student.name.charAt(0).toUpperCase();

    document.getElementById("joinedDate").textContent =
      new Date(student.createdAt).toLocaleDateString();

  } catch (error) {
    console.error("Dashboard error:", error);
    nameElement.textContent = "Unable to load profile";
  }
}

document.getElementById("logoutButton").addEventListener("click", async () => {
  try {
    const response = await fetch("/api/logout", {
      method: "POST"
    });

    if (response.ok) {
      window.location.href = "/login";
    }
  } catch (error) {
    alert("Unable to logout. Please try again.");
  }
});

loadDashboard();
