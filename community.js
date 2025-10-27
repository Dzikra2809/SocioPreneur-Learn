// Community forum functionality
class CommunityManager {
  constructor() {
    this.threads = this.loadThreads();
    this.renderThreads();
  }

  loadThreads() {
    const threads = localStorage.getItem('sociopreneur_threads');
    return threads ? JSON.parse(threads) : [
      {
        id: '1',
        title: 'Tips Memulai Social Enterprise di Indonesia',
        content: 'Halo semuanya! Saya ingin berbagi beberapa tips untuk memulai social enterprise di Indonesia berdasarkan pengalaman saya...',
        author: 'Sarah Entrepreneur',
        authorId: 'demo1',
        date: new Date(Date.now() - 86400000).toISOString(),
        likes: 15,
        replies: [
          {
            id: '1-1',
            content: 'Terima kasih untuk tipsnya! Sangat membantu untuk pemula seperti saya.',
            author: 'Budi Pemula',
            authorId: 'demo2',
            date: new Date(Date.now() - 43200000).toISOString(),
            likes: 3
          },
          {
            id: '1-2',
            content: 'Setuju! Terutama poin tentang pentingnya mengukur dampak sosial.',
            author: 'Lisa Impact',
            authorId: 'demo3',
            date: new Date(Date.now() - 21600000).toISOString(),
            likes: 2
          }
        ],
        tags: ['tips', 'pemula', 'indonesia']
      },
      {
        id: '2',
        title: 'Mencari Partner untuk Project Lingkungan',
        content: 'Saya sedang mengembangkan project untuk mengurangi sampah plastik. Ada yang tertarik untuk berkolaborasi?',
        author: 'Eco Warrior',
        authorId: 'demo4',
        date: new Date(Date.now() - 172800000).toISOString(),
        likes: 8,
        replies: [
          {
            id: '2-1',
            content: 'Saya tertarik! Bisa diskusi lebih lanjut via email?',
            author: 'Green Activist',
            authorId: 'demo5',
            date: new Date(Date.now() - 86400000).toISOString(),
            likes: 1
          }
        ],
        tags: ['kolaborasi', 'lingkungan', 'plastik']
      },
      {
        id: '3',
        title: 'Sharing: Pengalaman Mendapat Funding dari Impact Investor',
        content: 'Setelah 6 bulan pitching, akhirnya startup social saya mendapat funding! Ini pengalaman dan tips yang bisa saya bagikan...',
        author: 'Startup Founder',
        authorId: 'demo6',
        date: new Date(Date.now() - 259200000).toISOString(),
        likes: 23,
        replies: [],
        tags: ['funding', 'investor', 'startup']
      }
    ];
  }

  saveThreads() {
    localStorage.setItem('sociopreneur_threads', JSON.stringify(this.threads));
  }

