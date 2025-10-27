// Course management functionality
class CourseManager {
  constructor() {
    this.courses = [];
    this.loadCourses();
  }

  async loadCourses() {
    try {
      const response = await fetch('../data/mock-courses.json');
      this.courses = await response.json();
      this.renderCourses();
    } catch (error) {
      console.error('Error loading courses:', error);
      // app.showNotification('Gagal memuat data kursus', 'error');
    }
  }

  renderCourses(coursesToRender = this.courses) {
    const container = document.getElementById('coursesContainer');
    if (!container) return;

    if (coursesToRender.length === 0) {
      container.innerHTML = `
        <div class="text-center">
          <p>Tidak ada kursus yang ditemukan.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = coursesToRender.map(course => `
      <div class="card fade-in">
        <img src="${course.image}" alt="${course.title}" class="card__image" 
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGOUZBIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IlBvcHBpbnMsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiPkNvdXJzZSBJbWFnZTwvdGV4dD4KPHN2Zz4='">
        <div class="card__content">
          <div class="card__badge card__badge--${course.type}">${course.type === 'free' ? 'Gratis' : 'Premium'}</div>
          <h3 class="card__title">${course.title}</h3>
          <p class="card__text">${course.description}</p>
          <div class="course-meta">
            <div class="course-meta__item">
              <strong>Instruktur:</strong> ${course.instructor}
            </div>
            <div class="course-meta__item">
              <strong>Durasi:</strong> ${course.duration}
            </div>
            <div class="course-meta__item">
              <strong>Level:</strong> ${course.level}
            </div>
            <div class="course-meta__item">
              <div class="rating">
                ${'★'.repeat(Math.floor(course.rating))} ${course.rating} (${course.students} siswa)
              </div>
            </div>
          </div>
          <div class="card__footer">
            <div class="card__price">
              ${course.price === 0 ? 'Gratis' : app.formatPrice(course.price)}
            </div>
            <a href="course-detail.html?id=${course.id}" class="btn btn--primary">Lihat Detail</a>
          </div>
        </div>
      </div>
    `).join('');
  }

  searchCourses(query) {
    const filtered = app.searchItems(this.courses, query, ['title', 'description', 'instructor', 'category']);
    this.renderCourses(filtered);
  }

  filterCourses(type) {
    let filtered = this.courses;
    if (type !== 'all') {
      filtered = this.courses.filter(course => course.type === type);
    }
    this.renderCourses(filtered);
  }

  getCourseById(id) {
    return this.courses.find(course => course.id === id);
  }

  enrollCourse(courseId) {
    if (!app.currentUser) {
      app.showNotification('Silakan login terlebih dahulu', 'warning');
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    const course = this.getCourseById(courseId);
    if (!course) {
      app.showNotification('Kursus tidak ditemukan', 'error');
      return;
    }

    // Check if already enrolled
    if (app.currentUser.enrolledCourses.includes(courseId)) {
      app.showNotification('Anda sudah terdaftar di kursus ini', 'warning');
      return;
    }

    // For premium courses, simulate payment
    if (course.type === 'premium') {
      this.showPaymentModal(course);
      return;
    }

    // Enroll in free course
    this.completeEnrollment(courseId);
  }

  showPaymentModal(course) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal__content">
        <div class="modal__header">
          <h3>Pembayaran Kursus</h3>
          <button class="modal__close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal__body">
          <h4>${course.title}</h4>
          <p>Harga: ${app.formatPrice(course.price)}</p>
          <p>Ini adalah simulasi pembayaran. Klik "Bayar Sekarang" untuk melanjutkan.</p>
          <div class="form__group">
            <label class="form__label">Metode Pembayaran</label>
            <select class="form__select">
              <option>Transfer Bank</option>
              <option>E-Wallet</option>
              <option>Kartu Kredit</option>
            </select>
          </div>
        </div>
        <div class="modal__footer">
          <button class="btn btn--ghost" onclick="this.closest('.modal').remove()">Batal</button>
          <button class="btn btn--primary" onclick="courseManager.completePayment('${course.id}')">Bayar Sekarang</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  completePayment(courseId) {
    // Simulate payment processing
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();

    app.showNotification('Pembayaran berhasil!', 'success');
    this.completeEnrollment(courseId);
  }

  completeEnrollment(courseId) {
    app.currentUser.enrolledCourses.push(courseId);
    authManager.updateUser(app.currentUser.id, app.currentUser);
    app.addImpactPoints(25, 'Mendaftar kursus baru');
    
    app.showNotification('Berhasil mendaftar kursus!', 'success');
    
    // Update UI
    const enrollBtn = document.querySelector('.enroll-btn');
    if (enrollBtn) {
      enrollBtn.textContent = 'Sudah Terdaftar';
      enrollBtn.disabled = true;
      enrollBtn.className = 'btn btn--ghost';
    }
  }

  completeModule(courseId, moduleId) {
    if (!app.currentUser) return;

    const course = this.getCourseById(courseId);
    if (!course) return;

    const module = course.modules.find(m => m.id === moduleId);
    if (!module) return;

    module.completed = true;
    app.addImpactPoints(10, `Menyelesaikan modul: ${module.title}`);

    // Check if course is completed
    const allModulesCompleted = course.modules.every(m => m.completed);
    if (allModulesCompleted && !app.currentUser.completedCourses.includes(courseId)) {
      app.currentUser.completedCourses.push(courseId);
      authManager.updateUser(app.currentUser.id, app.currentUser);
      app.addImpactPoints(100, `Menyelesaikan kursus: ${course.title}`);
      app.showNotification('Selamat! Anda telah menyelesaikan kursus ini!', 'success');
    }

    // Save progress
    authManager.updateUser(app.currentUser.id, app.currentUser);
  }

  takeQuiz(courseId, answers) {
    const course = this.getCourseById(courseId);
    if (!course || !course.quiz) return;

    let score = 0;
    const totalQuestions = course.quiz.questions.length;

    course.quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correct) {
        score++;
      }
    });

    const percentage = (score / totalQuestions) * 100;
    const passed = percentage >= 70;

    if (passed) {
      app.addImpactPoints(20, `Lulus kuis: ${course.title}`);
      app.showNotification(`Selamat! Anda lulus dengan skor ${percentage.toFixed(0)}%`, 'success');
    } else {
      app.showNotification(`Skor Anda ${percentage.toFixed(0)}%. Minimal 70% untuk lulus.`, 'warning');
    }

    return { score, totalQuestions, percentage, passed };
  }
}

// Initialize course manager
const courseManager = new CourseManager();

// Course search and filter handlers
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('courseSearch');
  const filterSelect = document.getElementById('courseFilter');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      courseManager.searchCourses(e.target.value);
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      courseManager.filterCourses(e.target.value);
    });
  }

  // Course detail page initialization
  if (window.location.pathname.includes('course-detail.html')) {
    initCourseDetail();
  }
});

// Course detail page functionality
function initCourseDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  if (!courseId) {
    app.showNotification('ID kursus tidak valid', 'error');
    window.location.href = 'courses.html';
    return;
  }

  const course = courseManager.getCourseById(courseId);
  if (!course) {
    app.showNotification('Kursus tidak ditemukan', 'error');
    window.location.href = 'courses.html';
    return;
  }

  renderCourseDetail(course);
}

function renderCourseDetail(course) {
  const container = document.getElementById('courseDetailContainer');
  if (!container) return;

  const isEnrolled = app.currentUser && app.currentUser.enrolledCourses.includes(course.id);
  const isCompleted = app.currentUser && app.currentUser.completedCourses.includes(course.id);

  container.innerHTML = `
    <div class="course-detail">
      <div class="course-detail__header">
        <img src="${course.image}" alt="${course.title}" class="course-detail__image"
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjhGOUZBIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTI1IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IlBvcHBpbnMsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiPkNvdXJzZSBJbWFnZTwvdGV4dD4KPHN2Zz4='">
        <div class="course-detail__info">
          <div class="badge badge--${course.type}">${course.type === 'free' ? 'Gratis' : 'Premium'}</div>
          <h1>${course.title}</h1>
          <p class="course-detail__description">${course.description}</p>
          <div class="course-detail__meta">
            <div><strong>Instruktur:</strong> ${course.instructor}</div>
            <div><strong>Durasi:</strong> ${course.duration}</div>
            <div><strong>Level:</strong> ${course.level}</div>
            <div><strong>Rating:</strong> ${'★'.repeat(Math.floor(course.rating))} ${course.rating} (${course.students} siswa)</div>
          </div>
          <div class="course-detail__price">
            ${course.price === 0 ? 'Gratis' : app.formatPrice(course.price)}
          </div>
          ${isCompleted ? 
            '<button class="btn btn--success" disabled>Kursus Selesai</button>' :
            isEnrolled ? 
              '<button class="btn btn--ghost" disabled>Sudah Terdaftar</button>' :
              `<button class="btn btn--primary enroll-btn" onclick="courseManager.enrollCourse('${course.id}')">
                ${course.price === 0 ? 'Daftar Gratis' : 'Beli Kursus'}
              </button>`
          }
        </div>
      </div>

      <div class="course-detail__content">
        <div class="course-modules">
          <h3>Materi Kursus</h3>
          ${course.modules.map((module, index) => `
            <div class="module-item ${module.completed ? 'completed' : ''}">
              <div class="module-item__header">
                <h4>${module.title}</h4>
                <span class="module-item__duration">${module.duration}</span>
              </div>
              ${isEnrolled ? `
                <div class="module-item__content">
                  <iframe src="${module.video}" frameborder="0" allowfullscreen></iframe>
                  ${!module.completed ? `
                    <button class="btn btn--small btn--primary" 
                            onclick="courseManager.completeModule('${course.id}', '${module.id}')">
                      Tandai Selesai
                    </button>
                  ` : '<div class="badge badge--success">Selesai</div>'}
                </div>
              ` : '<p class="text-muted">Daftar kursus untuk mengakses video</p>'}
            </div>
          `).join('')}
        </div>

        ${isEnrolled && course.quiz ? `
          <div class="course-quiz">
            <h3>Kuis Akhir</h3>
            <form id="quizForm" onsubmit="handleQuizSubmit(event, '${course.id}')">
              ${course.quiz.questions.map((question, qIndex) => `
                <div class="quiz-question">
                  <h4>${question.question}</h4>
                  ${question.options.map((option, oIndex) => `
                    <label class="quiz-option">
                      <input type="radio" name="question_${qIndex}" value="${oIndex}">
                      ${option}
                    </label>
                  `).join('')}
                </div>
              `).join('')}
              <button type="submit" class="btn btn--primary">Kirim Jawaban</button>
            </form>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function handleQuizSubmit(event, courseId) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const answers = [];
  
  // Collect answers
  let questionIndex = 0;
  while (formData.has(`question_${questionIndex}`)) {
    answers.push(parseInt(formData.get(`question_${questionIndex}`)));
    questionIndex++;
  }

  const result = courseManager.takeQuiz(courseId, answers);
  
  // Show result
  const resultDiv = document.createElement('div');
  resultDiv.className = `alert alert--${result.passed ? 'success' : 'warning'}`;
  resultDiv.innerHTML = `
    <h4>Hasil Kuis</h4>
    <p>Skor: ${result.score}/${result.totalQuestions} (${result.percentage.toFixed(0)}%)</p>
    <p>${result.passed ? 'Selamat! Anda lulus kuis ini.' : 'Anda perlu skor minimal 70% untuk lulus.'}</p>
  `;
  
  event.target.parentNode.insertBefore(resultDiv, event.target);
  event.target.style.display = 'none';
}