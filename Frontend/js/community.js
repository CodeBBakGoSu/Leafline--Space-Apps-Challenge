document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/community/posts'; // Vercel 프록시 사용

    const postList = document.getElementById('post-list');
    const modal = document.getElementById('post-modal');
    const writePostBtn = document.getElementById('write-post-btn');
    const closeBtn = document.querySelector('.close-btn');
    const postForm = document.getElementById('post-form');

    // --- Event Listeners ---

    // Fetch posts on page load
    fetchPosts();

    // Open modal when 'Write Post' is clicked
    writePostBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Close modal via the close button
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal by clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Handle new post form submission
    postForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        
        // IMPORTANT: Hardcoding author_id to 1 as there is no login system.
        // This should be replaced with the actual logged-in user's ID.
        const authorId = 1;

        const newPost = {
            title: title,
            content: content,
            author_id: authorId
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPost),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create post');
            }

            // On success
            modal.style.display = 'none';
            postForm.reset();
            fetchPosts(); // Refresh post list

        } catch (error) {
            console.error('Error creating post:', error);
            alert('Error creating post: ' + error.message);
        }
    });


    // --- Functions ---

    /**
     * Fetches the list of posts from the API and renders them.
     */
    async function fetchPosts() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const posts = await response.json();
            renderPosts(posts);
        } catch (error) {
            console.error('Error fetching posts:', error);
            postList.innerHTML = '<li>Failed to load posts. Please check the backend server and CORS settings.</li>';
        }
    }

    /**
     * Renders an array of post objects into HTML and adds them to the list.
     * @param {Array} posts - Array of post objects.
     */
    function renderPosts(posts) {
        postList.innerHTML = ''; // Clear the list

        if (posts.length === 0) {
            postList.innerHTML = '<li>No posts yet. Be the first to write one!</li>';
            return;
        }

        // Sort posts by newest first
        posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        posts.forEach(post => {
            const postItem = document.createElement('li');
            postItem.className = 'post-item';

            const postDate = new Date(post.created_at).toLocaleString();

            postItem.innerHTML = `
                <h3>${post.title}</h3>
                <div class="post-meta">
                    By <span class="author">${post.author.username}</span> on ${postDate}
                </div>
            `;
            postList.appendChild(postItem);
        });
    }
});