  renderThreads(threadsToRender = this.threads) {
    const container = document.getElementById('threadsContainer');
    if (!container) return;

    if (threadsToRender.length === 0) {
      container.innerHTML = `
        <div class="text-center">
          <p>Belum ada thread diskusi.</p>
          <button class="btn btn--primary" onclick="communityManager.showNewThreadModal()">Buat Thread Pertama</button>
        </div>
      `;
      return;
    }

    container.innerHTML = threadsToRender.map(thread => `
      <div class="thread-card card">
        <div class="card__content">
          <div class="thread-header">
            <h3 class="thread-title">
              <a href="#" onclick="communityManager.showThreadDetail('${thread.id}')">${thread.title}</a>
            </h3>
            <div class="thread-meta">
              <span class="thread-author">oleh ${thread.author}</span>
              <span class="thread-date">${app.formatDate(thread.date)}</span>
            </div>
          </div>
          <p class="thread-content">${thread.content.substring(0, 200)}${thread.content.length > 200 ? '...' : ''}</p>
          <div class="thread-tags">
            ${thread.tags.map(tag => `<span class="badge">${tag}</span>`).join('')}
          </div>
          <div class="thread-stats">
            <button class="thread-like ${this.hasUserLiked(thread.id) ? 'liked' : ''}" 
                    onclick="communityManager.toggleLike('${thread.id}')">
              ❤️ ${thread.likes}
            </button>
            <span class="thread-replies">💬 ${thread.replies.length} balasan</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  showThreadDetail(threadId) {
    const thread = this.threads.find(t => t.id === threadId);
    if (!thread) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal__content" style="max-width: 800px;">
        <div class="modal__header">
          <h3>${thread.title}</h3>
          <button class="modal__close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal__body">
          <div class="thread-detail">
            <div class="thread-main">
              <div class="thread-author-info">
                <strong>${thread.author}</strong>
                <span class="text-muted">${app.formatDate(thread.date)}</span>
              </div>
              <div class="thread-content">${thread.content}</div>
              <div class="thread-tags">
                ${thread.tags.map(tag => `<span class="badge">${tag}</span>`).join('')}
              </div>
              <div class="thread-actions">
                <button class="btn btn--small ${this.hasUserLiked(thread.id) ? 'btn--primary' : 'btn--ghost'}" 
                        onclick="communityManager.toggleLike('${thread.id}')">
                  ❤️ ${thread.likes}
                </button>
              </div>
            </div>
            
            <div class="thread-replies">
              <h4>Balasan (${thread.replies.length})</h4>
              ${thread.replies.map(reply => `
                <div class="reply-item">
                  <div class="reply-author">
                    <strong>${reply.author}</strong>
                    <span class="text-muted">${app.formatDate(reply.date)}</span>
                  </div>
                  <div class="reply-content">${reply.content}</div>
                  <button class="btn btn--small btn--ghost" onclick="communityManager.toggleReplyLike('${thread.id}', '${reply.id}')">
                    ❤️ ${reply.likes}
                  </button>
                </div>
              `).join('')}
            </div>

            ${app.currentUser ? `
              <div class="reply-form">
                <h4>Tambah Balasan</h4>
                <form onsubmit="communityManager.addReply(event, '${thread.id}')">
                  <div class="form__group">
                    <textarea class="form__textarea" name="content" required 
                              placeholder="Tulis balasan Anda..."></textarea>
                  </div>
                  <button type="submit" class="btn btn--primary">Kirim Balasan</button>
                </form>
              </div>
            ` : `
              <div class="text-center mt-3">
                <p>Silakan <a href="login.html">login</a> untuk membalas thread ini.</p>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  showNewThreadModal() {
    if (!app.currentUser) {
      app.showNotification('Silakan login terlebih dahulu', 'warning');
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal__content">
        <div class="modal__header">
          <h3>Buat Thread Baru</h3>
          <button class="modal__close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal__body">
          <form id="newThreadForm" onsubmit="communityManager.createThread(event)">
            <div class="form__group">
              <label class="form__label">Judul Thread</label>
              <input type="text" class="form__input" name="title" required 
                     placeholder="Masukkan judul yang menarik">
            </div>
            <div class="form__group">
              <label class="form__label">Konten</label>
              <textarea class="form__textarea" name="content" required 
                        placeholder="Tulis konten thread Anda..." rows="6"></textarea>
            </div>
            <div class="form__group">
              <label class="form__label">Tags (pisahkan dengan koma)</label>
              <input type="text" class="form__input" name="tags" 
                     placeholder="contoh: tips, pemula, funding">
            </div>
          </form>
        </div>
        <div class="modal__footer">
          <button class="btn btn--ghost" onclick="this.closest('.modal').remove()">Batal</button>
          <button class="btn btn--primary" onclick="document.getElementById('newThreadForm').requestSubmit()">
            Buat Thread
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  createThread(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const title = formData.get('title');
    const content = formData.get('content');
    const tagsString = formData.get('tags');
    
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    const newThread = {
      id: Date.now().toString(),
      title,
      content,
      author: app.currentUser.name,
      authorId: app.currentUser.id,
      date: new Date().toISOString(),
      likes: 0,
      replies: [],
      tags
    };

    this.threads.unshift(newThread);
    this.saveThreads();
    this.renderThreads();

    app.addImpactPoints(15, 'Membuat thread diskusi');
    app.showNotification('Thread berhasil dibuat!', 'success');

    // Close modal
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
  }

  addReply(event, threadId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const content = formData.get('content');

    const thread = this.threads.find(t => t.id === threadId);
    if (!thread) return;

    const newReply = {
      id: `${threadId}-${Date.now()}`,
      content,
      author: app.currentUser.name,
      authorId: app.currentUser.id,
      date: new Date().toISOString(),
      likes: 0
    };

    thread.replies.push(newReply);
    this.saveThreads();

    app.addImpactPoints(10, 'Membalas thread diskusi');
    app.showNotification('Balasan berhasil ditambahkan!', 'success');

    // Refresh thread detail
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
    this.showThreadDetail(threadId);
  }

  toggleLike(threadId) {
    if (!app.currentUser) {
      app.showNotification('Silakan login terlebih dahulu', 'warning');
      return;
    }

    const thread = this.threads.find(t => t.id === threadId);
    if (!thread) return;

    const userLikes = this.getUserLikes();
    const likeKey = `thread_${threadId}`;

    if (userLikes.includes(likeKey)) {
      // Unlike
      thread.likes = Math.max(0, thread.likes - 1);
      const index = userLikes.indexOf(likeKey);
      userLikes.splice(index, 1);
    } else {
      // Like
      thread.likes += 1;
      userLikes.push(likeKey);
      app.addImpactPoints(2, 'Menyukai thread');
    }

    this.saveUserLikes(userLikes);
    this.saveThreads();
    this.renderThreads();

    // Update modal if open
    const modal = document.querySelector('.modal');
    if (modal) {
      this.showThreadDetail(threadId);
    }
  }

  toggleReplyLike(threadId, replyId) {
    if (!app.currentUser) {
      app.showNotification('Silakan login terlebih dahulu', 'warning');
      return;
    }

    const thread = this.threads.find(t => t.id === threadId);
    if (!thread) return;

    const reply = thread.replies.find(r => r.id === replyId);
    if (!reply) return;

    const userLikes = this.getUserLikes();
    const likeKey = `reply_${replyId}`;

    if (userLikes.includes(likeKey)) {
      // Unlike
      reply.likes = Math.max(0, reply.likes - 1);
      const index = userLikes.indexOf(likeKey);
      userLikes.splice(index, 1);
    } else {
      // Like
      reply.likes += 1;
      userLikes.push(likeKey);
      app.addImpactPoints(1, 'Menyukai balasan');
    }

    this.saveUserLikes(userLikes);
    this.saveThreads();

    // Refresh thread detail
    this.showThreadDetail(threadId);
  }

  hasUserLiked(threadId) {
    if (!app.currentUser) return false;
    const userLikes = this.getUserLikes();
    return userLikes.includes(`thread_${threadId}`);
  }

  getUserLikes() {
    if (!app.currentUser) return [];
    const likes = localStorage.getItem(`sociopreneur_likes_${app.currentUser.id}`);
    return likes ? JSON.parse(likes) : [];
  }

  saveUserLikes(likes) {
    if (!app.currentUser) return;
    localStorage.setItem(`sociopreneur_likes_${app.currentUser.id}`, JSON.stringify(likes));
  }

  searchThreads(query) {
    const filtered = app.searchItems(this.threads, query, ['title', 'content', 'author']);
    this.renderThreads(filtered);
  }

  filterThreadsByTag(tag) {
    if (!tag || tag === 'all') {
      this.renderThreads();
      return;
    }
    
    const filtered = this.threads.filter(thread => 
      thread.tags.some(threadTag => threadTag.toLowerCase().includes(tag.toLowerCase()))
    );
    this.renderThreads(filtered);
  }

  getAllTags() {
    const allTags = this.threads.flatMap(thread => thread.tags);
    return [...new Set(allTags)];
  }
}

// Initialize community manager
const communityManager = new CommunityManager();

// Community search and filter handlers
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('threadSearch');
  const tagFilter = document.getElementById('tagFilter');
  const newThreadBtn = document.getElementById('newThreadBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      communityManager.searchThreads(e.target.value);
    });
  }

  if (tagFilter) {
    const tags = communityManager.getAllTags();
    tagFilter.innerHTML = `
      <option value="all">Semua Tag</option>
      ${tags.map(tag => `<option value="${tag}">${tag}</option>`).join('')}
    `;
    
    tagFilter.addEventListener('change', (e) => {
      communityManager.filterThreadsByTag(e.target.value);
    });
  }

  if (newThreadBtn) {
    newThreadBtn.addEventListener('click', () => {
      communityManager.showNewThreadModal();
    });
  }
});