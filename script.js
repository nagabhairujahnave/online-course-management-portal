// ===============================
// SEARCH COURSES
// ===============================

function searchCourses() {

    const searchInput =
        document.getElementById("searchBox");

    if (!searchInput) return;

    const searchText =
        searchInput.value.toLowerCase();

    const courses =
        document.getElementsByClassName("course-card");

    for (let i = 0; i < courses.length; i++) {

        const title =
            courses[i]
                .getElementsByTagName("h3")[0]
                .innerText
                .toLowerCase();

        courses[i].style.display =
            title.includes(searchText) ? "" : "none";
    }
}


// ===============================
// START LESSON
// ===============================

function startLesson(lessonNumber, courseId) {

    console.log(
        "Starting lesson:",
        lessonNumber,
        "Course:",
        courseId
    );

    localStorage.setItem(
        "currentLesson",
        lessonNumber
    );

    localStorage.setItem(
        "currentCourse",
        courseId
    );

    window.location.href = "lesson.html";
}


// ===============================
// COMPLETE LESSON
// ===============================

async function completeLesson() {

    const lessonNumber =
        Number(
            localStorage.getItem("currentLesson")
        );

    const courseId =
        Number(
            localStorage.getItem("currentCourse")
        );

    console.log(
        "Completing lesson:",
        lessonNumber,
        "Course:",
        courseId
    );


    if (!lessonNumber || !courseId) {

        alert(
            "Lesson information is missing."
        );

        return;
    }


    // Find the correct lesson
    // using BOTH course ID and lesson number

    const {
        data: lesson,
        error: lessonError
    } =
        await supabaseClient
            .from("lessons")
            .select("id, course_id, lesson_number")
            .eq("course_id", courseId)
            .eq("lesson_number", lessonNumber)
            .maybeSingle();


    console.log(
        "Lesson found:",
        lesson
    );


    if (lessonError) {

        console.error(
            "Error finding lesson:",
            lessonError
        );

        alert(
            "Error finding lesson."
        );

        return;
    }


    if (!lesson) {

        alert(
            "Lesson not found."
        );

        return;
    }


    // Save progress

    const {
        error: progressError
    } =
        await supabaseClient
            .from("progress")
            .upsert(
                {
                    student_name: "Student",
                    lesson_id: lesson.id,
                    completed: true,
                    completed_at:
                        new Date().toISOString()
                },
                {
                    onConflict:
                        "student_name,lesson_id"
                }
            );


    if (progressError) {

        console.error(
            "Error saving progress:",
            progressError
        );

        alert(
            "Progress could not be saved."
        );

        return;
    }


    console.log(
        "Progress saved successfully!"
    );


    // Local storage

    localStorage.setItem(
        "lesson_" +
        courseId +
        "_" +
        lessonNumber +
        "_Completed",
        "true"
    );


    // Update button

    const completeButton =
        document.getElementById(
            "completeButton"
        );


    if (completeButton) {

        completeButton.innerText =
            "✅ Lesson Completed";

        completeButton.disabled =
            true;

        completeButton.style.backgroundColor =
            "#16a34a";
    }


    const completionMessage =
        document.getElementById(
            "completionMessage"
        );


    if (completionMessage) {

        completionMessage.innerText =
            "Great job! Your progress has been saved.";

    }

}


// ===============================
// LOAD DASHBOARD PROGRESS
// ===============================

async function loadProgress() {

    const progressPercentage =
        document.getElementById(
            "progressPercentage"
        );


    // Only run on dashboard

    if (!progressPercentage) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("progress")
            .select("lesson_id, completed")
            .eq("student_name", "Student")
            .eq("completed", true);


    if (error) {

        console.error(
            "Error loading progress:",
            error
        );

        return;
    }


    const completed =
        data.length;


    // TOTAL = 12
    // 4 courses × 3 lessons

    const totalLessons = 12;


    const percentage =
        Math.round(
            (completed / totalLessons) * 100
        );


    // Percentage

    progressPercentage.innerText =
        percentage + "%";


    // Progress bar

    const progressFill =
        document.getElementById(
            "progressFill"
        );


    if (progressFill) {

        progressFill.style.width =
            percentage + "%";
    }


    // Completed text

    const completedText =
        document.getElementById(
            "completedText"
        );


    if (completedText) {

        completedText.innerText =
            completed +
            " of " +
            totalLessons +
            " lessons completed";
    }


    // Completed lessons

    const completedLessons =
        document.getElementById(
            "completedLessons"
        );


    if (completedLessons) {

        completedLessons.innerText =
            completed;
    }


    // Status

    const statusText =
        document.getElementById(
            "statusText"
        );


    if (statusText) {

        if (percentage === 0) {

            statusText.innerText =
                "Not Started";

        } else if (percentage === 100) {

            statusText.innerText =
                "Completed";

        } else {

            statusText.innerText =
                "In Progress";
        }
    }

}


// ===============================
// CONTINUE COURSE
// ===============================

function continueCourse() {

    window.location.href =
        "index.html";
}


// ===============================
// JOIN SESSION
// ===============================

function joinSession(sessionName) {

    alert(
        "You have joined the " +
        sessionName +
        " instructor session!"
    );
}


// ===============================
// STUDENT BUTTON
// ===============================

function showStudentRole() {

    alert(
        "Logged in as: Student"
    );
}


// ===============================
// LOAD COURSES FROM SUPABASE
// ===============================

async function loadCoursesFromSupabase() {

    const courseContainer =
        document.getElementById(
            "courseContainer"
        );


    if (!courseContainer) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("courses")
            .select("*")
            .order("id")
            .limit(4);


    if (error) {

        console.error(
            "Error loading courses:",
            error
        );

        return;
    }


    courseContainer.innerHTML = "";


    data.forEach(function(course) {

        courseContainer.innerHTML += `

            <div class="course-card">

                <div class="course-image">
                    ${course.icon || "📚"}
                </div>

                <div class="course-content">

                    <span class="category">
                        Course
                    </span>

                    <h3>
                        ${course.title}
                    </h3>

                    <p>
                        ${
                            course.description ||
                            "Learn this course."
                        }
                    </p>

                    <p class="instructor">
                        👨‍🏫 Instructor:
                        ${course.instructor}
                    </p>

                    <button
                        type="button"
                        onclick="window.location.href='course.html?id=${course.id}'">

                        View Course

                    </button>

                </div>

            </div>

        `;
    });

}


// ===============================
// LOAD SESSIONS
// ===============================

async function loadSessionsFromSupabase() {

    const sessionContainer =
        document.getElementById(
            "sessionContainer"
        );


    if (!sessionContainer) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("instructor_sessions")
            .select("*")
            .order("id");


    if (error) {

        console.error(
            "Error loading sessions:",
            error
        );

        return;
    }


    sessionContainer.innerHTML = "";


    data.forEach(function(session) {

        sessionContainer.innerHTML += `

            <div class="session-card">

                <div class="session-icon">
                    📅
                </div>

                <div class="session-info">

                    <h2>
                        ${session.title}
                    </h2>

                    <p>
                        <strong>Instructor:</strong>
                        ${session.instructor}
                    </p>

                    <p>
                        <strong>Date:</strong>
                        ${session.date}
                    </p>

                    <p>
                        <strong>Time:</strong>
                        ${session.time}
                    </p>

                    <span class="session-status">
                        Upcoming
                    </span>

                </div>

                <button
                    type="button"
                    onclick="joinSession('${session.title}')">

                    Join Session

                </button>

            </div>

        `;
    });

}


// ===============================
// RUN
// ===============================

loadProgress();

loadCoursesFromSupabase();

loadSessionsFromSupabase();